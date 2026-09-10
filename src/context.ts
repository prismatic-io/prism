import { getProfile, type Profile } from "./config.js";
import { ConfigStore } from "./config-store.js";
import { DEFAULT_PRISMATIC_URL, getEnv } from "./env.js";

type CredentialsContext = {
  url: string;
  accessToken?: string;
  refreshToken?: string;
  tenantId?: string;
};
export type ProfileAuthContext = CredentialsContext & {
  source: "profile";
  store: ConfigStore;
  profileName: string;
  profile: Profile | null;
};
export type AuthContext = CredentialsContext & ({ source: "environment" } | ProfileAuthContext);

let selectedProfile: string | undefined;
export const selectProfile = (name?: string): void => {
  selectedProfile = name;
};
export const getConfigStore = (): ConfigStore => {
  const env = getEnv();
  return new ConfigStore(env.PRISM_CONFIG_FILE, {
    legacyUrl: env.PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL,
  });
};
export const readProfileSelection = async (name?: string) => {
  const store = getConfigStore();
  const state = await store.read();
  const profileName =
    name ?? selectedProfile ?? getEnv().PRISM_PROFILE ?? state?.defaultProfile ?? "default";
  return { store, name: profileName, profile: getProfile(state, profileName) };
};
export const getActiveProfileName = async (): Promise<string> =>
  (await readProfileSelection()).name;
export const readProfile = async (name?: string): Promise<Profile | null> =>
  (await readProfileSelection(name)).profile;

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

  const { store, name, profile } = await readProfileSelection();
  if (profile && env.PRISMATIC_URL && env.PRISMATIC_URL !== profile.prismaticUrl) {
    throw new Error(`PRISMATIC_URL does not match profile '${name}'.`);
  }

  return {
    source: "profile",
    store,
    profile,
    profileName: name,
    url: profile?.prismaticUrl ?? env.PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL,
    accessToken: profile?.accessToken,
    refreshToken: profile?.refreshToken,
    tenantId: profile?.tenantId,
  };
};

export const resolveProfileAuthContext = async (name?: string): Promise<ProfileAuthContext> => {
  const selection = await readProfileSelection(name);
  const profile = selection.profile;
  return {
    source: "profile",
    store: selection.store,
    profile,
    profileName: selection.name,
    url: profile?.prismaticUrl ?? getEnv().PRISMATIC_URL ?? DEFAULT_PRISMATIC_URL,
    accessToken: profile?.accessToken,
    refreshToken: profile?.refreshToken,
    tenantId: profile?.tenantId,
  };
};

export const getPrismaticUrl = async (): Promise<string> => (await getAuthContext()).url;
