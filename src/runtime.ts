import { AsyncLocalStorage } from "node:async_hooks";
import {
  type CommandContext,
  createCommandContext,
  runWithCommandContext,
} from "./command-context.js";

export type RuntimeState = {
  authSession?: CommandContext;
  printRequests: boolean;
  profileOnly: boolean;
  quiet: boolean;
  selectedProfile?: string;
  environment?: NodeJS.ProcessEnv;
};

const runtime = new AsyncLocalStorage<RuntimeState>();

export const runWithRuntimeState = <T>(state: RuntimeState, callback: () => T): T =>
  runtime.run(state, () =>
    state.authSession ? runWithCommandContext(state.authSession, callback) : callback(),
  );

export const getRuntimeState = (): RuntimeState | undefined => runtime.getStore();

export const isPrintRequestsEnabled = (): boolean =>
  getRuntimeState()?.printRequests ?? Boolean(process.env.PRISMATIC_PRINT_REQUESTS);

export const isQuiet = (): boolean => getRuntimeState()?.quiet ?? Boolean(process.env.PRISM_QUIET);

export const getRuntimeEnvironment = (): NodeJS.ProcessEnv =>
  getRuntimeState()?.environment ?? process.env;
export const runWithEnvironment = <T>(environment: NodeJS.ProcessEnv, callback: () => T): T =>
  runWithRuntimeState(
    {
      printRequests: false,
      profileOnly: false,
      quiet: false,
      ...getRuntimeState(),
      // Component dev commands explicitly load a different authentication environment.
      authSession: createCommandContext({
        environment,
        profileName: getRuntimeState()?.selectedProfile || undefined,
        profileOnly: getRuntimeState()?.profileOnly ?? false,
      }),
      environment: { ...environment },
    },
    callback,
  );
