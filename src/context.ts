import { type Profile, readProfileSelection } from "./config.js";
import { DEFAULT_PRISMATIC_URL, getEnv } from "./env.js";

type CredentialsContext = {
  url: string;
  accessToken?: string;
  refreshToken?: string;
  tenantId?: string;
};

export type ProfileAuthContext = CredentialsContext & {
  source: "profile";
  configPath: string;
  profileName: string;
  profile: Profile | null;
};
export type AuthContext = CredentialsContext & ({ source: "environment" } | ProfileAuthContext);

let profileOnly = false;

export const hasEnvironmentCredentials = (): boolean => {
  const env = getEnv();
  return Boolean(env.PRISM_ACCESS_TOKEN || env.PRISM_REFRESH_TOKEN);
};

export const useDefaultAuthContext = (): void => {
  profileOnly = false;
};

export const useProfileAuthContext = (): void => {
  profileOnly = true;
};

export const getAuthContext = async (): Promise<AuthContext> => {
  const env = getEnv();
  if (profileOnly) return resolveProfileAuthContext();
  if (!profileOnly && (env.PRISM_ACCESS_TOKEN || env.PRISM_REFRESH_TOKEN)) {
    return {
      source: "environment",
      url: env.PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL,
      accessToken: env.PRISM_ACCESS_TOKEN,
      refreshToken: env.PRISM_REFRESH_TOKEN,
      tenantId: env.PRISMATIC_TENANT_ID,
    };
  }

  const { configPath, name, profile } = await readProfileSelection();
  if (profile && env.PRISMATIC_URL && env.PRISMATIC_URL !== profile.prismaticUrl) {
    throw new Error(`PRISMATIC_URL does not match profile '${name}'.`);
  }

  return {
    source: "profile",
    configPath,
    profile,
    profileName: name,
    url: profile?.prismaticUrl ?? env.PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL,
    accessToken: profile?.accessToken,
    refreshToken: profile?.refreshToken,
    tenantId: profile?.tenantId,
  };
};

export const resolveProfileAuthContext = async (name?: string): Promise<ProfileAuthContext> => {
  const url = getEnv().PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL;
  const selection = await readProfileSelection(name);
  const profile = selection.profile;
  return {
    source: "profile",
    configPath: selection.configPath,
    profile,
    profileName: selection.name,
    url: profile?.prismaticUrl ?? url,
    accessToken: profile?.accessToken,
    refreshToken: profile?.refreshToken,
    tenantId: profile?.tenantId,
  };
};

export const getPrismaticUrl = async (): Promise<string> => (await getAuthContext()).url;
