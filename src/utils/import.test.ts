import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { withWorkingDirectory } from "../command-context.js";
import { loadEntrypoint } from "./component/index.js";
import { getPackageEntrypointDirectory } from "./import.js";

it("loads concurrent component definitions from ambient directories without changing cwd", async () => {
  const originalDirectory = process.cwd();
  const directory = await mkdtemp(path.join(tmpdir(), "prism-component-load-"));
  try {
    const projects = ["alpha", "beta"].map((name) => path.join(directory, name));
    await Promise.all(
      projects.map(async (project, index) => {
        await mkdir(path.join(project, "dist"), { recursive: true });
        await writeFile(path.join(project, "package.json"), JSON.stringify({ type: "commonjs" }));
        await writeFile(
          path.join(project, "dist", "index.js"),
          `exports.default = { key: "component-${index}" };`,
        );
      }),
    );
    const results = await Promise.all(
      projects.map((project) =>
        withWorkingDirectory(project, async () => {
          const dist = await getPackageEntrypointDirectory("component");
          return withWorkingDirectory(dist, loadEntrypoint);
        }),
      ),
    );
    expect(results.map((result) => result.key)).toEqual(["component-0", "component-1"]);
    expect(process.cwd()).toBe(originalDirectory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
