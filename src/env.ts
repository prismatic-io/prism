import { homedir } from "os";
import path from "path";
import { z } from "zod";

// Treat empty action inputs as unset.
const normalizeEmpty = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

const optionalEnvString = z.preprocess(normalizeEmpty, z.string().min(1).optional());

export const DEFAULT_PRISMATIC_URL = "https://app.prismatic.io";

export const getDefaultConfigFilePath = (): string =>
  path.join(homedir(), ".config", "prism", "config.yml");

const envSchema = z.object({
  PRISMATIC_URL: optionalEnvString,
  PRISM_CONFIG_FILE: z.preprocess(
    normalizeEmpty,
    z.string().min(1).default(getDefaultConfigFilePath),
  ),
  PRISM_PROFILE: optionalEnvString,
  PRISM_ACCESS_TOKEN: optionalEnvString,
  PRISM_REFRESH_TOKEN: optionalEnvString,
  PRISMATIC_TENANT_ID: optionalEnvString,
});

export type Env = z.infer<typeof envSchema>;

export const getEnv = (): Env => envSchema.parse(process.env);
