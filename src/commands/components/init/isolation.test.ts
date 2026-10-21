import { mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { withWorkingDirectory } from "../../../command-context.js";
import { generateComponent } from "./component.js";

it("generates independent component scaffolds concurrently without changing cwd", async () => {
  const originalDirectory = process.cwd();
  const root = await mkdtemp(path.join(tmpdir(), "prism-scaffold-isolation-"));
  const directories = [path.join(root, "alpha"), path.join(root, "beta")];
  try {
    await Promise.all(directories.map((directory) => mkdir(directory)));
    await Promise.all(
      directories.map((directory, index) =>
        withWorkingDirectory(directory, () =>
          generateComponent({
            name: `component-${index}`,
            description: `Description ${index}`,
            toolchain: index === 0 ? "modern" : "legacy",
          }),
        ),
      ),
    );
    for (const [index, directory] of directories.entries()) {
      expect(JSON.parse(await readFile(path.join(directory, "package.json"), "utf8")).name).toBe(
        `component-${index}`,
      );
      expect(await readFile(path.join(directory, "src", "index.ts"), "utf8")).toContain(
        `Description ${index}`,
      );
      expect(
        await readFile(
          path.join(directory, index === 0 ? "tsdown.config.mts" : "webpack.config.js"),
          "utf8",
        ),
      ).not.toBe("");
    }
    expect(process.cwd()).toBe(originalDirectory);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("keeps component TypeScript identical with and without npm packaging", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prism-scaffold-authoring-"));
  try {
    for (const toolchain of ["modern", "legacy"] as const) {
      const directory = path.join(root, toolchain);
      await mkdir(directory);
      await withWorkingDirectory(directory, () =>
        generateComponent({
          name: "example",
          description: "Example",
          toolchain,
        }),
      );
    }
    const modern = path.join(root, "modern", "src");
    const legacy = path.join(root, "legacy", "src");
    const files = (await readdir(modern)).sort();
    expect(files).toEqual((await readdir(legacy)).sort());
    expect(files).not.toContain("definition.ts");
    expect(files).not.toContain("platform.ts");
    for (const file of files) {
      expect(await readFile(path.join(modern, file), "utf8")).toBe(
        await readFile(path.join(legacy, file), "utf8"),
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
