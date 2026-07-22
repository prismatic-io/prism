import { readProfileSelection } from "./config.js";
import { DEFAULT_PRISMATIC_URL, getEnv } from "./env.js";

export type AuthContext = {
  source: "environment" | "profile";
  profileName?: string;
  url: string;
  accessToken?: string;
  refreshToken?: string;
  tenantId?: string;
};

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

  const { name, profile } = await readProfileSelection();
  if (profile && env.PRISMATIC_URL && env.PRISMATIC_URL !== profile.prismaticUrl) {
    throw new Error(`PRISMATIC_URL does not match profile '${name}'.`);
  }

  return {
    source: "profile",
    profileName: name,
    url: profile?.prismaticUrl ?? env.PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL,
    accessToken: profile?.accessToken,
    refreshToken: profile?.refreshToken,
    tenantId: profile?.tenantId,
  };
};

const resolveProfileAuthContext = async (): Promise<AuthContext> => {
  const selection = await readProfileSelection();
  const profile = selection.profile;
  return {
    source: "profile",
    profileName: selection.name,
    url: profile?.prismaticUrl ?? getEnv().PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL,
    accessToken: profile?.accessToken,
    refreshToken: profile?.refreshToken,
    tenantId: profile?.tenantId,
  };
};

export const getPrismaticUrl = async (): Promise<string> => (await getAuthContext()).url;
