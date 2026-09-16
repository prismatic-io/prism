import { mkdir, symlink } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { manifestDirectory } from "./manifests.js";

const prismRequire = createRequire(new URL("../../../package.json", import.meta.url));
const spectralRoot = path.dirname(prismRequire.resolve("@prismatic-io/spectral/package.json"));
const generatorsDir = path.join(spectralRoot, "dist", "generators");
const templatesDir = path.join(generatorsDir, "componentManifest", "templates");

type GenerateManifest = (props: Record<string, unknown>) => Promise<void>;
type CreateTemplate = (props: Record<string, unknown>) => Promise<unknown>;

const { generateManifest } = prismRequire(
  path.join(generatorsDir, "componentManifest", "generateManifest.js"),
) as { generateManifest: GenerateManifest };
const { createTemplate } = prismRequire(path.join(generatorsDir, "utils", "createTemplate.js")) as {
  createTemplate: CreateTemplate;
};

export const SPECTRAL_ROOT = spectralRoot;

export const linkSpectral = async (projectDir: string) => {
  const scope = path.join(projectDir, "node_modules", "@prismatic-io");
  await mkdir(scope, { recursive: true });
  await symlink(spectralRoot, path.join(scope, "spectral"), "junction");
};

export interface FixtureManifest {
  key: string;
  public: boolean;
  signature?: string | null;
}

export const generateFixtureManifest = async (
  projectDir: string,
  { key, public: isPublic, signature = `sig-${key}` }: FixtureManifest,
) => {
  const destination = manifestDirectory(projectDir, key);
  const component = {
    key,
    public: isPublic,
    signature,
    display: { label: key, description: `${key} component` },
    actions: {
      ping: {
        key: "ping",
        display: { label: "Ping", description: "Ping the service" },
        inputs: [
          { key: "connection", label: "Connection", type: "connection", required: true },
          { key: "message", label: "Message", type: "string", required: true },
        ],
        examplePayload: { data: { ok: true } },
      },
    },
    triggers: {},
    dataSources: {},
    connections: [
      {
        key: "apiKey",
        label: "API Key",
        comments: "",
        inputs: [{ key: "apiKey", label: "API Key", type: "password", required: true }],
      },
    ],
  };
  await generateManifest({
    component,
    dryRun: false,
    verbose: false,
    templatesDir,
    manifestDir: destination,
    generatedSourceDir: destination,
    reusableConnectionStableKeys: [],
    createEntryPointFiles: () =>
      createTemplate({
        source: path.join(templatesDir, "index.ts.ejs"),
        destination: path.join(destination, "index.ts"),
        data: { component },
        dryRun: false,
        verbose: false,
      }),
    successMessage: "",
  });
  return destination;
};
