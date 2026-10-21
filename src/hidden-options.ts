import { AsyncLocalStorage } from "node:async_hooks";

/** incur exposes every schema option in help and MCP; parse hidden flags separately. */
export const HIDDEN_OPTIONS: Readonly<Record<string, readonly string[]>> = {
  "components:init": ["prismatic-internal"],
};

const store = new AsyncLocalStorage<ReadonlySet<string>>();

/** Extract hidden booleans before `--`, leaving other arguments for incur. */
export const extractHiddenOptions = (
  argv: readonly string[],
  names: readonly string[],
): { argv: string[]; set: Set<string> } => {
  const set = new Set<string>();
  const delimiter = argv.indexOf("--");
  const remaining: string[] = [];
  argv.forEach((token, index) => {
    const beforeDelimiter = delimiter < 0 || index < delimiter;
    const match = beforeDelimiter ? /^--([a-z0-9-]+)(?:=(true|false))?$/.exec(token) : null;
    if (match && names.includes(match[1] as string)) {
      if (match[2] === "false") set.delete(match[1] as string);
      else set.add(match[1] as string);
      return;
    }
    remaining.push(token);
  });
  return { argv: remaining, set };
};

export const runWithHiddenOptions = <T>(set: ReadonlySet<string>, callback: () => T): T =>
  store.run(set, callback);

export const hiddenOption = (name: string): boolean => store.getStore()?.has(name) ?? false;
