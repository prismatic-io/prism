import { AsyncLocalStorage } from "node:async_hooks";
import { resolve } from "node:path";
import type { AuthContext } from "./context.js";

// One instance per invocation, shared by its asynchronous work only.
export type CommandContext = {
  readonly cwd: string;
  environment: NodeJS.ProcessEnv;
  profileName?: string;
  profileOnly: boolean;
  auth?: Promise<AuthContext>;
  authentication?: Promise<AuthContext>;
};

const commands = new AsyncLocalStorage<{ command: CommandContext; cwd: string }>();
export const createCommandContext = (
  options: Partial<
    Pick<CommandContext, "cwd" | "environment" | "profileName" | "profileOnly">
  > = {},
): CommandContext => ({
  ...options,
  cwd: resolve(getWorkingDirectory(), options.cwd ?? "."),
  environment: { ...(options.environment ?? process.env) },
  profileOnly: options.profileOnly ?? false,
});
export const getCommandContext = (): CommandContext | undefined => commands.getStore()?.command;
export const runWithCommandContext = <T>(context: CommandContext, run: () => T): T =>
  commands.run({ command: context, cwd: context.cwd }, run);

export const requireCommandContext = (): CommandContext => {
  const command = getCommandContext();
  if (!command) throw new Error("Authentication requires an active command session.");
  return command;
};

/** The active directory for this asynchronous scope, without changing process.cwd(). */
export const getWorkingDirectory = (): string => commands.getStore()?.cwd ?? process.cwd();

/** Override only the directory; authentication and other invocation state stay shared. */
export const withWorkingDirectory = <T>(directory: string, run: () => T): T => {
  const cwd = resolve(getWorkingDirectory(), directory);
  const command = getCommandContext() ?? createCommandContext({ cwd });
  return commands.run({ command, cwd }, run);
};
