import { createHash } from "node:crypto";
import http from "node:http";
import { HttpResponse, http as mswHttp, passthrough } from "msw";
import { setupServer } from "msw/node";
import open from "open";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { Authenticate } from "./authenticate.js";

vi.mock("open", () => ({ default: vi.fn() }));

const options = {
  domain: "auth.example.test",
  clientId: "native-client",
  audience: "https://api.example.test",
  scopes: ["openid", "offline_access"],
  successRedirectUri: "https://prismatic.io",
};
const tokens = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expires_in: 3600,
  token_type: "Bearer",
  scope: "openid offline_access",
};
const server = setupServer(
  mswHttp.all(/^http:\/\/localhost:\d+\//, () => passthrough()),
  mswHttp.post("https://auth.example.test/oauth/token", () => HttpResponse.json(tokens)),
);
const required = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) throw new Error("Expected test value");
  return value;
};
const operations: { abort: AbortController; result: Promise<unknown> }[] = [];

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => vi.mocked(open).mockResolvedValue(undefined as never));
afterEach(async () => {
  for (const operation of operations) operation.abort.abort();
  await Promise.allSettled(operations.map(({ result }) => result));
  operations.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

const start = async (auth = new Authenticate(options)) => {
  const abort = new AbortController();
  const presented = Promise.withResolvers<string>();
  const result = auth.login({ url: true, signal: abort.signal, onChallenge: presented.resolve });
  void result.catch(presented.reject);
  operations.push({ abort, result });
  const challenge = new URL(await presented.promise);
  const redirect = new URL(required(challenge.searchParams.get("redirect_uri")));
  const callback = new URL(redirect);
  callback.search = new URLSearchParams({
    state: required(challenge.searchParams.get("state")),
    code: "authorization-code",
  }).toString();
  return { abort, result, challenge, redirect, callback };
};

const request = (url: URL) =>
  new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>(
    (resolve, reject) => {
      const req = http.get(url, { agent: false }, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () =>
          resolve({ status: required(response.statusCode), headers: response.headers, body }),
        );
        response.on("error", reject);
      });
      req.setTimeout(2000, () => req.destroy(new Error("Callback request timed out")));
      req.on("error", reject);
    },
  );

it("completes a real loopback PKCE exchange with matching verifier and decoded code", async () => {
  let submitted: URLSearchParams | undefined;
  server.use(
    mswHttp.post("https://auth.example.test/oauth/token", async ({ request }) => {
      expect(request.headers.get("content-type")).toContain("application/x-www-form-urlencoded");
      submitted = new URLSearchParams(await request.text());
      return HttpResponse.json(tokens);
    }),
  );
  const login = await start();
  expect(login.challenge).toMatchObject({
    origin: "https://auth.example.test",
    pathname: "/authorize",
  });
  expect(Object.fromEntries(login.challenge.searchParams)).toMatchObject({
    response_type: "code",
    code_challenge_method: "S256",
    state: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
  });
  expect(login.redirect).toMatchObject({ protocol: "http:", hostname: "localhost", pathname: "/" });
  expect(Number(login.redirect.port)).toBeGreaterThanOrEqual(59400);
  expect(Number(login.redirect.port)).toBeLessThanOrEqual(59450);
  login.callback.searchParams.set("code", "a+b/c= with spaces");
  const response = await request(login.callback);
  await expect(login.result).resolves.toMatchObject({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  });
  expect(Object.fromEntries(required(submitted))).toEqual({
    code: "a+b/c= with spaces",
    client_id: options.clientId,
    grant_type: "authorization_code",
    redirect_uri: login.redirect.href,
    code_verifier: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
  });
  const verifier = required(submitted?.get("code_verifier"));
  expect(createHash("sha256").update(verifier).digest("base64url")).toBe(
    login.challenge.searchParams.get("code_challenge"),
  );
  expect(response).toMatchObject({
    status: 302,
    headers: {
      location: options.successRedirectUri,
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    },
  });
  expect(response.body).not.toContain(verifier);
  expect(response.body).not.toContain(tokens.access_token);
});

it("rejects unrelated and invalid callbacks without consuming login", async () => {
  let exchanges = 0;
  server.use(
    mswHttp.post("https://auth.example.test/oauth/token", () => {
      exchanges += 1;
      return HttpResponse.json(tokens);
    }),
  );
  const login = await start();
  const unrelated = new URL("/favicon.ico", login.redirect);
  const wrongState = new URL(login.callback);
  wrongState.searchParams.set("state", "wrong");
  const duplicate = new URL(login.callback);
  duplicate.searchParams.append("code", "second-code");
  await expect(Promise.all([unrelated, wrongState, duplicate].map(request))).resolves.toMatchObject(
    [{ status: 400 }, { status: 400 }, { status: 400 }],
  );
  expect(exchanges).toBe(0);
  await request(login.callback);
  await expect(login.result).resolves.toMatchObject({ accessToken: tokens.access_token });
  expect(exchanges).toBe(1);
});

