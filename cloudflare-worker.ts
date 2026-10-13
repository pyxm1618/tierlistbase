import vinextWorker from "vinext/server/fetch-handler";

import { runWithRequestDatabase } from "./src/platform/database/application-database";

type WorkerContext = { waitUntil(promise: Promise<unknown>): void };

const worker = {
  fetch(request: Request, env: Record<string, unknown>, ctx: WorkerContext): Promise<Response> {
    return runWithRequestDatabase(async (closeDatabase) => {
      const backgroundWork: Promise<unknown>[] = [];
      const requestContext = {
        ...ctx,
        waitUntil(promise: Promise<unknown>) {
          backgroundWork.push(promise);
          ctx.waitUntil(promise);
        },
      };
      const close = async () => {
        // Each background rejection is still reported by the original waitUntil.
        await Promise.allSettled(backgroundWork);
        await closeDatabase();
      };

      let response: Response;
      try {
        response = await vinextWorker.fetch(request, env, requestContext);
      } catch (error) {
        await close();
        throw error;
      }
      if (!response.body) {
        await close();
        return response;
      }

      const stream = new TransformStream<Uint8Array, Uint8Array>();
      ctx.waitUntil(response.body.pipeTo(stream.writable).finally(close));
      return new Response(stream.readable, response);
    });
  },
};

export default worker;
