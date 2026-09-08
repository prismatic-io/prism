import { Cli } from "incur";
import { beforeEach, expect, it, vi } from "vitest";
import { isLoggedIn, login } from "../../auth.js";
import {
  commandMiddleware,
  commandVars,
  environmentOptions,
  globalOptions,
  runWithMcpTransport,
} from "../../command.js";
import LoginCommand from "./index.js";

vi.mock("../../auth.js", () => ({ isLoggedIn: vi.fn(), login: vi.fn() }));
vi.mock("../../config.js", () => ({ getActiveProfileName: vi.fn(async () => "default") }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isLoggedIn).mockResolvedValue(false);
});
const native = () =>
  Cli.create("prism", { globals: globalOptions, vars: commandVars, env: environmentOptions })
    .use(commandMiddleware)
    .command("login", LoginCommand);
const run = async (args: string[]) => {
  const output: string[] = [];
  await native().serve(["login", "--yes", ...args], {
    stdout: (chunk) => output.push(chunk),
    exit: () => {},
  });
  return output.join("");
};
it("rejects buffered authentication before opening the callback listener", async () => {
  expect(await run(["--json"])).toContain("AUTHENTICATION_REQUIRED");
  expect(login).not.toHaveBeenCalled();
});
it("rejects unauthenticated MCP login before opening the callback listener", async () => {
  expect(await runWithMcpTransport(() => run(["--format", "jsonl"]))).toContain(
    "AUTHENTICATION_REQUIRED",
  );
  expect(login).not.toHaveBeenCalled();
});
it("allows already-authenticated profiles in buffered mode", async () => {
  vi.mocked(isLoggedIn).mockResolvedValue(true);
  expect(await run(["--json"])).toContain('"alreadyAuthenticated": true');
  expect(login).not.toHaveBeenCalled();
});
it("emits the native challenge before authentication completes", async () => {
  let finish!: () => void;
  let challengeSeen!: () => void;
  const seen = new Promise<void>((resolve) => {
    challengeSeen = resolve;
  });
  const output: string[] = [];
  vi.mocked(login).mockImplementation(async (options) => {
    options?.onChallenge?.("https://auth.example.com/challenge");
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
  });
  const serving = native().serve(["login", "--yes", "--format", "jsonl"], {
    stdout(chunk) {
      output.push(chunk);
      if (chunk.includes("authentication-challenge")) challengeSeen();
    },
    exit: () => {},
  });
  await seen;
  expect(output.join("")).not.toContain('"type":"authenticated"');
  finish();
  await serving;
  const chunks = output.flatMap((text) =>
    text
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line)),
  );
  expect(chunks.filter((value) => value.type === "chunk").map((value) => value.data)).toEqual([
    {
      type: "authentication-challenge",
      profile: "default",
      url: "https://auth.example.com/challenge",
    },
    { type: "authenticated", profile: "default", alreadyAuthenticated: false },
  ]);
});
