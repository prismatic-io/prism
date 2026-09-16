import { createRequire } from "node:module";
import path from "node:path";
import { z } from "zod";
import { exists, fs } from "../../fs.js";

export const MANIFEST_GENERATOR = "cni-component-manifest";
export const MINIMUM_SPECTRAL_VERSION = "10.6.0";

export const manifestsDirectory = (projectDir: string) => path.join(projectDir, "src", "manifests");

export const manifestDirectory = (projectDir: string, componentKey: string) =>
  path.join(manifestsDirectory(projectDir), componentKey);

export interface InstalledManifest {
  key: string;
  public: boolean | null;
  signature: string | null;
  path: string;
}

const readField = (source: string, pattern: RegExp) => source.match(pattern)?.[1];

export const readInstalledManifests = async (projectDir: string): Promise<InstalledManifest[]> => {
  const root = manifestsDirectory(projectDir);
  if (!(await exists(root))) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  const manifests = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const indexFile = path.join(root, entry.name, "index.ts");
        if (!(await exists(indexFile))) return undefined;
        const source = await fs.readFile(indexFile, "utf8");
        const visibility = readField(source, /^\s*public:\s*(true|false),/m);
        return {
          key: readField(source, /^\s*key:\s*"([^"]+)",/m) ?? entry.name,
          public: visibility === undefined ? null : visibility === "true",
          signature: readField(source, /^\s*signature:\s*"([^"]+)",/m) ?? null,
          path: path.relative(projectDir, path.join(root, entry.name)),
        };
      }),
  );
  return manifests
    .filter((manifest) => manifest !== undefined)
    .sort((a, b) => a.key.localeCompare(b.key));
};

const spectralPackageSchema = z.object({
  version: z.string(),
  bin: z.record(z.string(), z.string()).optional(),
});

export type ManifestGenerator =
  | { status: "ready"; version: string; command: string[] }
  | { status: "missing" }
  | { status: "unsupported"; version: string };

export const resolveManifestGenerator = async (projectDir: string): Promise<ManifestGenerator> => {
  let packageFile: string;
  try {
    packageFile = createRequire(path.join(projectDir, "package.json")).resolve(
      "@prismatic-io/spectral/package.json",
    );
  } catch {
    return { status: "missing" };
  }
  const spectral = spectralPackageSchema.parse(JSON.parse(await fs.readFile(packageFile, "utf8")));
  const bin = spectral.bin?.[MANIFEST_GENERATOR];
  if (!bin) return { status: "unsupported", version: spectral.version };
  return {
    status: "ready",
    version: spectral.version,
    command: [process.execPath, path.resolve(path.dirname(packageFile), bin)],
  };
};
