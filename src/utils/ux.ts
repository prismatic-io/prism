import { setTimeout as sleep } from "node:timers/promises";
import {
  isAgentExecution,
  requestCommandExitCode,
  writeCommandOutput,
  writeCommandProgress,
} from "../command.js";
import { confirm, pressAnyKey } from "./prompts.js";
import { printTable, tableFlags } from "./table.js";
import { hyperlink } from "./terminal.js";

// Shared human-output helpers. Agent output is collected by the command execution context.
export const ux = {
  action: {
    start(message: string): void {
      writeCommandProgress(`${message}...`);
    },
    stop(message = "done", _options?: unknown): void {
      if (isAgentExecution()) return;
      writeCommandOutput(` ${message}`);
    },
  },
  table: Object.assign(printTable, { flags: tableFlags }),
  confirm,
  anykey: pressAnyKey,
  url: (text: string, uri: string): void => {
    writeCommandOutput(hyperlink(text, uri));
  },
  log: (...args: unknown[]): void => {
    writeCommandOutput(args.map(String).join(" "));
  },
  error(message: string, _options?: unknown): never {
    const error = new Error(message);
    requestCommandExitCode(2);
    Object.assign(error, { exitCode: 2 });
    throw error;
  },
  wait: (ms: number): Promise<void> => sleep(ms),
};
