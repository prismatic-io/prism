import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  REGISTRY_FILE,
  registeredManifestKeys,
  registerManifest,
  registryLines,
} from "./componentRegistry.js";

let emptyRegistry: string;
let templateHeader: string;

beforeAll(async () => {
  emptyRegistry = (
    await readFile(
      new URL("../../../templates/integration/src/componentRegistry.ts.ejs", import.meta.url),
      "utf8",
    )
  ).replaceAll("\r\n", "\n");
  templateHeader = emptyRegistry.slice(0, emptyRegistry.indexOf("\n\nimport"));
});

let projectDir: string;

const writeRegistry = async (source: string) => {
  await mkdir(path.join(projectDir, "src"), { recursive: true });
  await writeFile(path.join(projectDir, REGISTRY_FILE), source);
};

const readRegistry = () => readFile(path.join(projectDir, REGISTRY_FILE), "utf8");

beforeEach(async () => {
  projectDir = await mkdtemp(path.join(tmpdir(), "prism-registry-"));
});

afterEach(async () => {
  await rm(projectDir, { recursive: true, force: true });
});

describe("registerManifest", () => {
  it("replaces the template placeholder with a default import and shorthand property", async () => {
    await writeRegistry(emptyRegistry);
    await expect(registerManifest(projectDir, "slack")).resolves.toBe("registered");
    expect(await readRegistry()).toBe(`${templateHeader}

import { componentManifests } from "@prismatic-io/spectral";
import slack from "./manifests/slack";

export const componentRegistry = componentManifests({
  slack,
});
`);
  });

  it("quotes hyphenated keys and camel-cases the local name", async () => {
    await writeRegistry(emptyRegistry);
    await registerManifest(projectDir, "google-drive");
    const source = await readRegistry();
    expect(source).toContain('import googleDrive from "./manifests/google-drive";');
    expect(source).toContain('"google-drive": googleDrive,');
  });

  it("leaves an already registered manifest unchanged", async () => {
    await writeRegistry(emptyRegistry);
    await registerManifest(projectDir, "slack");
    const before = await readRegistry();
    await expect(registerManifest(projectDir, "slack")).resolves.toBe("unchanged");
    expect(await readRegistry()).toBe(before);
  });

  it("appends beside existing entries", async () => {
    await writeRegistry(emptyRegistry);
    await registerManifest(projectDir, "slack");
    await registerManifest(projectDir, "salesforce");
    expect(await readRegistry()).toContain(`import slack from "./manifests/slack";
import salesforce from "./manifests/salesforce";

export const componentRegistry = componentManifests({
  slack,
  salesforce,
});
`);
  });

  it("keeps CRLF line endings when the registry uses them", async () => {
    await writeRegistry(emptyRegistry.replaceAll("\n", "\r\n"));
    await registerManifest(projectDir, "slack");
    const source = await readRegistry();
    expect(source).not.toMatch(/[^\r]\n/);
    expect(source).toContain('import slack from "./manifests/slack";\r\n');
    expect(source).toContain("{\r\n  slack,\r\n}");
  });

  it("keeps comments a user wrote beside existing entries", async () => {
    await writeRegistry(`import { componentManifests } from "@prismatic-io/spectral";
import slack from "./manifests/slack";

export const componentRegistry = componentManifests({
  // Slack is used by the notification flow
  slack,
});
`);
    await registerManifest(projectDir, "salesforce");
    const source = await readRegistry();
    expect(source).toContain("// Slack is used by the notification flow");
    expect(source).toContain("salesforce,");
  });

  it.each([
    { key: "3cx", localName: "threecx" },
    { key: "delete", localName: "deleteValue" },
  ])("registers key $key under a usable local name", async ({ key, localName }) => {
    await writeRegistry(emptyRegistry);
    await expect(registerManifest(projectDir, key)).resolves.toBe("registered");
    const source = await readRegistry();
    expect(source).toContain(`import ${localName} from "./manifests/${key}";`);
    expect(source).toContain(`"${key}": ${localName},`);
  });

  it("reports a local name collision as unsupported", async () => {
    await writeRegistry(emptyRegistry);
    await registerManifest(projectDir, "aws-s3");
    await expect(registerManifest(projectDir, "awsS3")).resolves.toBe("unsupported");
    expect((await readRegistry()).match(/import awsS3 from/g)).toHaveLength(1);
  });

  it("reports a type-only import of the manifest module as unsupported", async () => {
    await writeRegistry(`import { componentManifests } from "@prismatic-io/spectral";
import type { Slack } from "./manifests/slack";

export const componentRegistry = componentManifests({});
`);
    await expect(registerManifest(projectDir, "slack")).resolves.toBe("unsupported");
  });

  it("reuses an existing import for the manifest module", async () => {
    await writeRegistry(`import { componentManifests } from "@prismatic-io/spectral";
import slackManifest from "./manifests/slack";

export const componentRegistry = componentManifests({});
`);
    await registerManifest(projectDir, "slack");
    const source = await readRegistry();
    expect(source.match(/from "\.\/manifests\/slack"/g)).toHaveLength(1);
    expect(source).toContain('"slack": slackManifest,');
  });

  it("reports an unrecognized registry shape as unsupported", async () => {
    await writeRegistry(`import { componentManifests } from "@prismatic-io/spectral";
const manifests = {};
export const componentRegistry = componentManifests(manifests);
`);
    await expect(registerManifest(projectDir, "slack")).resolves.toBe("unsupported");
  });

  it("reports a missing registry file as unsupported", async () => {
    await expect(registerManifest(projectDir, "slack")).resolves.toBe("unsupported");
  });
});

describe("registeredManifestKeys", () => {
  it("returns the registered component keys", async () => {
    await writeRegistry(`import { componentManifests } from "@prismatic-io/spectral";
import slack from "./manifests/slack";
import googleDrive from "./manifests/google-drive";

export const componentRegistry = componentManifests({
  slack,
  "google-drive": googleDrive,
});
`);
    await expect(registeredManifestKeys(projectDir)).resolves.toEqual(
      new Set(["slack", "google-drive"]),
    );
  });

  it("reads identifier-named assignments and ignores spreads", async () => {
    await writeRegistry(`import { componentManifests } from "@prismatic-io/spectral";
import slackManifest from "./manifests/slack";
import shared from "./shared";

export const componentRegistry = componentManifests({
  slack: slackManifest,
  ...shared,
});
`);
    await expect(registeredManifestKeys(projectDir)).resolves.toEqual(new Set(["slack"]));
  });

  it("returns undefined when the registry file is missing", async () => {
    await expect(registeredManifestKeys(projectDir)).resolves.toBeUndefined();
  });

  it("returns undefined when the registry shape is not recognized", async () => {
    await writeRegistry("export const componentRegistry = {};\n");
    await expect(registeredManifestKeys(projectDir)).resolves.toBeUndefined();
  });
});

describe("registryLines", () => {
  it("produces valid lines a user adds by hand", () => {
    expect(registryLines("google-drive")).toEqual({
      importLine: 'import googleDrive from "./manifests/google-drive";',
      propertyLine: '"google-drive": googleDrive,',
    });
    expect(registryLines("slack").propertyLine).toBe("slack,");
    expect(registryLines("3cx")).toEqual({
      importLine: 'import threecx from "./manifests/3cx";',
      propertyLine: '"3cx": threecx,',
    });
  });
});
