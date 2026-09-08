import { runWithEnvironment } from "../runtime.js";
import { runCommand } from "../test-command.js";
import { Cli } from "incur";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defineCommand,
  commandMiddleware,
  commandVars,
  environmentOptions,
  globalOptions,
} from "../command.js";
import { spawnProcess, streamProcess } from "./process.js";

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async (): Promise<string> => {
  const directory = await mkdtemp(path.join(tmpdir(), "prism-process-test-"));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("spawnProcess", () => {
  it("resolves when the process exits successfully", async () => {
    await expect(spawnProcess([process.execPath, "--version"], {})).resolves.toMatchObject({
      exitCode: 0,
    });
  });

  it("runs an npm package script by its bare executable name", async () => {
    const directory = await createTemporaryDirectory();
    const outputPath = path.join(directory, "npm-result.json");
    const fixtureDirectory = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "fixtures",
      "npm-package",
    );
    const originalDirectory = process.cwd();

    try {
      process.chdir(fixtureDirectory);
      await spawnProcess(
        ["npm", "run", "process-smoke", "--", "value with spaces & shell | metacharacters"],
        {
          PRISM_PROCESS_TEST_ENV: "expected environment value",
          PRISM_PROCESS_TEST_OUTPUT: outputPath,
        },
      );
    } finally {
      process.chdir(originalDirectory);
    }

    await expect(readFile(outputPath, "utf8")).resolves.toBe(
      JSON.stringify({
        argument: "value with spaces & shell | metacharacters",
        environment: "expected environment value",
      }),
    );
  });

  it("reports a failing npm package script's exit code", async () => {
    const fixtureDirectory = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "fixtures",
      "npm-package",
    );
    const originalDirectory = process.cwd();

    try {
      process.chdir(fixtureDirectory);
      await expect(spawnProcess(["npm", "run", "process-failure"], {})).rejects.toThrow(
        /failed with exit code 19/,
      );
    } finally {
      process.chdir(originalDirectory);
    }
  });

  it("rejects with the command and exit code for a non-zero exit", async () => {
    await expect(spawnProcess([process.execPath, "-e", "process.exit(17)"], {})).rejects.toThrow(
      /failed with exit code 17/,
    );
  });

  it("rejects with a readable error when the executable cannot be started", async () => {
    await expect(spawnProcess(["prism-command-that-does-not-exist"], {})).rejects.toThrowError(
      "prism-command-that-does-not-exist",
    );
  });

  it("rejects an empty command", async () => {
    await expect(spawnProcess([], {})).rejects.toThrow("No command was provided.");
  });

  it.runIf(process.platform === "win32")(
    "runs a .cmd executable discovered through PATH",
    async () => {
      const fixtureDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
      const pathKey =
        Object.keys(process.env).find((key) => key.toLowerCase() === "path") ?? "PATH";

      await expect(
        spawnProcess(["prism-process-smoke", "expected"], {
          [pathKey]: `${fixtureDirectory}${path.delimiter}${process.env[pathKey] ?? ""}`,
        }),
      ).resolves.toMatchObject({ exitCode: 0 });
    },
  );
});

it("captures child stdout and stderr without writing into the agent transport", async () => {
  const stdout = vi.spyOn(process.stdout, "write");
  const stderr = vi.spyOn(process.stderr, "write");
  const command = defineCommand({
    run: () =>
      spawnProcess(
        [process.execPath, "-e", 'console.log("child output"); console.error("child diagnostic")'],
        {},
      ),
  });
  try {
    await expect(runCommand(command, ["--agent"])).resolves.toEqual({
      exitCode: 0,
      stdout: "child output\n",
      stderr: "child diagnostic\n",
    });
    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).not.toHaveBeenCalled();
  } finally {
    stdout.mockRestore();
    stderr.mockRestore();
  }
});

it("returns failed child diagnostics through the native CLI JSON error without leaking raw output", async () => {
  const stdout = vi.spyOn(process.stdout, "write");
  const stderr = vi.spyOn(process.stderr, "write");
  const command = defineCommand({
    run: () =>
      spawnProcess(
        [
          process.execPath,
          "-e",
          'console.log("CHILD_OUTPUT"); console.error("DIAGNOSTIC_SENTINEL"); process.exit(3)',
        ],
        {},
      ),
  });
  const cli = Cli.create("test", {
    vars: commandVars,
    env: environmentOptions,
    globals: globalOptions,
  })
    .use(commandMiddleware)
    .command("child", command);
  const output: string[] = [];
  const exits: number[] = [];
  try {
    await cli.serve(["child", "--json"], {
      stdout: (value) => {
        output.push(value);
      },
      exit: (code) => {
        exits.push(code);
      },
    });
    const result = JSON.parse(output.join(""));
    expect(result.message).toContain("exit code 3");
    expect(result.message).toContain("Child stdout:\nCHILD_OUTPUT");
    expect(result.message).toContain("Child stderr:\nDIAGNOSTIC_SENTINEL");
    expect(result.code).toBe("COMMAND_FAILED");
    expect(exits).toEqual([1]);
    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).not.toHaveBeenCalled();
  } finally {
    stdout.mockRestore();
    stderr.mockRestore();
  }
});

