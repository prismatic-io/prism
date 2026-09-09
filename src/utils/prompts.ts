import readline from "node:readline";
import inquirer from "inquirer";
import { commandGlobals, isAgentExecution, writeCommandStatus } from "../command.js";

export const confirm = async (message: string): Promise<boolean> => {
  if (isAgentExecution()) {
    if (commandGlobals().yes === true) return true;
    throw Object.assign(
      new Error(`Confirmation required: ${message} Re-run with --yes to approve this operation.`),
      { exitCode: 2 },
    );
  }
  const { value } = await inquirer.prompt<{ value: boolean }>([
    { type: "confirm", name: "value", message, default: false },
  ]);
  return value;
};

export const pressAnyKey = async (message: string): Promise<void> => {
  writeCommandStatus(message);
  if (isAgentExecution()) {
    if (commandGlobals().yes === true) return;
    throw Object.assign(
      new Error(`Interactive continuation required: ${message} Re-run with --yes to continue.`),
      { exitCode: 2 },
    );
  }
  await new Promise<void>((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const input = process.stdin;
    const wasRaw = typeof input.isRaw === "boolean" ? input.isRaw : false;
    if (typeof input.setRawMode === "function") {
      input.setRawMode(true);
    }
    input.resume();
    input.once("data", () => {
      if (typeof input.setRawMode === "function") {
        input.setRawMode(wasRaw);
      }
      input.pause();
      rl.close();
      resolve();
    });
  });
};
