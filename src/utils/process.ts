import { spawn } from "child_process";

export const spawnProcess = (
  [command, ...args]: string[],
  env: Record<string, string>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...env },
    });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on("close", (code) => (code === 0 ? resolve() : reject()));
  });
};
