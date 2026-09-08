import { AsyncLocalStorage } from "node:async_hooks";

export type RuntimeState = {
  printRequests: boolean;
  profileOnly: boolean;
  quiet: boolean;
  selectedProfile?: string;
  environment?: NodeJS.ProcessEnv;
};

const runtime = new AsyncLocalStorage<RuntimeState>();

export const runWithRuntimeState = <T>(state: RuntimeState, callback: () => T): T =>
  runtime.run(state, callback);

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
      environment: { ...environment },
    },
    callback,
  );
