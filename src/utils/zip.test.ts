import { createHash } from "node:crypto";
import { once } from "node:events";
import * as fs from "node:fs";
import { chmod, readFile, symlink, utimes, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { addAbortSignal, PassThrough } from "node:stream";
import { promisify } from "node:util";
import * as tempy from "tempy";
import { describe, expect, vi } from "vitest";
import yauzl from "yauzl";
import { test as it } from "./zip.fixture.js";

vi.mock(import("tempy"), async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, temporaryFile: vi.fn(original.temporaryFile) };
});

vi.mock(import("node:fs"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    createReadStream: vi.fn(original.createReadStream),
    createWriteStream: vi.fn(original.createWriteStream),
  };
});

const openZip = promisify(yauzl.open).bind(yauzl) as (
  path: string,
  options: yauzl.Options,
) => Promise<yauzl.ZipFile>;

interface ReadEntry {
  name: string;
  content: string;
  mtime: Date;
  method: number;
  bytes: Buffer;
  mode: number;
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
            bytes: Buffer.concat(chunks),
            mode: entry.externalFileAttributes >>> 16,
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
  it("zips a directory with all files included", async ({ srcDir, createZip }) => {
    const zipPath = await createZip((zip) => zip.addDirectory(srcDir));
    const entries = await readZip(zipPath);
    expect(entries.map((e) => e.name).sort()).toEqual([
      "index.js",
      "package.json",
      "sub/nested.ts",
    ]);
  });

  it("preserves file contents", async ({ srcDir, createZip }) => {
    const zipPath = await createZip((zip) => zip.addDirectory(srcDir));
    const entries = await readZip(zipPath);
    const byName = Object.fromEntries(entries.map((e) => [e.name, e.content]));
    expect(byName["index.js"]).toBe("console.log('hi');");
    expect(byName["package.json"]).toBe('{"name":"test"}');
    expect(byName["sub/nested.ts"]).toBe("export const x = 1;");
  });

  it("prefixes archive paths when addDirectory is given a prefix", async ({
    srcDir,
    createZip,
  }) => {
    const zipPath = await createZip((zip) => zip.addDirectory(srcDir, "myprefix"));
    const names = (await readZip(zipPath)).map((e) => e.name).sort();
    expect(names).toEqual(["myprefix/index.js", "myprefix/package.json", "myprefix/sub/nested.ts"]);
  });

  it("addFile adds a single file at the given archive path", async ({ srcDir, createZip }) => {
    const zipPath = await createZip((zip) => zip.addFile(join(srcDir, "index.js"), "renamed.js"));
    const entries = await readZip(zipPath);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("renamed.js");
    expect(entries[0].content).toBe("console.log('hi');");
  });

  it("orders entries alphabetically for deterministic archive ordering", async ({
    srcDir,
    createZip,
  }) => {
    const zipPath = await createZip((zip) => zip.addDirectory(srcDir));
    const names = (await readZip(zipPath)).map((e) => e.name);
    expect(names).toEqual([...names].sort());
  });

  it("produces byte-identical output across repeated invocations", async ({
    srcDir,
    createZip,
  }) => {
    const a = await createZip((zip) => zip.addDirectory(srcDir));
    const b = await createZip((zip) => zip.addDirectory(srcDir));
    expect(await sha1(a)).toBe(await sha1(b));
  });

  it("ignores source-file mtimes (touching a file does not change zip bytes)", async ({
    srcDir,
    createZip,
  }) => {
    const before = await createZip((zip) => zip.addDirectory(srcDir));
    const future = new Date("2030-01-01T00:00:00Z");
    await utimes(join(srcDir, "index.js"), future, future);
    await utimes(join(srcDir, "sub", "nested.ts"), future, future);
    const after = await createZip((zip) => zip.addDirectory(srcDir));
    expect(await sha1(before)).toBe(await sha1(after));
  });

  it("uses deflate compression", async ({ directory: dir, createZip }) => {
    await writeFile(join(dir, "big.txt"), "a".repeat(10_000));
    const zipPath = await createZip((zip) => zip.addFile(join(dir, "big.txt"), "big.txt"));
    const entries = await readZip(zipPath);
    expect(entries[0].method).toBe(8); // 8 = deflate, 0 = stored
  });

  it.for([
    "UTC",
    "America/Phoenix",
    "Asia/Tokyo",
  ])("produces the known bundle hash in %s", async (timezone, { bundle, createZip }) => {
    vi.stubEnv("TZ", timezone);
    const path = await createZip((zip) => zip.addDirectory(bundle.directory));
    // Captured with yazl 3.3.1, Node 24.22.1, level 9, epoch mtime and mode 0100644.
    expect(await sha1(path)).toBe("dcc67f4de78568b3d23993827c5d90d0ccb1e43c");
    const entries = await readZip(path);
    expect(entries.map(({ name, bytes }) => [name, bytes])).toEqual(bundle.files);
    expect(entries.every(({ mode, mtime }) => mode === 0o100644 && mtime.getTime() === 0)).toBe(
      true,
    );
  });

