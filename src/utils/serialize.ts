import { dump, load, DumpOptions, LoadOptions } from "js-yaml";

export const dumpYaml = (
  value: unknown,
  extraOptions?: Partial<DumpOptions>
): ReturnType<typeof dump> => dump(value, { ...extraOptions, noRefs: true });

export const loadYaml = (
  value: string,
  extraOptions?: Partial<LoadOptions>
): ReturnType<typeof load> => load(value, { ...extraOptions });
