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

export interface MultiTenantConfiguration {
  [prismaticUrl: string]: Configuration;
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

export const deleteTenantConfig = async (prismaticUrl?: string) => {
  if (!(await configFileExists())) return;

  const targetUrl = prismaticUrl ?? process.env.PRISMATIC_URL ?? "https://app.prismatic.io";
  const contents = await fs.readFile(configFilePath, { encoding: "utf-8" });
  const config = (await loadYaml(contents.toString())) as Configuration | MultiTenantConfiguration;

  if (isLegacyConfiguration(config)) {
    // If it's legacy and we're deleting the default URL, delete entire file
    const defaultUrl = "https://app.prismatic.io";
    if (targetUrl === defaultUrl) {
      return fs.unlink(configFilePath);
    }
    return; // Nothing to delete for other URLs in legacy format
  }

  if (isMultiTenantConfiguration(config)) {
    delete config[targetUrl];

    // If no tenants left, delete the entire file
    if (Object.keys(config).length === 0) {
      return fs.unlink(configFilePath);
    }

    // Otherwise, write the updated config
    const updatedContents = dumpYaml(config, { skipInvalid: true });
    await fs.writeFile(configFilePath, updatedContents, { encoding: "utf-8" });
  }
};

export const hasLegacyConfig = async (): Promise<boolean> => {
  if (!(await configFileExists())) return false;
  const contents = await fs.readFile(configFilePath, { encoding: "utf-8" });
  const config = (await loadYaml(contents.toString())) as Configuration | MultiTenantConfiguration;
  return isLegacyConfiguration(config);
};

export const writeConfig = async (config: Configuration) => {
  await ensureConfigDirectoryExists();

  const prismaticUrl = process.env.PRISMATIC_URL ?? "https://app.prismatic.io";
  let multiTenantConfig: MultiTenantConfiguration = {};

  // Check if existing config file exists and read it
  if (await configFileExists()) {
    const contents = await fs.readFile(configFilePath, { encoding: "utf-8" });
    const existingConfig = (await loadYaml(contents.toString())) as
      | Configuration
      | MultiTenantConfiguration;

    if (isLegacyConfiguration(existingConfig)) {
      // Migrate legacy config to multi-tenant format
      // Place the existing config under the current PRISMATIC_URL
      multiTenantConfig[prismaticUrl] = existingConfig;
    } else if (isMultiTenantConfiguration(existingConfig)) {
      multiTenantConfig = existingConfig;
    }
  }

  // Update or add the configuration for the current tenant
  multiTenantConfig[prismaticUrl] = config;

  const contents = dumpYaml(multiTenantConfig, { skipInvalid: true });
  await fs.writeFile(configFilePath, contents, { encoding: "utf-8" });
};

export const isLegacyConfiguration = (config: any): config is Configuration => {
  return (
    config !== null &&
    config !== undefined &&
    typeof config === "object" &&
    typeof config.accessToken === "string" &&
    typeof config.refreshToken === "string"
  );
};

export const isMultiTenantConfiguration = (config: any): config is MultiTenantConfiguration => {
  return (
    config !== null &&
    config !== undefined &&
    typeof config === "object" &&
    !isLegacyConfiguration(config)
  );
};

export const readConfig = async (): Promise<Configuration | null> => {
  if (!(await configFileExists())) return null;
  const contents = await fs.readFile(configFilePath, { encoding: "utf-8" });
  const config = (await loadYaml(contents.toString())) as Configuration | MultiTenantConfiguration;

  // Handle legacy single-tenant configuration
  if (isLegacyConfiguration(config)) {
    return config;
  }

  // Handle multi-tenant configuration
  if (isMultiTenantConfiguration(config)) {
    const prismaticUrl = process.env.PRISMATIC_URL ?? "https://app.prismatic.io";
    return config[prismaticUrl] || null;
  }

  return null;
};
