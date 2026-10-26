import dns from "node:dns";
import { EventEmitter, getEventListeners } from "node:events";
import { createServer, type Server } from "node:http";
import { afterEach, expect, it, vi } from "vitest";
import { bindCallbackServer, callbackPorts } from "./ports.js";

vi.mock("node:crypto", () => ({ randomInt: () => 0 }));

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve());
          server.closeAllConnections();
        }),
    ),
  );
});

it("visits every registered port exactly once, wrapping at the upper boundary", () => {
  const ports = callbackPorts(50);
  expect(ports.slice(0, 3)).toEqual([59450, 59400, 59401]);
  expect(ports.toSorted()).toEqual(Array.from({ length: 51 }, (_, index) => 59400 + index));
});

it("retains a successful bind and moves past an occupied port", async () => {
  const occupied = createServer();
  const listener = createServer();
  servers.push(occupied, listener);
  const occupiedRedirect = await bindCallbackServer(occupied, new AbortController().signal);
  const redirect = await bindCallbackServer(listener, new AbortController().signal);
  expect(redirect).toMatchObject({ protocol: "http:", hostname: "localhost", pathname: "/" });
  expect(redirect.port).not.toBe(occupiedRedirect.port);
  expect(Number(redirect.port)).toBeGreaterThanOrEqual(59400);
  expect(Number(redirect.port)).toBeLessThanOrEqual(59450);
  expect(listener.listening).toBe(true);
});

const failingServer = (code: string) => {
  const server = new EventEmitter() as Server;
  server.listen = vi.fn().mockImplementation(() => {
    queueMicrotask(() => server.emit("error", Object.assign(new Error(code), { code })));
    return server;
  });
  return server;
};

it("tries all 51 unique ports on address collisions and reports exhaustion", async () => {
  const server = failingServer("EADDRINUSE");
  await expect(bindCallbackServer(server, new AbortController().signal)).rejects.toThrow(
    "59400–59450",
  );
  const attempted = vi
    .mocked(server.listen)
    .mock.calls.map(([options]) => (options as { port: number }).port);
  expect(attempted).toEqual(callbackPorts(0));
});

it("does not retry permission or address errors", async () => {
  const server = failingServer("EACCES");
  await expect(bindCallbackServer(server, new AbortController().signal)).rejects.toThrow("EACCES");
  expect(server.listen).toHaveBeenCalledOnce();
});

it("does not bind when already cancelled", async () => {
  const server = failingServer("EADDRINUSE");
  await expect(
    bindCallbackServer(server, AbortSignal.abort(new Error("cancelled"))),
  ).rejects.toThrow("cancelled");
  expect(server.listen).not.toHaveBeenCalled();
});

it("releases abort listeners across many real port collisions", async () => {
  // Leave most of the range available to other concurrent login tests.
  for (let port = 59400; port < 59412; port += 1) {
    const occupied = createServer();
    servers.push(occupied);
    await new Promise<void>((resolve, reject) => {
      occupied.once("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") resolve();
        else reject(error);
      });
      occupied.listen(port, "localhost", resolve);
    });
  }
  const listener = createServer();
  servers.push(listener);
  const initialCloseListeners = listener.listenerCount("close");
  const abort = new AbortController();
  const redirect = await bindCallbackServer(listener, abort.signal);
  expect(Number(redirect.port)).toBeGreaterThanOrEqual(59412);
  expect(getEventListeners(abort.signal, "abort")).toHaveLength(0);
  expect(listener.listenerCount("close")).toBe(initialCloseListeners);
});

it("cancels pending hostname resolution without a late bind", async () => {
  const server = createServer();
  servers.push(server);
  let finishLookup!: () => void;
  vi.spyOn(dns, "lookup").mockImplementationOnce((_host, _options, callback) => {
    finishLookup = () => callback(null, [{ address: "127.0.0.1", family: 4 }] as never);
    return undefined as never;
  });
  const abort = new AbortController();
  const binding = bindCallbackServer(server, abort.signal);
  const rejected = expect(binding).rejects.toThrow("cancelled during lookup");
  abort.abort(new Error("cancelled during lookup"));
  await rejected;
  finishLookup();
  await new Promise<void>((resolve) => setImmediate(resolve));
  expect(server.listening).toBe(false);
  expect(getEventListeners(abort.signal, "abort")).toHaveLength(0);
});
