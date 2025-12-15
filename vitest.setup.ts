import { vi } from "vitest";

/**
 * The mock Prismatic URL used in tests. Tests that need to set up MSW handlers
 * should use this URL to configure their graphql.link() endpoint.
 */
export const TEST_PRISMATIC_URL = "https://example.com";

// Mock auth.js - provides a test token and URL for all tests
// Uses importOriginal to preserve real exports like createRequestParams
vi.mock(import("./src/auth.js"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getAccessToken: vi.fn(() => Promise.resolve("test-token")),
    prismaticUrl: TEST_PRISMATIC_URL,
  };
});

// Mock http.js - pass through to native fetch for MSW interception
vi.mock("./src/utils/http.js", () => ({
  fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
  createFetch: () => fetch,
}));
