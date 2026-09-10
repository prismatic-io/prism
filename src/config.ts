import { z } from "zod";
import { dumpYaml, loadYaml } from "./utils/serialize.js";
import { formatValidationError } from "./utils/validation.js";

export const credentialsSchema = z.object({
  accessToken: z.string().min(1, "accessToken cannot be empty"),
  expiresIn: z.number().int().nonnegative(),
  refreshToken: z.string().min(1, "refreshToken cannot be empty"),
  scope: z.string(),
  tokenType: z.string().min(1, "tokenType cannot be empty"),
  tenantId: z.string().min(1).optional(),
});

export const profileSchema = credentialsSchema.extend({
  prismaticUrl: z.string().min(1, "prismaticUrl cannot be empty"),
});

// Zod records discard "__proto__" keys. Validate entries without treating a
// profile name as an object prototype, then rebuild own data properties.
const profilesSchema = z
  .preprocess(
    (value) =>
      typeof value === "object" && value !== null && !Array.isArray(value)
        ? new Map(Object.entries(value))
        : value,
    z.map(z.string().min(1), profileSchema),
  )
  .transform((profiles) => Object.fromEntries(profiles));

export const savedProfilesSchema = z
  .object({
    defaultProfile: z.string().min(1),
    profiles: profilesSchema,
  })
  .refine(({ defaultProfile, profiles }) => Object.hasOwn(profiles, defaultProfile), {
    message: "The default profile does not exist",
    path: ["defaultProfile"],
  });

export type Credentials = z.infer<typeof credentialsSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type SavedProfiles = z.infer<typeof savedProfilesSchema>;

const configFileSchema = savedProfilesSchema.safeExtend({ version: z.literal(1) });

export const getProfile = (state: SavedProfiles | null, name: string): Profile | null =>
  state && Object.hasOwn(state.profiles, name) ? state.profiles[name] : null;

export const decodeConfig = (
  contents: string | null,
  { legacyUrl, path }: { legacyUrl: string; path: string },
): SavedProfiles | null => {
  if (contents === null) return null;

  let raw: unknown;
  try {
    raw = loadYaml(contents);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse configuration at ${path}: ${message}`);
  }
  if (raw === null || raw === undefined) return null;

  const isLegacy =
    typeof raw === "object" && !("version" in raw) && !("profiles" in raw) && "accessToken" in raw;
  const candidate = isLegacy
    ? {
        version: 1,
        defaultProfile: "default",
        profiles: { default: { ...raw, prismaticUrl: legacyUrl } },
      }
    : raw;
  const result = configFileSchema.safeParse(candidate);
  if (!result.success) {
    throw new Error(
      `Prism could not read the configuration at ${path}:\n${formatValidationError(result.error)}`,
    );
  }
  const { version: _version, ...state } = result.data;
  return state;
};

export const encodeConfig = (state: SavedProfiles): string => {
  const result = savedProfilesSchema.safeParse(state);
  if (!result.success) {
    throw new Error(
      `Prism could not save its configuration:\n${formatValidationError(result.error)}`,
    );
  }
  return dumpYaml({ version: 1, ...result.data });
};
