import { type Output, x } from "tinyexec";

export const spawnProcess = async (
  [command, ...args]: string[],
  env: Record<string, string>,
): Promise<void> => {
  if (!command) {
    throw new Error("No command was provided.");
  }

  let result: Output;
  try {
    result = await x(command, args, {
      nodeOptions: {
        env: { ...process.env, ...env },
        stdio: "inherit",
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
    throw new Error(`Command failed with ${status}: ${command} ${args.join(" ")}`);
  }
};
