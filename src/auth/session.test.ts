import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setImmediate } from "node:timers/promises";
import inquirer from "inquirer";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { Authenticate, login, selectTenant } from "../auth.js";
import { createCommandContext, runWithCommandContext } from "../command-context.js";
import { readConfigFile } from "../config.js";

vi.unmock("../auth.js");
vi.unmock("../context.js");

const token = (exp: number) =>
  `e30.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;
const initial = {
  accessToken: token(0),
  refreshToken: "refresh-initial",
  expiresIn: 60,
  scope: "openid",
  tokenType: "Bearer",
};
const freshAccess = () => token(Math.floor(Date.now() / 1000) + 3600);
const tenant = (tenantId: string) => ({
  tenantId,
  orgName: "Org",
  url: "https://org.example.com",
  awsRegion: "us-east-1",
  systemSuspended: false,
});
const server = setupServer(
  http.get("https://stack.example.com/auth/meta", () =>
    HttpResponse.json({ domain: "auth.example.com", clientId: "client", audience: "audience" }),
  ),
  http.post("https://stack.example.com/api", async ({ request }) => {
    const { query } = (await request.json()) as { query: string };
    return HttpResponse.json({
      data: query.includes("listUserTenants")
        ? { listUserTenants: { nodes: [tenant("original"), tenant("selected")] } }
        : {
            authenticatedUser: {
              name: "User",
              email: "user@example.com",
              tenantId: "original",
              org: { id: "org", name: "Org" },
            },
          },
    });
  }),
);
let directory: string;
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "prism-auth-session-"));
  vi.stubEnv("PRISM_CONFIG_FILE", path.join(directory, "config.yml"));
  vi.stubEnv("PRISMATIC_URL", "https://stack.example.com");
  for (const name of [
    "PRISM_ACCESS_TOKEN",
    "PRISM_REFRESH_TOKEN",
    "PRISM_PROFILE",
    "PRISMATIC_TENANT_ID",
  ])
    vi.stubEnv(name, "");
  vi.spyOn(Authenticate.prototype, "login").mockResolvedValue(initial);
});
afterEach(async () => {
  server.resetHandlers();
  await rm(directory, { recursive: true, force: true });
});
afterAll(() => server.close());

it.each([
  "original",
  "selected",
])("retains rotated credentials through follow-up queries and tenant selection: %s", async (selected) => {
  const submitted: string[] = [];
  server.use(
    http.post("https://auth.example.com/oauth/token", async ({ request }) => {
      const body = new URLSearchParams(await request.text());
      submitted.push(body.get("refresh_token") ?? "");
      return HttpResponse.json({
        access_token: freshAccess(),
        refresh_token: submitted.length === 1 ? "refresh-rotated" : "refresh-final",
        expires_in: 3600,
        token_type: "Bearer",
      });
    }),
  );
  await runWithCommandContext(createCommandContext({ profileOnly: true }), () =>
    login({ url: true, nonInteractive: true, tenantId: selected }),
  );
  // The explicit tenant refresh must use the token rotated during listUserTenants.
  expect(submitted).toEqual(["refresh-initial", "refresh-rotated"]);
  expect((await readConfigFile())?.profiles.default).toMatchObject({
    refreshToken: "refresh-final",
    tenantId: selected,
  });
});

it("propagates login cancellation into automatic refresh before follow-up API queries", async () => {
  const entered = Promise.withResolvers<Request>();
  const release = Promise.withResolvers<void>();
  server.use(
    http.post("https://auth.example.com/oauth/token", async ({ request }) => {
      entered.resolve(request);
      await release.promise;
      return HttpResponse.json({
        access_token: freshAccess(),
        refresh_token: "must-not-be-saved",
        expires_in: 3600,
        token_type: "Bearer",
      });
    }),
  );
  const abort = new AbortController();
  const result = runWithCommandContext(createCommandContext({ profileOnly: true }), () =>
    login({ url: true, signal: abort.signal, nonInteractive: true, tenantId: "selected" }),
  );
  const rejection = expect(result).rejects.toThrow("cancelled follow-up");
  try {
    const request = await entered.promise;
    abort.abort(new Error("cancelled follow-up"));
    await rejection;
    expect(request.signal.aborted).toBe(true);
  } finally {
    release.resolve();
  }
  await setImmediate();
  await setImmediate();
  expect((await readConfigFile())?.profiles.default.refreshToken).toBe("refresh-initial");
});

it("passes the operation signal into tenant prompting and preserves cancellation", async () => {
  const abort = new AbortController();
  const prompt = vi.fn(async () => {
    abort.abort(new Error("cancelled prompt"));
    throw new Error("Inquirer aborted");
  });
  const create = vi.spyOn(inquirer, "createPromptModule").mockReturnValue(prompt as never);
  await expect(
    selectTenant([tenant("original"), tenant("selected")], { signal: abort.signal }),
  ).rejects.toThrow("cancelled prompt");
  expect(create).toHaveBeenCalledWith({ signal: abort.signal });
});

it("does not overwrite a rotated token when recording the only active tenant", async () => {
  let refreshes = 0;
  server.use(
    http.post("https://auth.example.com/oauth/token", () => {
      refreshes += 1;
      return HttpResponse.json({
        access_token: freshAccess(),
        refresh_token: "refresh-rotated",
        expires_in: 3600,
        token_type: "Bearer",
      });
    }),
    http.post("https://stack.example.com/api", async ({ request }) => {
      const { query } = (await request.json()) as { query: string };
      return HttpResponse.json({
        data: query.includes("listUserTenants")
          ? { listUserTenants: { nodes: [tenant("original")] } }
          : {
              authenticatedUser: {
                name: "User",
                email: "user@example.com",
                tenantId: "original",
                org: { id: "org", name: "Org" },
              },
            },
      });
    }),
  );
  await runWithCommandContext(createCommandContext({ profileOnly: true }), () =>
    login({ url: true, nonInteractive: true }),
  );
  expect(refreshes).toBe(1);
  expect((await readConfigFile())?.profiles.default).toMatchObject({
    refreshToken: "refresh-rotated",
    tenantId: "original",
  });
});
