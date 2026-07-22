import path from "path";
import { z } from "zod";
import { DEFAULT_PRISMATIC_URL, getEnv } from "./env.js";
import { fs } from "./fs.js";
import { dumpYaml, loadYaml } from "./utils/serialize.js";
import { formatValidationError } from "./utils/validation.js";

export const configurationSchema = z.object({
  accessToken: z.string().min(1, "accessToken cannot be empty"),
  expiresIn: z.number().int().nonnegative(),
  refreshToken: z.string().min(1, "refreshToken cannot be empty"),
  scope: z.string(),
  tokenType: z.string().min(1, "tokenType cannot be empty"),
  tenantId: z.string().min(1).optional(),
});

export const profileSchema = configurationSchema.extend({
  prismaticUrl: z.string().min(1, "prismaticUrl cannot be empty"),
});

const CONFIG_VERSION = 1;
const hasProfile = (profiles: Record<string, Profile>, name: string): boolean =>
  Object.hasOwn(profiles, name);

export const configFileSchema = z
  .object({
    version: z.literal(CONFIG_VERSION),
    defaultProfile: z.string().min(1),
    profiles: z.record(z.string().min(1), profileSchema),
  })
  .refine(({ defaultProfile, profiles }) => hasProfile(profiles, defaultProfile), {
    message: "The default profile does not exist",
    path: ["defaultProfile"],
  });

export type Configuration = z.infer<typeof configurationSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ConfigFile = z.infer<typeof configFileSchema>;
export type ProfileName = string;

const resolveProfileUrl = (): string => getEnv().PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL;
const withProfile = (file: ConfigFile | null, name: ProfileName, profile: Profile): ConfigFile =>
  file
    ? { ...file, profiles: { ...file.profiles, [name]: profile } }
    : { version: CONFIG_VERSION, defaultProfile: name, profiles: { [name]: profile } };
let selectedProfile: string | undefined;

export const selectProfile = (name?: string): void => {
  selectedProfile = name;
};

const isUnversionedConfig = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === "object" &&
  raw !== null &&
  !("version" in raw) &&
  !("profiles" in raw) &&
  "accessToken" in raw;

const normalizeUnversionedConfig = (raw: Record<string, unknown>): unknown => ({
  version: CONFIG_VERSION,
  defaultProfile: "default",
  profiles: { default: { ...raw, prismaticUrl: resolveProfileUrl() } },
});

const getConfigFilePath = (): string => getEnv().PRISM_CONFIG_FILE;

const writeConfigFile = async (configFile: ConfigFile) => {
  const result = configFileSchema.safeParse(configFile);
  if (!result.success) {
    throw new Error(
      `Prism could not save its configuration:\n${formatValidationError(result.error)}`,
    );
  }
  const configFilePath = getConfigFilePath();
  await fs.mkdir(path.dirname(configFilePath), { recursive: true });
  const contents = dumpYaml(result.data, { skipInvalid: true });
  await fs.writeFile(configFilePath, contents, { encoding: "utf-8" });
};

export const readConfigFile = async (): Promise<ConfigFile | null> => {
  const configFilePath = getConfigFilePath();
  let contents: string;
  try {
    contents = await fs.readFile(configFilePath, { encoding: "utf-8" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }

  let raw: unknown;
  try {
    raw = loadYaml(contents.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse configuration at ${configFilePath}: ${message}`);
  }
  if (raw === null || raw === undefined) return null;

  const candidate = isUnversionedConfig(raw) ? normalizeUnversionedConfig(raw) : raw;
  const result = configFileSchema.safeParse(candidate);
  if (!result.success) {
    throw new Error(
      `Prism could not read the configuration at ${configFilePath}:\n${formatValidationError(result.error)}`,
    );
  }
  return result.data;
};

const resolveActiveName = (file: ConfigFile | null): ProfileName => {
  if (selectedProfile) return selectedProfile;
  const envProfile = getEnv().PRISM_PROFILE;
  if (envProfile) return envProfile;
  return file?.defaultProfile ?? "default";
};

export const getActiveProfileName = async (): Promise<ProfileName> =>
  resolveActiveName(await readConfigFile());

export const readProfileSelection = async (
  name?: ProfileName,
): Promise<{ name: ProfileName; profile: Profile | null }> => {
  const file = await readConfigFile();
  const profileName = name ?? resolveActiveName(file);
  return { name: profileName, profile: file?.profiles[profileName] ?? null };
};

export const readProfile = async (name?: ProfileName): Promise<Profile | null> =>
  (await readProfileSelection(name)).profile;

export const writeProfile = async (name: ProfileName, profile: Profile) => {
  await writeConfigFile(withProfile(await readConfigFile(), name, profile));
};

export const deleteProfile = async (name: ProfileName) => {
  const file = await readConfigFile();
  if (!file || !hasProfile(file.profiles, name)) return { deleted: false } as const;

  const { [name]: _removed, ...remaining } = file.profiles;
  const remainingNames = Object.keys(remaining);

  if (remainingNames.length === 0) {
    await fs.unlink(getConfigFilePath());
    return { deleted: true, isLast: true } as const;
  }

  const defaultChanged = file.defaultProfile === name;
  const defaultProfile = defaultChanged ? remainingNames[0] : file.defaultProfile;
  await writeConfigFile({ version: CONFIG_VERSION, defaultProfile, profiles: remaining });
  return { deleted: true, isLast: false, defaultChanged, defaultProfile } as const;
};

export const useProfile = async (name: ProfileName) => {
  const file = await readConfigFile();
  if (!file || !hasProfile(file.profiles, name)) {
    throw new Error(`Profile "${name}" does not exist.`);
  }
  if (file.defaultProfile === name) return;
  await writeConfigFile({ ...file, defaultProfile: name });
};

export const listProfiles = async (): Promise<
  { name: ProfileName; prismaticUrl: string; tenantId?: string; isDefault: boolean }[]
> => {
  const file = await readConfigFile();
  if (!file) return [];
  return Object.entries(file.profiles).map(([name, profile]) => ({
    name,
    prismaticUrl: profile.prismaticUrl,
    tenantId: profile.tenantId,
    isDefault: name === file.defaultProfile,
  }));
};

export const writeActiveProfile = async (config: Configuration, name?: ProfileName) => {
  const file = await readConfigFile();
  const profileName = name ?? resolveActiveName(file);
  const prismaticUrl = file?.profiles[profileName]?.prismaticUrl ?? resolveProfileUrl();
  await writeConfigFile(withProfile(file, profileName, { ...config, prismaticUrl }));
};
