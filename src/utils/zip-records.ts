// ZIP container records are separate from Pako's raw DEFLATE payload (RFC 1951).
// Layouts and field offsets below follow the ZIP specification §§4.3–4.5:
// https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
// https://www.rfc-editor.org/rfc/rfc1951.html
const UINT32_MAX = 0xffffffff;
const VERSION_MADE_BY = 0x033f;
const FLAGS = 0x0808;
const DOS_DATE = 0x0021;
const UNIX_MODE = 0o100644;
// Preserve yazl's central-only timestamp for signature compatibility, including
// its flags describing timestamps absent from the local header.
// https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/archivers/zip/X5455_ExtendedTimestamp.html
const TIMESTAMP = Buffer.from([0x55, 0x54, 5, 0, 3, 0, 0, 0, 0]);

export interface ZipEntry {
  name: Buffer;
  offset: number;
  size: number;
  compressedSize: number;
  crc: number;
}

const needsZip64 = (entry: ZipEntry): boolean =>
  Math.max(entry.offset, entry.size, entry.compressedSize) >= UINT32_MAX;

// Keep the streamed yazl 3 archive layout: UTF-8, data descriptors, DOS epoch,
// Unix creator, and the central-directory-only Unix epoch timestamp.
// ZIP specification §4.3.7: each file's local header precedes its compressed data.
// https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
export const localHeader = (name: Buffer): Buffer => {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(FLAGS, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt16LE(name.length, 26);

  return Buffer.concat([header, name]);
};

// ZIP specification §4.3.9: bit 3 requires a descriptor for CRC/sizes computed while streaming.
// https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
export const dataDescriptor = (entry: ZipEntry): Buffer => {
  const zip64 = needsZip64(entry);
  const record = Buffer.alloc(zip64 ? 24 : 16);
  record.writeUInt32LE(0x08074b50, 0);
  record.writeUInt32LE(entry.crc, 4);

  if (zip64) {
    record.writeBigUInt64LE(BigInt(entry.compressedSize), 8);
    record.writeBigUInt64LE(BigInt(entry.size), 16);
  } else {
    record.writeUInt32LE(entry.compressedSize, 8);
    record.writeUInt32LE(entry.size, 12);
  }

  return record;
};

// ZIP specification §§4.3.12, 4.5.3: directory metadata and ZIP64 size/offset overflow fields.
// https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
export const centralHeader = (entry: ZipEntry): Buffer => {
  const zip64 = needsZip64(entry);
  const extra = Buffer.alloc(zip64 ? 28 : 0);

  if (zip64) {
    extra.writeUInt16LE(1, 0);
    extra.writeUInt16LE(24, 2);
    extra.writeBigUInt64LE(BigInt(entry.size), 4);
    extra.writeBigUInt64LE(BigInt(entry.compressedSize), 12);
    extra.writeBigUInt64LE(BigInt(entry.offset), 20);
  }

  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(VERSION_MADE_BY, 4);
  header.writeUInt16LE(zip64 ? 45 : 20, 6);
  header.writeUInt16LE(FLAGS, 8);
  header.writeUInt16LE(8, 10);
  header.writeUInt16LE(DOS_DATE, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(zip64 ? UINT32_MAX : entry.compressedSize, 20);
  header.writeUInt32LE(zip64 ? UINT32_MAX : entry.size, 24);
  header.writeUInt16LE(entry.name.length, 28);
  header.writeUInt16LE(TIMESTAMP.length + extra.length, 30);
  header.writeUInt32LE((UNIX_MODE << 16) >>> 0, 38);
  header.writeUInt32LE(zip64 ? UINT32_MAX : entry.offset, 42);

  return Buffer.concat([header, entry.name, TIMESTAMP, extra]);
};

// ZIP specification §§4.3.14–4.3.16: directory terminator, with ZIP64 records on overflow.
// https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
export const endOfDirectory = (count: number, size: number, offset: number): Buffer => {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Math.min(count, 0xffff), 8);
  end.writeUInt16LE(Math.min(count, 0xffff), 10);
  end.writeUInt32LE(Math.min(size, UINT32_MAX), 12);
  end.writeUInt32LE(Math.min(offset, UINT32_MAX), 16);

  if (count < 0xffff && size < UINT32_MAX && offset < UINT32_MAX) return end;

  const zip64 = Buffer.alloc(56);
  zip64.writeUInt32LE(0x06064b50, 0);
  zip64.writeBigUInt64LE(44n, 4);
  zip64.writeUInt16LE(VERSION_MADE_BY, 12);
  zip64.writeUInt16LE(45, 14);
  zip64.writeBigUInt64LE(BigInt(count), 24);
  zip64.writeBigUInt64LE(BigInt(count), 32);
  zip64.writeBigUInt64LE(BigInt(size), 40);
  zip64.writeBigUInt64LE(BigInt(offset), 48);

  const locator = Buffer.alloc(20);
  locator.writeUInt32LE(0x07064b50, 0);
  locator.writeBigUInt64LE(BigInt(offset + size), 8);
  locator.writeUInt32LE(1, 16);

  return Buffer.concat([zip64, locator, end]);
};
