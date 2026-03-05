import { readFileSync } from "node:fs";
import type { BunPlugin } from "bun";

const graphqlLoader: BunPlugin = {
  name: "graphql-loader",
  setup: (build) => {
    build.onLoad({ filter: /\.graphql$/ }, (args) => {
      const content = readFileSync(args.path, "utf-8");
      return {
        contents: `export default ${JSON.stringify(content)};`,
        loader: "js",
      };
    });
  },
};

const isDebug = process.argv.includes("--debug");

const result = await Bun.build({
  entrypoints: ["src/index.ts", "src/run.ts"],
  outdir: "lib",
  target: "node",
  minify: !isDebug,
  sourcemap: isDebug ? "external" : "none",
  external: ["debug"],
  plugins: [graphqlLoader],
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}
