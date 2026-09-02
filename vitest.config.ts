import { readFile } from "node:fs/promises";
import { defineConfig, type Plugin } from "vitest/config";

const graphqlPlugin = (): Plugin => ({
  name: "graphql-loader",
  transform: async (_, id) => {
    if (id.endsWith(".graphql")) {
      const content = await readFile(id, "utf-8");
      return {
        code: `export default ${JSON.stringify(content)};`,
        map: null,
      };
    }
  },
});

export default defineConfig({
  plugins: [graphqlPlugin()],
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
  },
});
