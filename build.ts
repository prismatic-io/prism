import { readFileSync } from "node:fs";
import { cp } from "node:fs/promises";
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

// EJS 5's ESM files carry a dead-code CJS shim that Bun's bundler mishandles,
// producing a ReferenceError at load time. Strip the shim so ejs stays ESM.
// See https://github.com/oven-sh/bun/issues/5654.
const ejsShimStripper: BunPlugin = {
  name: "ejs-shim-stripper",
  setup: (build) => {
    build.onLoad({ filter: /\/ejs\/lib\/esm\/[^/]+\.js$/ }, (args) => {
      const source = readFileSync(args.path, "utf-8");
      const contents = source.replace(
        /if\s*\(\s*typeof\s+(?:exports|module)\s*!=\s*['"]undefined['"]\s*\)\s*\{\s*module\.exports\s*=[^}]*\}/g,
        "",
      );
      if (contents === source) {
        throw new Error(
          `ejs-shim-stripper: expected CJS shim not found in ${args.path}. ` +
            "Upstream may be fixed — remove this plugin.",
        );
      }
      return { contents, loader: "js" };
    });
  },
};

const isDebug = process.argv.includes("--debug");

// Node 20 compat: undici 8.x calls util.markAsUncloneable (added in Node 22.2)
// from node:worker_threads at module-load time. It uses it defensively to
// reject cross-thread cloning of Request/Response — this CLI never does that,
// so a no-op shim is functionally equivalent. Injected as a bundler banner so
// it runs before the bundled undici code.
const node20Polyfill = `import $wt0 from "node:worker_threads";if(typeof $wt0.markAsUncloneable!=="function")$wt0.markAsUncloneable=()=>{};`;

const result = await Bun.build({
  entrypoints: ["src/index.ts", "src/run.ts"],
  outdir: "lib",
  target: "node",
  minify: !isDebug,
  sourcemap: isDebug ? "external" : "none",
  banner: node20Polyfill,
  plugins: [graphqlLoader, ejsShimStripper],
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

await cp("templates", "lib/templates", { recursive: true });
await cp("src/run.cmd", "lib/run.cmd");
