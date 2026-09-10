import { randomUUID } from "node:crypto";
import { devNull } from "node:os";
import path from "node:path";
import {
  type Credentials,
  decodeConfig,
  encodeConfig,
  getProfile,
  type Profile,
  type SavedProfiles,
} from "./config.js";
import { fs } from "./fs.js";

// Follow dangling file aliases as well as existing ancestors, so deletion and
// recreation keep targeting the same file. Do not hide permission or cycle errors.
const canonicalPath = async (filePath: string, links = 0): Promise<string> => {
  try {
    return await fs.realpath(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const entry = await fs.lstat(filePath).catch((statError: NodeJS.ErrnoException) => {
      if (statError.code === "ENOENT") return null;
      throw statError;
    });
    if (entry?.isSymbolicLink()) {
      if (links >= 40)
        throw Object.assign(new Error(`Too many symbolic links: ${filePath}`), { code: "ELOOP" });
      const target = await fs.readlink(filePath);
      return canonicalPath(path.resolve(path.dirname(filePath), target), links + 1);
    }
    const parent = path.dirname(filePath);
    if (entry || parent === filePath) throw error;
    return path.join(await canonicalPath(parent, links), path.basename(filePath));
  }
};

export type DeleteProfileResult =
  | { deleted: false }
  | { deleted: true; isLast: true }
  | { deleted: true; isLast: false; defaultChanged: boolean; defaultProfile: string };

export class ConfigStore {
  readonly path: string;
  private resolvedPath?: Promise<string>;
  private static readonly updates = new Map<string, Promise<void>>();

  constructor(
    filePath: string,
    private readonly options: { legacyUrl: string },
  ) {
    this.path = filePath === devNull ? devNull : path.resolve(filePath);
  }

  private get filePath(): Promise<string> {
    this.resolvedPath ??=
      this.path === devNull ? Promise.resolve(devNull) : canonicalPath(this.path);
    return this.resolvedPath;
  }

  async read(): Promise<SavedProfiles | null> {
    return this.readFile(await this.filePath);
  }

  async listProfiles() {
    const state = await this.read();
    return Object.entries(state?.profiles ?? {}).map(([name, profile]) => ({
      name,
      prismaticUrl: profile.prismaticUrl,
      tenantId: profile.tenantId,
      isDefault: name === state?.defaultProfile,
    }));
  }

  async saveProfile(name: string, profile: Profile): Promise<void> {
    await this.update((state) => ({
      state: {
        defaultProfile: state?.defaultProfile ?? name,
        profiles: { ...state?.profiles, [name]: profile },
      },
      result: undefined,
    }));
  }

  async setDefaultProfile(name: string): Promise<void> {
    await this.update((state) => {
      if (!state || !getProfile(state, name)) throw new Error(`Profile "${name}" does not exist.`);
      return {
        state: state.defaultProfile === name ? state : { ...state, defaultProfile: name },
        result: undefined,
      };
    });
  }

  async deleteProfile(name: string): Promise<DeleteProfileResult> {
    return this.update<DeleteProfileResult>((state) => {
      if (!state || !getProfile(state, name)) return { state, result: { deleted: false } as const };
      const { [name]: _removed, ...profiles } = state.profiles;
      const names = Object.keys(profiles);
      if (names.length === 0)
        return { state: null, result: { deleted: true, isLast: true } as const };
      const defaultChanged = state.defaultProfile === name;
      const defaultProfile = defaultChanged ? names[0] : state.defaultProfile;
      return {
        state: { defaultProfile, profiles },
        result: { deleted: true, isLast: false, defaultChanged, defaultProfile } as const,
      };
    });
  }

  // A network refresh may finish after logout or a newer login/tenant switch.
  // Only update the session that actually supplied the refresh credentials.
  async replaceCredentials(
    name: string,
    expected: Profile,
    credentials: Credentials,
  ): Promise<boolean> {
    return this.update((state) => {
      const current = getProfile(state, name);
      const matches =
        current &&
        current.accessToken === expected.accessToken &&
        current.refreshToken === expected.refreshToken &&
        current.expiresIn === expected.expiresIn &&
        current.scope === expected.scope &&
        current.tokenType === expected.tokenType &&
        current.prismaticUrl === expected.prismaticUrl &&
        current.tenantId === expected.tenantId;
      if (!state || !matches) return { state, result: false };
      return {
        state: {
          ...state,
          profiles: {
            ...state.profiles,
            [name]: { ...credentials, prismaticUrl: expected.prismaticUrl },
          },
        },
        result: true,
      };
    });
  }

  // Coordination is process-local. The synchronous transform cannot await HTTP
  // or issue independent writes; only this method commits its resulting state.
  private async update<T>(
    change: (state: SavedProfiles | null) => { state: SavedProfiles | null; result: T },
  ): Promise<T> {
    const filePath = await this.filePath;
    const previous = ConfigStore.updates.get(filePath) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    ConfigStore.updates.set(filePath, current);
    await previous;
    try {
      const state = await this.readFile(filePath);
      const changed = change(state);
      if (changed.state !== state) {
        if (changed.state) await this.replaceFile(filePath, encodeConfig(changed.state));
        else if (filePath !== devNull) await fs.unlink(filePath);
      }
      return changed.result;
    } finally {
      release();
      if (ConfigStore.updates.get(filePath) === current) ConfigStore.updates.delete(filePath);
    }
  }

  private async readFile(filePath: string): Promise<SavedProfiles | null> {
    const contents = await fs.readFile(filePath, "utf-8").catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    return decodeConfig(contents, { legacyUrl: this.options.legacyUrl, path: this.path });
  }

  private async replaceFile(filePath: string, contents: string): Promise<void> {
    if (filePath === devNull) return;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(temporaryPath, contents, {
        encoding: "utf-8",
        mode: 0o600,
        flag: "wx",
        flush: true,
      });
      await fs.rename(temporaryPath, filePath);
    } catch (error) {
      await fs.rm(temporaryPath, { force: true }).catch(() => {});
      throw error;
    }
  }
}