  it("ignores source-file modes (a chmod does not change zip bytes)", async ({
    directory: dir,
    createZip,
  }) => {
    await writeFile(join(dir, "index.js"), "console.log('hi');");
    await writeFile(join(dir, "icon.png"), "png");
    await chmod(join(dir, "index.js"), 0o644);
    await chmod(join(dir, "icon.png"), 0o644);
    const before = await createZip((zip) => zip.addDirectory(dir));
    await chmod(join(dir, "index.js"), 0o755);
    await chmod(join(dir, "icon.png"), 0o666);
    const after = await createZip((zip) => zip.addDirectory(dir));
    expect(await sha1(before)).toBe(await sha1(after));
  });

  it("records each file as a regular file with mode 0644", async ({
    directory: dir,
    createZip,
  }) => {
    await writeFile(join(dir, "index.js"), "console.log('hi');");
    await writeFile(join(dir, "icon.png"), "png");
    await chmod(join(dir, "index.js"), 0o755);
    await chmod(join(dir, "icon.png"), 0o666);
    const zipPath = await createZip((zip) => zip.addDirectory(dir));
    const modes = (await readZip(zipPath)).map((e) => e.mode);
    expect(modes).toEqual([0o100644, 0o100644]);
  });

  it("writes a readable empty archive", async ({ createZip }) => {
    const path = await createZip(() => {});
    expect(await readZip(path)).toEqual([]);
    expect((await readFile(path)).length).toBe(22);
  });

  it.for([
    "",
    "/absolute",
    "C:\\absolute",
    "../escape",
    "a/../escape",
    "directory/",
    "nul\0byte",
    "é".repeat(32768),
  ])("rejects unsafe or oversized archive paths (%#)", async (name, { srcDir, createZip }) => {
    await expect(createZip((zip) => zip.addFile(join(srcDir, "index.js"), name))).rejects.toThrow();
  });

  it("normalizes backslashes in entry names", async ({ srcDir, createZip }) => {
    const path = await createZip((zip) => zip.addFile(join(srcDir, "index.js"), "sub\\index.js"));
    expect((await readZip(path))[0].name).toBe("sub/index.js");
  });

  it("rejects read failures and removes the incomplete archive", async ({ srcDir, createZip }) => {
    const output = join(srcDir, "incomplete.zip");
    vi.mocked(tempy.temporaryFile).mockReturnValueOnce(output);
    await expect(
      createZip((zip) => zip.addFile(join(srcDir, "missing"), "missing")),
    ).rejects.toThrow();
    await expect(readFile(output)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("aborts a stalled input on output failure and removes the incomplete archive", async ({
    srcDir,
    createZip,
  }) => {
    const outputPath = join(srcDir, "incomplete.zip");
    vi.mocked(tempy.temporaryFile).mockReturnValueOnce(outputPath);
    const started = Promise.withResolvers<PassThrough>();
    vi.mocked(fs.createReadStream).mockImplementationOnce((_path, options) => {
      const input = new PassThrough();
      if (typeof options === "object" && options?.signal) {
        addAbortSignal(options.signal, input);
      }
      started.resolve(input);
      return input as unknown as fs.ReadStream;
    });
    const error = Object.assign(new Error("disk full"), { code: "ENOSPC" });
    const result = createZip((zip) => zip.addFile(join(srcDir, "index.js"), "index.js")).catch(
      (error: unknown) => error,
    );
    const input = await started.promise;

    try {
      const output = vi.mocked(fs.createWriteStream).mock.results[0].value as fs.WriteStream;
      if (output.pending) await once(output, "open");
      output.destroy(error);
      await vi.waitFor(() => expect(input.destroyed).toBe(true));
      expect(await result).toBe(error);
      await expect(readFile(outputPath)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      input.destroy();
      await result;
    }
  });

  it("rejects directory sources before opening a read stream", async ({ srcDir, createZip }) => {
    await expect(createZip((zip) => zip.addFile(srcDir, "file"))).rejects.toThrow("not a file:");
    expect(fs.createReadStream).not.toHaveBeenCalled();
  });

  it.skipIf(process.platform === "win32")(
    "rejects device sources before opening a read stream",
    async ({ createZip }) => {
      await expect(createZip((zip) => zip.addFile("/dev/null", "file"))).rejects.toThrow(
        "not a file: /dev/null",
      );
      expect(fs.createReadStream).not.toHaveBeenCalled();
    },
  );

  it.skipIf(process.platform === "win32")(
    "follows symlinks to regular files",
    async ({ srcDir, createZip }) => {
      const link = join(srcDir, "linked.js");
      await symlink(join(srcDir, "index.js"), link);
      const path = await createZip((zip) => zip.addFile(link, "linked.js"));
      expect((await readZip(path))[0]).toMatchObject({
        name: "linked.js",
        content: "console.log('hi');",
      });
    },
  );

  it("propagates builder failures before creating an archive", async ({ createZip }) => {
    const output = vi.mocked(tempy.temporaryFile);
    await expect(
      createZip(() => {
        throw new Error("build failed");
      }),
    ).rejects.toThrow("build failed");
    expect(output).not.toHaveBeenCalled();
  });
});