it("handles a state-bound OAuth denial without redeeming a code or redirecting to success", async () => {
  const exchange = vi.fn(() => HttpResponse.json(tokens));
  server.use(mswHttp.post("https://auth.example.test/oauth/token", exchange));
  const login = await start();
  login.callback.searchParams.delete("code");
  login.callback.searchParams.set("error", "access_denied");
  login.callback.searchParams.set("error_description", "untrusted <script>secret</script>");
  const response = await request(login.callback);
  await expect(login.result).rejects.toThrow();
  expect(exchange).not.toHaveBeenCalled();
  expect(response).toMatchObject({
    status: 400,
    headers: expect.not.objectContaining({ location: expect.any(String) }),
    body: expect.not.stringContaining("untrusted"),
  });
});

it("closes the listener when cancelled while awaiting the callback", async () => {
  const login = await start();
  login.abort.abort(new Error("Cancelled by test"));
  await expect(login.result).rejects.toThrow("Cancelled by test");
  await expect(request(login.callback)).rejects.toThrow();
});

it("aborts the token exchange after receiving a valid callback", async () => {
  const entered = Promise.withResolvers<Request>();
  const release = Promise.withResolvers<void>();
  server.use(
    mswHttp.post("https://auth.example.test/oauth/token", async ({ request }) => {
      entered.resolve(request);
      await release.promise;
      return HttpResponse.json(tokens);
    }),
  );
  const login = await start();
  const response = request(login.callback);
  void response.catch(() => {});
  try {
    const tokenRequest = await entered.promise;
    login.abort.abort(new Error("Cancelled during exchange"));
    await expect(login.result).rejects.toThrow("Cancelled during exchange");
    expect(tokenRequest.signal.aborted).toBe(true);
  } finally {
    release.resolve();
    await response.catch(() => {});
  }
});

it("keeps cancellation active while reading the token response body", async () => {
  const entered = Promise.withResolvers<void>();
  let bodyController: ReadableStreamDefaultController<Uint8Array> | undefined;
  const interceptedFetch = globalThis.fetch;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (...args) => {
    const response = await interceptedFetch(...args);
    const readJson = response.json.bind(response);
    response.json = () => {
      entered.resolve();
      return readJson();
    };
    return response;
  });
  server.use(
    mswHttp.post("https://auth.example.test/oauth/token", () => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          bodyController = controller;
          controller.enqueue(new TextEncoder().encode('{"access_token":'));
        },
      });
      return new HttpResponse(body, { headers: { "Content-Type": "application/json" } });
    }),
  );
  const login = await start();
  const response = request(login.callback);
  void response.catch(() => {});
  try {
    await entered.promise;
    login.abort.abort(new Error("Cancelled while reading tokens"));
    await expect(login.result).rejects.toThrow("Cancelled while reading tokens");
  } finally {
    try {
      bodyController?.close();
    } catch {
      /* The aborted reader may already be closed. */
    }
    await response.catch(() => {});
  }
});

it("does not show browser success when the token endpoint rejects the code", async () => {
  server.use(
    mswHttp.post("https://auth.example.test/oauth/token", () =>
      HttpResponse.json(
        { error: "invalid_grant", error_description: "secret detail" },
        { status: 400 },
      ),
    ),
  );
  const login = await start();
  const response = await request(login.callback);
  await expect(login.result).rejects.toThrow();
  expect(response).toMatchObject({
    status: 400,
    headers: expect.not.objectContaining({ location: expect.any(String) }),
    body: expect.not.stringContaining("secret detail"),
  });
});

it("cleans up the callback server if opening the browser fails", async () => {
  let redirect: URL | undefined;
  vi.mocked(open).mockImplementationOnce(async (url) => {
    redirect = new URL(required(new URL(url).searchParams.get("redirect_uri")));
    throw new Error("Browser launch failed");
  });
  await expect(new Authenticate(options).login()).rejects.toThrow("Browser launch failed");
  expect(redirect).toBeDefined();
  await expect(request(required(redirect))).rejects.toThrow();
});

it("isolates simultaneous logins on the same Authenticate instance", async () => {
  const auth = new Authenticate(options);
  const [first, second] = await Promise.all([start(auth), start(auth)]);
  expect(first.redirect.port).not.toBe(second.redirect.port);
  expect(first.challenge.searchParams.get("state")).not.toBe(
    second.challenge.searchParams.get("state"),
  );
  await Promise.all([request(first.callback), request(second.callback)]);
  await expect(Promise.all([first.result, second.result])).resolves.toMatchObject([
    { accessToken: tokens.access_token },
    { accessToken: tokens.access_token },
  ]);
});
