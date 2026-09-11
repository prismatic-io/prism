import { cp } from "node:fs/promises";

const isDebug = process.argv.includes("--debug");

const result = await Bun.build({
  entrypoints: ["src/index.ts", "src/run.ts"],
  outdir: "lib",
  target: "node",
  minify: !isDebug,
  sourcemap: isDebug ? "external" : "none",
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
