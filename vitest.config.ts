import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vitest/config";

const graphqlPlugin = (): Plugin => ({
  name: "graphql-loader",
  transform: (_, id) => {
    if (id.endsWith(".graphql")) {
      const content = readFileSync(id, "utf-8");
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
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**"],
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
  },
});