it("bounds failed child diagnostics and retains their tail", async () => {
  const command = defineCommand({
    run: () =>
      spawnProcess(
        [
          process.execPath,
          "-e",
          'console.error("A".repeat(20000) + "TAIL_SENTINEL"); process.exit(4)',
        ],
        {},
      ),
  });
  let failure: unknown;
  try {
    await runCommand(command, ["--agent"]);
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(Error);
  const message = (failure as Error).message;
  expect(message).toContain("Child stderr (last 8192 characters):");
  expect(message).toContain("TAIL_SENTINEL");
  expect(message.length).toBeLessThan(8500);
});

it("isolates concurrent child working directories and environments", async () => {
  const originalDirectory = process.cwd();
  const originalValue = process.env.PRISM_CHILD_TEST_VALUE;
  const directories = await Promise.all([createTemporaryDirectory(), createTemporaryDirectory()]);
  await Promise.all(
    directories.map((cwd, index) =>
      runWithEnvironment({ ...process.env, PRISM_CHILD_TEST_VALUE: `value-${index}` }, () =>
        spawnProcess(
          [
            process.execPath,
            "-e",
            'require("node:fs").writeFileSync("result.json", JSON.stringify({ cwd: process.cwd(), value: process.env.PRISM_CHILD_TEST_VALUE }))',
          ],
          {},
          { cwd },
        ),
      ),
    ),
  );
  for (const [index, directory] of directories.entries()) {
    const result = JSON.parse(await readFile(path.join(directory, "result.json"), "utf8"));
    // Windows may report an 8.3 path for the same directory; compare canonical paths.
    expect({ ...result, cwd: await realpath(result.cwd) }).toEqual({
      cwd: await realpath(directory),
      value: `value-${index}`,
    });
  }
  expect(process.cwd()).toBe(originalDirectory);
  expect(process.env.PRISM_CHILD_TEST_VALUE).toBe(originalValue);
});

describe("native subprocess streaming", () => {
  it("yields stdout and stderr incrementally in arrival order before completion", async () => {
    const events = [];
    const stream = streamProcess(
      [
        process.execPath,
        "-e",
        'console.log("out-1"); setTimeout(() => console.error("err-1"), 100); setTimeout(() => console.log("out-2"), 200); setTimeout(() => process.exit(0), 300)',
      ],
      {},
    );
    const first = await stream.next();
    expect(first).toEqual({ done: false, value: { type: "stdout", data: "out-1\n" } });
    events.push(first.value);
    for await (const event of stream) events.push(event);
    expect(events).toEqual([
      { type: "stdout", data: "out-1\n" },
      { type: "stderr", data: "err-1\n" },
      { type: "stdout", data: "out-2\n" },
      { type: "completed", exitCode: 0 },
    ]);
  });

  it("terminates the child when the consumer closes the iterator", async () => {
    const stream = streamProcess(
      [process.execPath, "-e", "console.log(process.pid); setInterval(() => {}, 1000)"],
      {},
    );
    const first = await stream.next();
    const pid = Number(first.value && "data" in first.value ? first.value.data : undefined);
    expect(pid).toBeGreaterThan(0);
    await stream.return(undefined);
    expect(() => process.kill(pid, 0)).toThrow();
  });

  it("honors external cancellation without reporting successful completion", async () => {
    const abort = new AbortController();
    const stream = streamProcess(
      [process.execPath, "-e", 'console.log("started"); setInterval(() => {}, 1000)'],
      {},
      { signal: abort.signal },
    );
    await stream.next();
    abort.abort(new Error("test cancelled"));
    await expect(stream.next()).rejects.toThrow("test cancelled");
  });

  it("retains bounded diagnostics on failure after streaming output", async () => {
    const stream = streamProcess(
      [
        process.execPath,
        "-e",
        'console.error("A".repeat(20000) + "TAIL_SENTINEL"); process.exit(4)',
      ],
      {},
    );
    let failure: unknown;
    const events = [];
    try {
      for await (const event of stream) events.push(event);
    } catch (error) {
      failure = error;
    }
    expect(events.some((event) => event.type === "stderr")).toBe(true);
    expect(events.some((event) => event.type === "completed")).toBe(false);
    expect(failure).toBeInstanceOf(Error);
    const message = (failure as Error).message;
    expect(message).toContain("exit code 4");
    expect(message).toContain("Child stderr (last 8192 characters):");
    expect(message).toContain("TAIL_SENTINEL");
    expect(message.length).toBeLessThan(8500);
  });
});
