import { getRuntimeEnvironment } from "../runtime.js";
import { type Output, x } from "tinyexec";
import { commandSignal, isAgentExecution, writeCommandOutput } from "../command.js";

const diagnosticLimit = 8192;
const childDiagnostic = (
  name: string,
  value: string,
  truncated = value.length > diagnosticLimit,
): string => {
  if (!value) return "";
  const output = value.slice(-diagnosticLimit).trimEnd();
  return `\n\nChild ${name}${truncated ? ` (last ${diagnosticLimit} characters)` : ""}:\n${output}`;
};

export const spawnProcess = async (
  [command, ...args]: string[],
  env: Record<string, string>,
  options: { cwd?: string; signal?: AbortSignal } = {},
): Promise<Output> => {
  if (!command) {
    throw new Error("No command was provided.");
  }

  let result: Output;
  try {
    result = await x(command, args, {
      signal: options.signal ?? commandSignal(),
      nodeOptions: {
        env: { ...getRuntimeEnvironment(), ...env },
        cwd: options.cwd,
        stdio: isAgentExecution() ? ["ignore", "pipe", "pipe"] : "inherit",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to start ${JSON.stringify(command)}: ${message}`, {
      cause: error,
    });
  }

  if (result.exitCode !== 0) {
    const status =
      result.exitCode !== undefined
        ? `exit code ${result.exitCode}`
        : "termination before reporting an exit code";
    const diagnostics = isAgentExecution()
      ? childDiagnostic("stdout", result.stdout) + childDiagnostic("stderr", result.stderr)
      : "";
    throw new Error(`Command failed with ${status}: ${command} ${args.join(" ")}${diagnostics}`);
  }

  if (isAgentExecution()) {
    if (result.stdout) writeCommandOutput(result.stdout);
    if (result.stderr) writeCommandOutput(result.stderr, "stderr");
  }
  return result;
};

export type ProcessEvent =
  | { type: "stdout" | "stderr"; data: string }
  | { type: "completed"; exitCode: 0 };

/** Stream pipe chunks in arrival order with bounded buffering and diagnostics. */
export async function* streamProcess(
  [command, ...args]: string[],
  env: Record<string, string>,
  options: { cwd?: string; signal?: AbortSignal } = {},
): AsyncGenerator<ProcessEvent> {
  if (!command) throw new Error("No command was provided.");
  options.signal?.throwIfAborted();
  const child = x(command, args, {
    nodeOptions: {
      cwd: options.cwd,
      env: { ...getRuntimeEnvironment(), ...env },
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
    },
  }).process;
  if (!child) throw new Error(`Failed to start ${JSON.stringify(command)}`);

  const pending: Array<Extract<ProcessEvent, { data: string }>> = [];
  const tails = { stdout: "", stderr: "" };
  const sizes = { stdout: 0, stderr: 0 };
  let queued = 0;
  let settled = false;
  let failure: Error | undefined;
  let exitCode: number | null = null;
  let signalCode: NodeJS.Signals | null = null;
  let wake: (() => void) | undefined;
  let killTimer: NodeJS.Timeout | undefined;
  let treeTermination: Promise<unknown> | undefined;
  const notify = () => {
    wake?.();
    wake = undefined;
  };
  const sendSignal = (signal: NodeJS.Signals) => {
    try {
      if (process.platform !== "win32" && child.pid) process.kill(-child.pid, signal);
      else child.kill(signal);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") failure ??= error as Error;
    }
  };
  const stop = () => {
    if (settled || killTimer) return;
    pending.length = 0;
    queued = 0;
    if (process.platform === "win32" && child.pid) {
      treeTermination = Promise.resolve(
        x("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
          timeout: 1000,
          nodeOptions: { stdio: "ignore" },
        }),
      ).then(
        (result) => {
          if (result.exitCode !== 0) sendSignal("SIGTERM");
        },
        () => sendSignal("SIGTERM"),
      );
    } else sendSignal("SIGTERM");
    killTimer = setTimeout(() => sendSignal("SIGKILL"), 1000);
    killTimer.unref();
    // Drain paused pipes so close can settle even if the consumer stopped reading.
    child.stdout?.resume();
    child.stderr?.resume();
  };
  const completed = new Promise<void>((resolve) => {
    child.once("error", (error) => {
      failure = error;
    });
    child.once("close", (code, signal) => {
      exitCode = code;
      signalCode = signal;
      settled = true;
      if (killTimer) clearTimeout(killTimer);
      notify();
      resolve();
    });
  });
  for (const type of ["stdout", "stderr"] as const) {
    child[type]?.setEncoding("utf8");
    child[type]?.on("data", (data: string) => {
      sizes[type] += data.length;
      tails[type] = (tails[type] + data).slice(-diagnosticLimit);
      if (!killTimer) {
        pending.push({ type, data });
        queued += data.length;
        if (queued >= 65536) {
          child.stdout?.pause();
          child.stderr?.pause();
        }
      }
      notify();
    });
  }
  options.signal?.addEventListener("abort", stop, { once: true });
  if (options.signal?.aborted) stop();
  try {
    while (!settled || pending.length > 0) {
      if (pending.length === 0)
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      const event = pending.shift();
      if (event) {
        queued -= event.data.length;
        if (queued < 32768 && !killTimer) {
          child.stdout?.resume();
          child.stderr?.resume();
        }
        yield event;
      }
    }
    await completed;
    options.signal?.throwIfAborted();
    if (failure)
      throw new Error(`Failed to start ${JSON.stringify(command)}: ${failure.message}`, {
        cause: failure,
      });
    if (exitCode !== 0) {
      throw new Error(
        `Command failed with ${exitCode === null ? `signal ${signalCode ?? "unknown"}` : `exit code ${exitCode}`}: ${command} ${args.join(" ")}${childDiagnostic("stdout", tails.stdout, sizes.stdout > diagnosticLimit)}${childDiagnostic("stderr", tails.stderr, sizes.stderr > diagnosticLimit)}`,
      );
    }
    yield { type: "completed", exitCode: 0 };
  } finally {
    options.signal?.removeEventListener("abort", stop);
    stop();
    await completed;
    await treeTermination;
  }
}
