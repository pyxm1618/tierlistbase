import vinextWorker from "vinext/server/fetch-handler";

import { runWithRequestDatabase } from "./src/platform/database/application-database";

type WorkerContext = { waitUntil(promise: Promise<unknown>): void };

const worker = {
  fetch(request: Request, env: Record<string, unknown>, ctx: WorkerContext): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    const isPublicPageRead =
      request.method === "GET" &&
      ["/", "/genshin-impact/tier-list", "/wow-forever/tier-list"].includes(pathname);
    // These request-local reads are faster reusing one socket than opening another
    // connection for the parallel evidence/history branch. Other routes keep max=5.
    const render = async (closeDatabase: () => Promise<void>) => {
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

      if (pathname === "/sitemap.xml" && response.status === 200) {
        const headers = new Headers(response.headers);
        headers.set("content-type", "application/xml; charset=utf-8");
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      if (!response.body) {
        await close();
        return response;
      }

      const stream = new TransformStream<Uint8Array, Uint8Array>();
      ctx.waitUntil(response.body.pipeTo(stream.writable).finally(close));
      return new Response(stream.readable, response);
    };
    return runWithRequestDatabase(render, isPublicPageRead ? 1 : 5);
  },
};

export default worker;
