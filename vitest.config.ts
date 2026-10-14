import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          // Cold CLI startup on Windows runners can exceed five seconds.
          testTimeout: process.platform === "win32" ? 30_000 : 5_000,
          clearMocks: true,
          restoreMocks: true,
          unstubEnvs: true,
          unstubGlobals: true,
          include: ["src/**/*.test.ts"],
          exclude: ["**/node_modules/**", "**/temp/**"],
          environment: "node",
          setupFiles: ["./vitest.setup.ts"],
          disableConsoleIntercept: true,
        },
      },
      {
        test: {
          name: "cli",
          include: ["test/cli/**/*.test.ts"],
          environment: "node",
          testTimeout: 35_000,
        },
      },
    ],
  },
});
