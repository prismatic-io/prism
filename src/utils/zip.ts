import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { temporaryWrite } from "tempy";
import yazl from "yazl";

const EPOCH = new Date(0);
const ENTRY_OPTS = { mtime: EPOCH, compressionLevel: 9 } as const;

const toArchivePath = (p: string): string => (sep === "/" ? p : p.split(sep).join("/"));

const walkFiles = async (root: string): Promise<Array<{ abs: string; rel: string }>> => {
  const files: Array<{ abs: string; rel: string }> = [];
  const stack = [root];
  while (true) {
    const dir = stack.pop();
    if (dir === undefined) break;
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
      } else if (entry.isFile()) {
        files.push({ abs, rel: toArchivePath(relative(root, abs)) });
      }
    }
  }
  // Sort so archive ordering is deterministic regardless of filesystem enumeration order.
  files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  return files;
};

export interface ZipBuilder {
  addFile(realPath: string, archivePath: string): void;
  addDirectory(root: string, archivePrefix?: string): Promise<void>;
}

export const createZip = async (
  build: (zip: ZipBuilder) => Promise<void> | void,
): Promise<string> => {
  const zip = new yazl.ZipFile();
  const pathPromise = temporaryWrite(zip.outputStream, { extension: "zip" });

  const builder: ZipBuilder = {
    addFile(realPath, archivePath) {
      zip.addFile(realPath, archivePath, ENTRY_OPTS);
    },
    async addDirectory(root, prefix) {
      for (const { abs, rel } of await walkFiles(root)) {
        const archivePath = prefix ? toArchivePath(`${prefix}/${rel}`) : rel;
        zip.addFile(abs, archivePath, ENTRY_OPTS);
      }
    },
  };

  await build(builder);
  zip.end();

  return pathPromise;
};
