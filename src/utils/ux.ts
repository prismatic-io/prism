import { setTimeout as sleep } from "node:timers/promises";
import {
  commandSignal,
  isAgentExecution,
  writeCommandStatus,
  writeCommandProgress,
} from "../command.js";
import { confirm, pressAnyKey } from "./prompts.js";
import { printTable, tableFlags } from "./table.js";
import { hyperlink } from "./terminal.js";

// Human status helpers; native command results carry agent output.
export const ux = {
  action: {
    start(message: string): void {
      writeCommandProgress(`${message}...`);
    },
    stop(message = "done", _options?: unknown): void {
      if (isAgentExecution()) return;
      writeCommandStatus(` ${message}`);
    },
  },
  table: Object.assign(printTable, { flags: tableFlags }),
  confirm,
  anykey: pressAnyKey,
  url: (text: string, uri: string): void => {
    writeCommandStatus(hyperlink(text, uri));
  },
  log: (...args: unknown[]): void => {
    writeCommandStatus(args.map(String).join(" "));
  },
  error(message: string, options?: { exit?: number }): never {
    const error = new Error(message);
    const exitCode = options?.exit ?? 2;
    Object.assign(error, { exitCode });
    throw error;
  },
  wait: (ms: number): Promise<void> => sleep(ms, undefined, { signal: commandSignal() }),
};
