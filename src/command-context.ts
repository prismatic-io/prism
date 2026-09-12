import { AsyncLocalStorage } from "node:async_hooks";
import type { AuthContext } from "./context.js";

// One instance per invocation, shared by its asynchronous work only.
export type CommandContext = {
  environment: NodeJS.ProcessEnv;
  profileName?: string;
  profileOnly: boolean;
  auth?: Promise<AuthContext>;
  authentication?: Promise<AuthContext>;
};

const commands = new AsyncLocalStorage<CommandContext>();
export const createCommandContext = (
  options: Partial<Pick<CommandContext, "environment" | "profileName" | "profileOnly">> = {},
): CommandContext => ({
  ...options,
  environment: { ...(options.environment ?? process.env) },
  profileOnly: options.profileOnly ?? false,
});
export const getCommandContext = (): CommandContext | undefined => commands.getStore();
export const runWithCommandContext = <T>(context: CommandContext, run: () => T): T =>
  commands.run(context, run);

export const requireCommandContext = (): CommandContext => {
  const command = getCommandContext();
  if (!command) throw new Error("Authentication requires an active command session.");
  return command;
};
