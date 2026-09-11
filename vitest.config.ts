import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**"],
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    disableConsoleIntercept: true,
    // Cold CLI startup can exceed five seconds on Windows CI runners.
    testTimeout: process.platform === "win32" && process.env.CI ? 15_000 : 5_000,
  },
});
