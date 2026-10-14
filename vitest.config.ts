import { createRequire } from "node:module";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

/**
 * Generated components import spectral's public entry points (`@prismatic-io/spectral/http`,
 * `/testing`), which the installed spectral does not declare yet. Until prism depends on a
 * spectral release that does, resolve them to the modules they map to so tests that execute
 * generated code (openapi runtime regression) keep running.
 */
const spectralEntryPointAliases = [
  {
    find: /^@prismatic-io\/spectral\/http$/,
    replacement: require.resolve("@prismatic-io/spectral/dist/clients/http"),
  },
  {
    find: /^@prismatic-io\/spectral\/testing$/,
    replacement: require.resolve("@prismatic-io/spectral/dist/testing"),
  },
];

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        resolve: { alias: spectralEntryPointAliases },
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
