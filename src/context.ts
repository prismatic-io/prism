import { requireCommandContext } from "./command-context.js";
import {
  type Configuration,
  deleteProfile,
  type Profile,
  readProfileSelection,
  replaceCredentials,
  writeProfile,
} from "./config.js";
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

export const hasEnvironmentCredentials = (): boolean => {
  const env = getEnv();
  return Boolean(env.PRISM_ACCESS_TOKEN || env.PRISM_REFRESH_TOKEN);
};

const resolveAuthContext = async (): Promise<AuthContext> => {
  const profileOnly = requireCommandContext().profileOnly;
  const env = getEnv();
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
  if (!profileOnly && profile && env.PRISMATIC_URL && env.PRISMATIC_URL !== profile.prismaticUrl) {
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

export const getPrismaticUrl = async (): Promise<string> => (await getAuthContext()).url;

export const getAuthContext = (): Promise<AuthContext> => {
  const command = requireCommandContext();
  command.auth ??= resolveAuthContext();
  return command.auth;
};

export const setAuthContext = (context: AuthContext): void => {
  requireCommandContext().auth = Promise.resolve(context);
};

export const getProfileAuthContext = async (): Promise<ProfileAuthContext> => {
  const context = await getAuthContext();
  if (context.source !== "profile")
    throw new Error("This operation requires a profile auth session.");
  return context;
};

export const saveProfileCredentials = async (
  credentials: Configuration,
  { replace = true }: { replace?: boolean } = {},
): Promise<void> => {
  const target = await getProfileAuthContext();
  if (replace) {
    if (
      !target.profile ||
      !(await replaceCredentials(
        target.profileName,
        target.profile,
        credentials,
        target.configPath,
      ))
    ) {
      throw new Error(
        `Profile "${target.profileName}" changed while authenticating. Retry the command.`,
      );
    }
  } else {
    await writeProfile(
      target.profileName,
      { ...credentials, prismaticUrl: target.url },
      target.configPath,
    );
  }
  setAuthContext({
    ...target,
    ...credentials,
    tenantId: credentials.tenantId,
    profile: { ...credentials, prismaticUrl: target.url },
  });
};

export const deleteAuthProfile = async () => {
  const target = await getProfileAuthContext();
  const result = await deleteProfile(target.profileName, target.configPath);
  setAuthContext({
    ...target,
    profile: null,
    accessToken: undefined,
    refreshToken: undefined,
    tenantId: undefined,
  });
  return result;
};
