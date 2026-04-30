import { homedir } from "os";
import path from "path";
import { z } from "zod";
import { exists, fs } from "./fs.js";
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

export type Configuration = z.infer<typeof configurationSchema>;

const defaultConfigFilePath = () => path.join(homedir(), ".config", "prism", "config.yml");

const getConfigFilePath = (): string => process.env.PRISM_CONFIG_FILE || defaultConfigFilePath();

const ensureConfigDirectoryExists = async (configFilePath: string) => {
  const dir = path.dirname(configFilePath);
  if (await exists(dir)) return;
  await fs.mkdir(dir, { recursive: true });
};

export const configFileExists = async () => exists(getConfigFilePath());

export const deleteConfig = async () => {
  if (!(await configFileExists())) return;
  return fs.unlink(getConfigFilePath());
};

export const writeConfig = async (config: Configuration) => {
  const result = configurationSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `Refusing to write invalid configuration:\n${formatValidationError(result.error)}`,
    );
  }
  const configFilePath = getConfigFilePath();
  await ensureConfigDirectoryExists(configFilePath);
  const contents = dumpYaml(result.data, { skipInvalid: true });
  await fs.writeFile(configFilePath, contents, { encoding: "utf-8" });
};

export const readConfig = async (): Promise<Configuration | null> => {
  const configFilePath = getConfigFilePath();
  if (!(await configFileExists())) return null;
  const contents = await fs.readFile(configFilePath, { encoding: "utf-8" });

  let raw: unknown;
  try {
    raw = loadYaml(contents.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse configuration at ${configFilePath}: ${message}`);
  }
  if (raw === null || raw === undefined) return null;

  const result = configurationSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid configuration at ${configFilePath}:\n${formatValidationError(result.error)}`,
    );
  }
  return result.data;
};
