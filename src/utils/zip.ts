import { createReadStream, createWriteStream } from "node:fs";
import { readdir, rm, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { pipeline } from "node:stream/promises";

import crc32 = require("buffer-crc32");

import { Deflate } from "pako";
import { temporaryFile } from "tempy";
import {
  centralHeader,
  dataDescriptor,
  endOfDirectory,
  localHeader,
  type ZipEntry,
} from "./zip-records.js";

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

interface ZipSource {
  realPath: string;
  name: Buffer;
}

const entryName = (path: string): Buffer => {
  const normalized = path.replaceAll("\\", "/");

  if (
    !normalized ||
    normalized.includes("\0") ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:/.test(normalized) ||
    normalized.endsWith("/") ||
    normalized.split("/").includes("..")
  ) {
    throw new Error(`Invalid ZIP file path: ${path}`);
  }

  const name = Buffer.from(normalized);
  if (name.length > 0xffff) throw new Error(`ZIP file path exceeds 65535 bytes: ${path}`);

  return name;
};

async function* archive(sources: ZipSource[], signal: AbortSignal): AsyncGenerator<Uint8Array> {
  const entries: ZipEntry[] = [];
  let offset = 0;

  for (const { realPath, name } of sources) {
    signal.throwIfAborted();
    const stats = await stat(realPath);
    signal.throwIfAborted();
    if (!stats.isFile()) throw new Error(`not a file: ${realPath}`);

    const entry: ZipEntry = { name, offset, size: 0, compressedSize: 0, crc: 0 };
    const header = localHeader(name);
    yield header;
    offset += header.length;

    const compressor = new Deflate({
      raw: true, // ZIP entries contain DEFLATE without a zlib or gzip wrapper.
      level: 9, // Maximum compression, matching the previous ZIP writer.
      windowBits: 15, // A 32 KiB history window, matching Node's zlib default.
      memLevel: 8, // Compression memory setting used by Node's zlib default.
      strategy: 0, // Z_DEFAULT_STRATEGY balances string matching and Huffman coding.
      legacyHash: false, // Use Node's patched match-finding hash rather than classic zlib's.
    });

    let chunks: Uint8Array[] = [];
    compressor.onData = (chunk) => chunks.push(chunk);

    const input = createReadStream(realPath, { highWaterMark: 64 * 1024, signal });

    for await (const chunk of input) {
      entry.size += chunk.length;
      entry.crc = crc32.unsigned(chunk, entry.crc);

      if (!compressor.push(chunk, false)) throw new Error(compressor.msg);

      for (const output of chunks) {
        entry.compressedSize += output.length;
        yield output;
      }

      chunks = [];
    }

    if (!compressor.push(new Uint8Array(0), true)) throw new Error(compressor.msg);

    for (const output of chunks) {
      entry.compressedSize += output.length;
      yield output;
    }

    const descriptor = dataDescriptor(entry);
    yield descriptor;
    offset += entry.compressedSize + descriptor.length;
    entries.push(entry);
  }

  const directoryOffset = offset;

  for (const entry of entries) {
    const header = centralHeader(entry);
    yield header;
    offset += header.length;
  }

  yield endOfDirectory(entries.length, offset - directoryOffset, directoryOffset);
}

export const createZip = async (
  build: (zip: ZipBuilder) => Promise<void> | void,
): Promise<string> => {
  const sources: ZipSource[] = [];
  const builder: ZipBuilder = {
    addFile(realPath, archivePath) {
      sources.push({ realPath, name: entryName(archivePath) });
    },
    async addDirectory(root, prefix) {
      for (const { abs, rel } of await walkFiles(root)) {
        const archivePath = prefix ? toArchivePath(`${prefix}/${rel}`) : rel;
        builder.addFile(abs, archivePath);
      }
    },
  };

  await build(builder);

  const path = temporaryFile({ extension: "zip" });

  try {
    // Pipeline always supplies a signal, despite its optional Node type declarations.
    await pipeline(
      (options) => archive(sources, (options as { signal: AbortSignal }).signal),
      createWriteStream(path),
    );

    return path;
  } catch (error) {
    await rm(path, { force: true });

    throw error;
  }
};
