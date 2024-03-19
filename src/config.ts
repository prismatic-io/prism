import { homedir } from "os";
import path from "path";
import { fs, exists } from "./fs.js";
import { loadYaml, dumpYaml } from "./utils/serialize.js";

export interface Configuration {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
  tokenType: string;
}

const configDirectory = path.join(homedir(), ".config", "prism");
const configFilePath = path.join(configDirectory, "config.yml");

const ensureConfigDirectoryExists = async () => {
  if (await exists(configDirectory)) return;
  await fs.mkdir(configDirectory, { recursive: true });
};

export const configFileExists = async () => exists(configFilePath);

export const deleteConfig = async () => {
  if (!(await configFileExists())) return;
  return fs.unlink(configFilePath);
};

export const writeConfig = async (config: Configuration) => {
  await ensureConfigDirectoryExists();
  const contents = dumpYaml(config, { skipInvalid: true });
  await fs.writeFile(configFilePath, contents, { encoding: "utf-8" });
};

export const readConfig = async (): Promise<Configuration | null> => {
  if (!(await configFileExists())) return null;
  const contents = await fs.readFile(configFilePath, { encoding: "utf-8" });
  const config = (await loadYaml(contents.toString())) as Configuration;
  return config;
};
