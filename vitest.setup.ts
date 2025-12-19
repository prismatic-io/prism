import { vi } from "vitest";

export const TEST_PRISMATIC_URL = "https://example.com";

vi.mock("./src/auth.js", () => ({
  getAccessToken: vi.fn(() => Promise.resolve("test-token")),
  prismaticUrl: TEST_PRISMATIC_URL,
  createRequestParams: (data: Record<string, string | undefined>): string =>
    new URLSearchParams(
      Object.entries(data).filter(([, v]) => v !== undefined) as [string, string][],
    ).toString(),
}));

vi.mock("./src/utils/http.js", () => ({
  fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
  createFetch: () => fetch,
}));
