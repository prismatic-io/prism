import { defineConfig } from "vitest/config";

// Live tests are deliberately absent from the default configuration and its mocks.
export default defineConfig({
  test: {
    include: ["test/live/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 600_000,
    hookTimeout: 180_000,
  },
});
