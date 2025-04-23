import { dump, load, DumpOptions, LoadOptions } from "js-yaml";

export const dumpYaml = (
  value: unknown,
  extraOptions?: Partial<DumpOptions>,
): ReturnType<typeof dump> => dump(value, { ...extraOptions, noRefs: true, quotingType: '"' });

export const loadYaml = <T = unknown>(value: string, extraOptions?: Partial<LoadOptions>): T =>
  load(value, { ...extraOptions }) as T;
