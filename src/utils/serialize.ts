import { type DumpOptions, dump, type LoadOptions, load } from "js-yaml";

export const dumpYaml = (
  value: unknown,
  extraOptions?: Partial<DumpOptions>,
): ReturnType<typeof dump> => dump(value, { ...extraOptions, noRefs: true });

export const loadYaml = <T = unknown>(
  value: string,
  extraOptions?: Partial<LoadOptions>,
): T | undefined => {
  if (value.trim() === "") {
    return undefined;
  }
  return load(value, { ...extraOptions }) as T | undefined;
};
