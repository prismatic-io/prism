import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.e2e.ts"],
    exclude: ["**/node_modules/**"],
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 600_000,
    hookTimeout: 600_000,
    fileParallelism: false,
    disableConsoleIntercept: true,
  },
});
