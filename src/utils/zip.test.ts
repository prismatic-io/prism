import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { beforeAll, describe, expect, it } from "vitest";
import yauzl from "yauzl";
import { createZip } from "./zip.js";

const openZip = promisify(yauzl.open).bind(yauzl) as (
  path: string,
  options: yauzl.Options,
) => Promise<yauzl.ZipFile>;

interface ReadEntry {
  name: string;
  content: string;
  mtime: Date;
  method: number;
}

const readZip = async (path: string): Promise<ReadEntry[]> => {
  const zip = await openZip(path, { lazyEntries: true });
  const entries: ReadEntry[] = [];
  return new Promise<ReadEntry[]>((resolve, reject) => {
    zip.on("error", reject);
    zip.on("entry", (entry: yauzl.Entry) => {
      zip.openReadStream(entry, (err, readStream) => {
        if (err || !readStream) return reject(err);
        const chunks: Buffer[] = [];
        readStream.on("data", (c: Buffer) => chunks.push(c));
        readStream.on("error", reject);
        readStream.on("end", () => {
          entries.push({
            name: entry.fileName,
            content: Buffer.concat(chunks).toString("utf8"),
            mtime: entry.getLastModDate(),
            method: entry.compressionMethod,
          });
          zip.readEntry();
        });
      });
    });
    zip.on("end", () => resolve(entries));
    zip.readEntry();
  });
};

const sha1 = async (path: string): Promise<string> =>
  createHash("sha1")
    .update(await readFile(path))
    .digest("hex");

describe("createZip", () => {
  let srcDir: string;

  beforeAll(async () => {
    srcDir = await mkdtemp(join(tmpdir(), "zip-test-src-"));
    await writeFile(join(srcDir, "index.js"), "console.log('hi');");
    await writeFile(join(srcDir, "package.json"), '{"name":"test"}');
    await mkdir(join(srcDir, "sub"));
    await writeFile(join(srcDir, "sub", "nested.ts"), "export const x = 1;");
  });

  it("zips a directory with all files included", async () => {
    const zipPath = await createZip((zip) => zip.addDirectory(srcDir));
    const entries = await readZip(zipPath);
    expect(entries.map((e) => e.name).sort()).toEqual([
      "index.js",
      "package.json",
      "sub/nested.ts",
    ]);
  });

  it("preserves file contents", async () => {
    const zipPath = await createZip((zip) => zip.addDirectory(srcDir));
    const entries = await readZip(zipPath);
    const byName = Object.fromEntries(entries.map((e) => [e.name, e.content]));
    expect(byName["index.js"]).toBe("console.log('hi');");
    expect(byName["package.json"]).toBe('{"name":"test"}');
    expect(byName["sub/nested.ts"]).toBe("export const x = 1;");
  });

  it("prefixes archive paths when addDirectory is given a prefix", async () => {
    const zipPath = await createZip((zip) => zip.addDirectory(srcDir, "myprefix"));
    const names = (await readZip(zipPath)).map((e) => e.name).sort();
    expect(names).toEqual(["myprefix/index.js", "myprefix/package.json", "myprefix/sub/nested.ts"]);
  });

  it("addFile adds a single file at the given archive path", async () => {
    const zipPath = await createZip((zip) => zip.addFile(join(srcDir, "index.js"), "renamed.js"));
    const entries = await readZip(zipPath);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("renamed.js");
    expect(entries[0].content).toBe("console.log('hi');");
  });

  it("orders entries alphabetically for deterministic archive ordering", async () => {
    const zipPath = await createZip((zip) => zip.addDirectory(srcDir));
    const names = (await readZip(zipPath)).map((e) => e.name);
    expect(names).toEqual([...names].sort());
  });

  it("produces byte-identical output across repeated invocations", async () => {
    const a = await createZip((zip) => zip.addDirectory(srcDir));
    const b = await createZip((zip) => zip.addDirectory(srcDir));
    expect(await sha1(a)).toBe(await sha1(b));
  });

  it("ignores source-file mtimes (touching a file does not change zip bytes)", async () => {
    const before = await createZip((zip) => zip.addDirectory(srcDir));
    const future = new Date("2030-01-01T00:00:00Z");
    await utimes(join(srcDir, "index.js"), future, future);
    await utimes(join(srcDir, "sub", "nested.ts"), future, future);
    const after = await createZip((zip) => zip.addDirectory(srcDir));
    expect(await sha1(before)).toBe(await sha1(after));
  });

  it("uses deflate compression", async () => {
    const dir = await mkdtemp(join(tmpdir(), "zip-test-big-"));
    await writeFile(join(dir, "big.txt"), "a".repeat(10_000));
    const zipPath = await createZip((zip) => zip.addFile(join(dir, "big.txt"), "big.txt"));
    const entries = await readZip(zipPath);
    expect(entries[0].method).toBe(8); // 8 = deflate, 0 = stored
  });
});
