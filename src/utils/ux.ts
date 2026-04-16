import { setTimeout as sleep } from "node:timers/promises";
import { ux as oclifUx } from "@oclif/core";
import { confirm, pressAnyKey } from "./prompts.js";
import { printTable, tableFlags } from "./table.js";
import { hyperlink } from "./terminal.js";

// Drop-in for the cli-ux `ux` namespace removed in @oclif/core v4. Call sites swap their
// `@oclif/core` import for this one and keep `ux.table`, `ux.confirm`, etc. unchanged.
export const ux = {
  ...oclifUx,
  table: Object.assign(printTable, { flags: tableFlags }),
  confirm,
  anykey: pressAnyKey,
  url: (text: string, uri: string): void => {
    process.stdout.write(`${hyperlink(text, uri)}\n`);
  },
  log: (...args: unknown[]): void => {
    console.log(...args);
  },
  wait: (ms: number): Promise<void> => sleep(ms),
};
