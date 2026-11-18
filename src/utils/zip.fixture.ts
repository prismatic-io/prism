import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test as base } from "vitest";
import { createZip } from "./zip.js";

const signatureFiles = (): Array<[string, Buffer]> => {
  const random = Buffer.alloc(100_000);
  let seed = 123456789;
  for (let i = 0; i < random.length; i++) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    random[i] = seed & 255;
  }
  return [
    ["empty.txt", Buffer.alloc(0)],
    [
      "index.js",
      Buffer.from(
        Array.from(
          { length: 4000 },
          (_, i) =>
            `export const value${i} = ${JSON.stringify(`component-${i % 97}-action-${i % 31}`)};\n`,
        ).join(""),
      ),
    ],
    ["nested/日本語.txt", Buffer.from("Hello, κόσμε!\n".repeat(20))],
    ["random.bin", random],
  ];
};

interface ZipFixtures {
  directory: string;
  srcDir: string;
  bundle: { directory: string; files: Array<[string, Buffer]> };
  createZip: typeof createZip;
}

export const test = base.extend<ZipFixtures>({
  // biome-ignore lint/correctness/noEmptyPattern: Vitest requires destructuring to identify fixture dependencies.
  directory: async ({}, use) => {
    const directory = await mkdtemp(join(tmpdir(), "zip-test-"));

    try {
      await use(directory);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },

  srcDir: async ({ directory }, use) => {
    const source = join(directory, "source");
    await mkdir(join(source, "sub"), { recursive: true });
    await writeFile(join(source, "index.js"), "console.log('hi');");
    await writeFile(join(source, "package.json"), '{"name":"test"}');
    await writeFile(join(source, "sub", "nested.ts"), "export const x = 1;");

    await use(source);
  },

  bundle: async ({ directory }, use) => {
    const root = join(directory, "bundle");
    const files = signatureFiles();

    for (const [name, content] of files) {
      const path = join(root, name);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content);
    }

    await use({ directory: root, files });
  },

  // biome-ignore lint/correctness/noEmptyPattern: Vitest requires destructuring to identify fixture dependencies.
  createZip: async ({}, use) => {
    const archives: string[] = [];

    try {
      await use(async (build) => {
        const path = await createZip(build);
        archives.push(path);
        return path;
      });
    } finally {
      await Promise.all(archives.map((path) => rm(path, { force: true })));
    }
  },
});
