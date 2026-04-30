import { homedir } from "os";
import path from "path";
import { exists, fs } from "./fs.js";
import { dumpYaml, loadYaml } from "./utils/serialize.js";

export interface Configuration {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
  tokenType: string;
  tenantId?: string;
}

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
  const configFilePath = getConfigFilePath();
  await ensureConfigDirectoryExists(configFilePath);
  const contents = dumpYaml(config, { skipInvalid: true });
  await fs.writeFile(configFilePath, contents, { encoding: "utf-8" });
};

export const readConfig = async (): Promise<Configuration | null> => {
  if (!(await configFileExists())) return null;
  const contents = await fs.readFile(getConfigFilePath(), { encoding: "utf-8" });
  const config = (await loadYaml(contents.toString())) as Configuration | null | undefined;
  return config ?? null;
};
