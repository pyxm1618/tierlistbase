import { parseVanguardResponse, manifestResponse } from "./response";
import type { VanguardManifest } from "./contracts";
export class VanguardClientError extends Error {
  constructor(
    readonly code: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(code);
  }
}
export async function vanguardRequest<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/vanguard/${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      cache: "no-store",
      ...(body === undefined
        ? {}
        : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new VanguardClientError("SERVICE_UNAVAILABLE");
  }
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new VanguardClientError("SERVICE_UNAVAILABLE");
  }
  if (!response.ok) {
    const error = (value as { error?: { code?: unknown } })?.error;
    throw new VanguardClientError(
      typeof error?.code === "string" ? error.code : "SERVICE_UNAVAILABLE",
      (error as Record<string, unknown>) ?? {},
    );
  }
  try {
    return parseVanguardResponse(path, value) as T;
  } catch {
    throw new VanguardClientError("SERVICE_UNAVAILABLE");
  }
}
export function pollVanguardManifest(
  initial: VanguardManifest,
  onManifest: (manifest: VanguardManifest) => void,
  onError: (error: unknown) => void,
) {
  let version = initial.version;
  let stopped = false;
  const abort = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const poll = async () => {
    try {
      const response = await fetch("/api/vanguard/manifest", {
        headers: { "If-None-Match": `"${version}"` },
        signal: abort.signal,
      });
      if (response.status !== 304) {
        if (!response.ok) throw new VanguardClientError("SERVICE_UNAVAILABLE");
        const manifest = manifestResponse.parse(await response.json());
        if (!stopped) {
          version = manifest.version;
          onManifest(manifest);
        }
      }
    } catch (error) {
      if (!stopped) onError(error);
    } finally {
      if (!stopped) timer = setTimeout(poll, 15000);
    }
  };
  timer = setTimeout(poll, 15000);
  return () => {
    stopped = true;
    clearTimeout(timer);
    abort.abort();
  };
}
