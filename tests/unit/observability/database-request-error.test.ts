import { expect, it, vi } from "vitest";

import { onRequestError } from "../../../src/instrumentation";

it("records the underlying socket cause without logging SQL parameters or connection secrets", () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const cause = new Error(
      "Cannot perform I/O on behalf of a different request. I/O type: Writable",
    );
    const error = new Error("Failed query: select secret\nparams: private-value", { cause });
    onRequestError(error, {
      path: "/wow-forever/tier-list",
      headers: { "x-runtime-probe": "probe-1" },
    });
    const recorded = JSON.stringify(log.mock.calls);
    expect(recorded).toContain(cause.message);
    expect(recorded).toContain("probe-1");
    expect(recorded).not.toContain("private-value");
    expect(recorded).not.toContain("select secret");
    log.mockClear();
    onRequestError(new Error("connection postgres://user:secret@host/db failed"), {
      path: "/",
      headers: {},
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("user:secret");
  } finally {
    log.mockRestore();
  }
});
