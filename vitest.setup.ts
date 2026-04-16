import { beforeEach, onTestFailed, vi } from "vitest";

export const TEST_PRISMATIC_URL = "https://example.com";

vi.mock("./src/auth.js", () => ({
  getAccessToken: vi.fn(() => Promise.resolve("test-token")),
  prismaticUrl: TEST_PRISMATIC_URL,
  createRequestParams: (data: Record<string, string | undefined>): string =>
    new URLSearchParams(
      Object.entries(data).filter(([, v]) => v !== undefined) as [string, string][],
    ).toString(),
}));

vi.mock("./src/utils/http.js", () => ({
  fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
  createFetch: () => fetch,
}));

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

const buffers = {
  stdout: [] as string[],
  stderr: [] as string[],
};

const chunkToString = (chunk: unknown): string => {
  if (typeof chunk === "string") return chunk;
  if (chunk instanceof Uint8Array) return Buffer.from(chunk).toString("utf8");
  return String(chunk);
};

const interceptWrite = (buffer: string[]): ProxyHandler<typeof process.stdout.write> => ({
  apply(_target, _thisArg, args: unknown[]) {
    buffer.push(chunkToString(args[0]));
    const callback = typeof args[1] === "function" ? args[1] : args[2];
    if (typeof callback === "function") (callback as () => void)();
    return true;
  },
});

process.stdout.write = new Proxy(process.stdout.write, interceptWrite(buffers.stdout));
process.stderr.write = new Proxy(process.stderr.write, interceptWrite(buffers.stderr));

beforeEach(() => {
  buffers.stdout.length = 0;
  buffers.stderr.length = 0;
  onTestFailed(() => {
    if (buffers.stdout.length > 0) {
      originalStdoutWrite(`\n--- captured stdout ---\n${buffers.stdout.join("")}\n`);
    }
    if (buffers.stderr.length > 0) {
      originalStderrWrite(`\n--- captured stderr ---\n${buffers.stderr.join("")}\n`);
    }
  });
});

export const getStdout = (): string => buffers.stdout.join("");
export const getStderr = (): string => buffers.stderr.join("");
