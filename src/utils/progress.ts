import { writeCommandProgress, writeCommandStatus } from "../command.js";

export function startAction(message: string): void {
  writeCommandProgress(`${message}...`);
}

export function stopAction(message = "done"): void {
  writeCommandStatus(` ${message}`);
}
