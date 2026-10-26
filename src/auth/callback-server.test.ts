import { request } from "node:http";
import { connect, type Socket } from "node:net";
import { afterEach, expect, it } from "vitest";
import { type CallbackServer, createCallbackServer } from "./callback-server.js";

const callbacks: CallbackServer[] = [];
const sockets: Socket[] = [];
afterEach(async () => {
  sockets.splice(0).forEach((socket) => {
    socket.destroy();
  });
  await Promise.all(callbacks.splice(0).map((callback) => callback.close()));
});

const setup = async () => {
  const controller = new AbortController();
  const callback = await createCallbackServer({ state: "expected", signal: controller.signal });
  callbacks.push(callback);
  return { callback, controller };
};

const visit = (url: string, options: { method?: string; host?: string } = {}) =>
  new Promise<{ status: number; headers: Record<string, unknown>; body: string }>(
    (resolve, reject) => {
      const req = request(
        url,
        {
          method: options.method ?? "GET",
          headers: options.host ? { Host: options.host } : undefined,
          agent: false,
        },
        (response) => {
          let body = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => {
            body += chunk;
          });
          response.on("end", () =>
            resolve({ status: response.statusCode ?? 0, headers: response.headers, body }),
          );
        },
      );
      req.once("error", reject);
      req.end();
    },
  );

it("accepts a decoded code once and reports success only after completion", async () => {
  const { callback } = await setup();
  let responded = false;
  const browser = visit(`${callback.redirectUri}?state=expected&code=a%2Bb%2Fc%3D`).then(
    (value) => {
      responded = true;
      return value;
    },
  );
  await expect(callback.code).resolves.toBe("a+b/c=");
  expect(responded).toBe(false);
  await callback.complete(true);
  const response = await browser;
  expect(response.status).toBe(302);
  expect(response.headers.location).toBe("https://prismatic.io");
  expect(response.headers["cache-control"]).toBe("no-store");
  expect(response.headers["referrer-policy"]).toBe("no-referrer");
  expect(response.body).not.toContain("a+b/c=");
});

it.each([
  ["favicon.ico", {}],
  ["?state=wrong&code=abc", {}],
  ["?state=expected&state=expected&code=abc", {}],
  ["?state=expected&code=first&code=second", {}],
  ["?state=expected&code=abc&error=denied", {}],
  ["?state=expected&code=", {}],
  ["?state=expected", {}],
  ["?state=expected&code=abc", { method: "POST" }],
  ["?state=expected&code=abc", { host: "evil.example" }],
])("rejects unrelated/malformed callback %s without consuming login", async (suffix, options) => {
  const { callback } = await setup();
  expect((await visit(`${callback.redirectUri}${suffix}`, options)).status).toBe(400);
  const browser = visit(`${callback.redirectUri}?state=expected&code=valid`);
  await expect(callback.code).resolves.toBe("valid");
  await callback.complete(true);
  expect((await browser).status).toBe(302);
});

it("handles a state-bound OAuth error without reflecting provider text", async () => {
  const { callback } = await setup();
  const denied = expect(callback.code).rejects.toThrow("Authorization was denied");
  const response = await visit(
    `${callback.redirectUri}?state=expected&error=access_denied&error_description=secret`,
  );
  await denied;
  expect(response.status).toBe(400);
  expect(response.body).not.toContain("secret");
});

it("reports token exchange failure without a success redirect", async () => {
  const { callback } = await setup();
  const browser = visit(`${callback.redirectUri}?state=expected&code=abc`);
  await callback.code;
  await callback.complete(false);
  expect(await browser).toMatchObject({ status: 400 });
  expect((await browser).headers.location).toBeUndefined();
});

it("cancellation rejects the pending code and closes the listener", async () => {
  const { callback, controller } = await setup();
  const rejected = expect(callback.code).rejects.toThrow("cancelled");
  controller.abort(new Error("cancelled"));
  await rejected;
  await callback.close();
  await expect(visit(`${callback.redirectUri}?state=expected&code=late`)).rejects.toThrow();
});

it("force closes an active partial request when cancelled", async () => {
  const { callback, controller } = await setup();
  const socket = connect(Number(new URL(callback.redirectUri).port), "localhost");
  sockets.push(socket);
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("error", reject);
  });
  socket.write("GET / HTTP/1.1\r\nHost: localhost\r\n");
  const closed = new Promise<void>((resolve) => socket.once("close", () => resolve()));
  controller.abort();
  await callback.close();
  await closed;
});

it("bounds successful shutdown with another partial request open", async () => {
  const { callback } = await setup();
  const socket = connect(Number(new URL(callback.redirectUri).port), "localhost");
  sockets.push(socket);
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("error", reject);
  });
  socket.write("GET / HTTP/1.1\r\nHost: localhost\r\n");
  const closed = new Promise<void>((resolve) => socket.once("close", () => resolve()));
  const browser = visit(`${callback.redirectUri}?state=expected&code=abc`);
  await callback.code;
  await callback.complete(true);
  await closed;
  expect((await browser).status).toBe(302);
});

it("cancellation during exchange closes the held browser response", async () => {
  const { callback, controller } = await setup();
  const browser = visit(`${callback.redirectUri}?state=expected&code=abc`);
  const rejected = expect(browser).rejects.toThrow();
  await callback.code;
  controller.abort(new Error("cancelled during exchange"));
  await callback.close();
  await rejected;
  await callback.complete(true);
});

it("keeps simultaneous transactions independent", async () => {
  const first = await setup();
  const second = await setup();
  expect(first.callback.redirectUri).not.toBe(second.callback.redirectUri);
  const rejected = expect(first.callback.code).rejects.toThrow("first cancelled");
  first.controller.abort(new Error("first cancelled"));
  await rejected;
  const browser = visit(`${second.callback.redirectUri}?state=expected&code=second`);
  await expect(second.callback.code).resolves.toBe("second");
  await second.callback.complete(true);
  expect((await browser).status).toBe(302);
});

it("rejects an already-aborted transaction without creating a callback", async () => {
  await expect(
    createCallbackServer({
      state: "expected",
      signal: AbortSignal.abort(new Error("already cancelled")),
    }),
  ).rejects.toThrow("already cancelled");
});

it("claims only the first of competing valid callbacks", async () => {
  const { callback } = await setup();
  const socket = connect(Number(new URL(callback.redirectUri).port), "localhost");
  sockets.push(socket);
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("error", reject);
  });
  const host = new URL(callback.redirectUri).host;
  // Pipelining ensures both requests reach the same accepted socket even
  // though the first callback immediately stops new connections.
  let response = "";
  socket.setEncoding("utf8");
  socket.on("data", (chunk) => {
    response += chunk;
  });
  const closed = new Promise<void>((resolve) => socket.once("close", () => resolve()));
  socket.write(
    `GET /?state=expected&code=first HTTP/1.1\r\nHost: ${host}\r\n\r\n` +
      `GET /?state=expected&code=second HTTP/1.1\r\nHost: ${host}\r\n\r\n`,
  );
  await expect(callback.code).resolves.toBe("first");
  await callback.complete(true);
  await closed;
  expect(response.match(/HTTP\/1\.1 302/g)).toHaveLength(1);
  expect(response).not.toContain("code=second");
});
