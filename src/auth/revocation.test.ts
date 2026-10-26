import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { revokeRefreshToken } from "../auth.js";
import { createCommandContext, runWithCommandContext } from "../command-context.js";
import { deleteAuthProfile, getAuthContext } from "../context.js";
import { gqlRequest } from "../graphql.js";

vi.unmock("../auth.js");
vi.mock("../graphql.js", () => ({ gqlRequest: vi.fn() }));
vi.mock("../context.js", () => ({ getAuthContext: vi.fn(), deleteAuthProfile: vi.fn() }));
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => {
  vi.mocked(getAuthContext).mockResolvedValue({
    source: "profile",
    configPath: "/unused",
    profileName: "test",
    profile: null,
    url: "https://stack.example.com",
    accessToken: "access",
    refreshToken: "refresh",
  });
  vi.mocked(gqlRequest).mockResolvedValue({ authenticatedUser: {} });
});

it.each([
  401, 403, 500,
])("keeps local credentials when revocation returns HTTP %s", async (status) => {
  server.use(
    http.post("https://stack.example.com/auth/revoke", () => new HttpResponse(null, { status })),
  );
  await expect(runWithCommandContext(createCommandContext(), revokeRefreshToken)).rejects.toThrow(
    `HTTP ${status}`,
  );
  expect(deleteAuthProfile).not.toHaveBeenCalled();
});

it("removes local credentials only after confirmed revocation", async () => {
  server.use(
    http.post("https://stack.example.com/auth/revoke", async ({ request }) => {
      expect(await request.json()).toEqual({ refresh_token: "refresh" });
      expect(deleteAuthProfile).not.toHaveBeenCalled();
      return new HttpResponse(null, { status: 204 });
    }),
  );
  await expect(runWithCommandContext(createCommandContext(), revokeRefreshToken)).resolves.toBe(
    "profile",
  );
  expect(deleteAuthProfile).toHaveBeenCalledOnce();
});
