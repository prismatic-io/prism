import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { generateComponent } from "./component.js";

it("generates independent component scaffolds concurrently without changing cwd", async () => {
  const originalDirectory = process.cwd();
  const root = await mkdtemp(path.join(tmpdir(), "prism-scaffold-isolation-"));
  const directories = [path.join(root, "alpha"), path.join(root, "beta")];
  try {
    await Promise.all(directories.map((directory) => mkdir(directory)));
    await Promise.all(
      directories.map((directory, index) =>
        generateComponent(
          {
            name: `component-${index}`,
            description: `Description ${index}`,
            toolchain: index === 0 ? "modern" : "legacy",
          },
          directory,
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
