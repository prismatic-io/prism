import { promisify } from "node:util";
import { expect, it } from "vitest";
import yauzl from "yauzl";
import {
  centralHeader,
  dataDescriptor,
  endOfDirectory,
  localHeader,
  type ZipEntry,
} from "./zip-records.js";

const open = promisify(yauzl.fromBuffer);

it.each([
  0xfffffffe, 0xffffffff, 0x100000000,
])("encodes ZIP entry sizes and offsets at the 32-bit boundary (%i)", async (size) => {
  const entry: ZipEntry = {
    name: Buffer.from("large.bin"),
    offset: size,
    size,
    compressedSize: size,
    crc: 1234,
  };
  const central = centralHeader(entry);
  const zip = await open(Buffer.concat([central, endOfDirectory(1, central.length, 0)]), {
    lazyEntries: true,
  });
  const parsed = await new Promise<yauzl.Entry>((resolve, reject) => {
    zip.on("entry", resolve);
    zip.on("error", reject);
    zip.readEntry();
  });
  zip.close();
  expect(parsed).toMatchObject({
    fileName: "large.bin",
    uncompressedSize: size,
    compressedSize: size,
    relativeOffsetOfLocalHeader: size,
    crc32: 1234,
  });
  const descriptor = dataDescriptor(entry);
  expect(descriptor.readUInt32LE(0)).toBe(0x08074b50);
  expect(descriptor.readUInt32LE(4)).toBe(1234);
  if (size < 0xffffffff) {
    expect(descriptor.length).toBe(16);
    expect(descriptor.readUInt32LE(8)).toBe(size);
    expect(descriptor.readUInt32LE(12)).toBe(size);
  } else {
    expect(descriptor.length).toBe(24);
    expect(descriptor.readBigUInt64LE(8)).toBe(BigInt(size));
    expect(descriptor.readBigUInt64LE(16)).toBe(BigInt(size));
  }
});

it("writes ZIP64 archives with 65535 entries readable by an independent ZIP reader", async () => {
  const count = 65535;
  const records: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (let i = 0; i < count; i++) {
    const name = Buffer.from(`${i}.txt`);
    const entry = { name, offset, size: 0, compressedSize: 2, crc: 0 };
    const record = Buffer.concat([localHeader(name), Buffer.from([3, 0]), dataDescriptor(entry)]);
    records.push(record);
    central.push(centralHeader(entry));
    offset += record.length;
  }
  const directory = Buffer.concat(central);
  const zip = await open(
    Buffer.concat([...records, directory, endOfDirectory(count, directory.length, offset)]),
    {
      lazyEntries: true,
    },
  );
  expect(zip.entryCount).toBe(count);
  const names: string[] = [];
  await new Promise<void>((resolve, reject) => {
    zip.on("error", reject);
    zip.on("end", resolve);
    zip.on("entry", (entry: yauzl.Entry) => {
      names.push(entry.fileName);
      zip.readEntry();
    });
    zip.readEntry();
  });
  expect(names.length).toBe(count);
  expect(names[0]).toBe("0.txt");
  expect(names.at(-1)).toBe("65534.txt");
}, 30_000);

it.each([
  [0xffffffff, 10],
  [10, 0xffffffff],
])("uses ZIP64 for a large central directory or offset (%i, %i)", (size, offset) => {
  const end = endOfDirectory(1, size, offset);
  expect(end.readUInt32LE(0)).toBe(0x06064b50);
  expect(end.readBigUInt64LE(40)).toBe(BigInt(size));
  expect(end.readBigUInt64LE(48)).toBe(BigInt(offset));
  expect(end.readUInt32LE(56)).toBe(0x07064b50);
  expect(end.readBigUInt64LE(64)).toBe(BigInt(size + offset));
  expect(end.readUInt32LE(76)).toBe(0x06054b50);
});
