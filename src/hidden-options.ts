import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Boolean flags a command accepts but never advertises. incur lists every field of a command's
 * options schema in `--help`, `--schema`, `--llms` and the MCP tool schema, and has no way to
 * hide one, so these stay out of the schema: the CLI strips them from argv before incur parses
 * it, and the command reads them with {@link hiddenOption}.
 */
export const HIDDEN_OPTIONS: Readonly<Record<string, readonly string[]>> = {
  // Scaffolds one of Prismatic's own @prismatic-io/components-* packages.
  "components:init": ["prismatic-internal"],
};

const store = new AsyncLocalStorage<ReadonlySet<string>>();

/**
 * Removes `names` given as `--<name>` (or `--<name>=true|false`) before any `--` delimiter,
 * returning the remaining argv and the names set to true.
 */
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

/** Whether the running command was given the hidden flag `--<name>`. */
export const hiddenOption = (name: string): boolean => store.getStore()?.has(name) ?? false;
