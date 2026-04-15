import readline from "node:readline";
import inquirer from "inquirer";

export const confirm = async (message: string): Promise<boolean> => {
  const { value } = await inquirer.prompt<{ value: boolean }>([
    { type: "confirm", name: "value", message, default: false },
  ]);
  return value;
};

export const pressAnyKey = async (message: string): Promise<void> => {
  process.stdout.write(`${message}\n`);
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
