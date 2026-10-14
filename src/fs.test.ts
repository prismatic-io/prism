import { expect, it } from "vitest";
import { runWithMcpTransport } from "./command.js";
import { readStdin } from "./fs.js";

it("leaves MCP transport listeners untouched when a file command requests stdin", async () => {
  const listeners = process.stdin.eventNames().map((name) => [name, process.stdin.listeners(name)]);
  await expect(runWithMcpTransport(readStdin)).rejects.toMatchObject({ code: "STDIN_UNAVAILABLE" });
  expect(process.stdin.eventNames().map((name) => [name, process.stdin.listeners(name)])).toEqual(
    listeners,
  );
});
