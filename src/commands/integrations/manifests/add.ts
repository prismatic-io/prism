import path from "node:path";
import { Cli, z } from "incur";
import { getAccessToken } from "../../../auth.js";
import { writeCommandOutput } from "../../../command.js";
import { getWorkingDirectory } from "../../../command-context.js";
import { getPrismaticUrl } from "../../../context.js";
import { CommandFailedError, ValidationError } from "../../../errors.js";
import { exists } from "../../../fs.js";
import { warningsOutput } from "../../../output.js";
import { type ComponentIdentity, identifyComponent } from "../../../utils/component/catalog.js";
import { requestFailure } from "../../../utils/failure.js";
import {
  REGISTRY_FILE,
  type RegistrationOutcome,
  registerManifest,
  registryLines,
} from "../../../utils/integration/componentRegistry.js";
import {
  MANIFEST_GENERATOR,
  MINIMUM_SPECTRAL_VERSION,
  manifestDirectory,
  resolveManifestGenerator,
} from "../../../utils/integration/manifests.js";
import { spawnProcess } from "../../../utils/process.js";
import { componentKeyArg, resolveVisibility, visibilityOptions } from "../../components/schemas.js";

const registrationSchema = z.enum(["registered", "unchanged", "unsupported", "skipped"]);

interface ManifestRow {
  key: string;
  public: boolean;
  versionNumber: number;
  path: string;
  registration: RegistrationOutcome | "skipped";
}

export default Cli.command({
  description:
    "Generate component manifests into a Code Native Integration and register them in its component registry",
  hint: `Run this from the integration's root directory. The generator ships with @prismatic-io/spectral ${MINIMUM_SPECTRAL_VERSION} or later, so install dependencies first.`,
  output: z.object({
    items: z.array(
      z.object({
        key: z.string(),
        public: z.boolean(),
        versionNumber: z.number().int(),
        path: z.string(),
        registration: registrationSchema,
      }),
    ),
    ...warningsOutput,
  }),
  examples: [
    { description: "Add the Slack manifest:", args: { componentKeys: ["slack"] } },
    {
      description: "Add several manifests at once:",
      args: { componentKeys: ["slack", "salesforce"] },
    },
    {
      description: "Add a private component that shares a key with a public one:",
      args: { componentKeys: ["acme"] },
      options: { private: true },
    },
    {
      description: "Generate a manifest without editing the component registry:",
      args: { componentKeys: ["slack"] },
      options: { register: false },
    },
  ],
  args: z.object({
    componentKeys: z.array(componentKeyArg("to generate a manifest for")).min(1),
  }),
  options: z.object({
    ...visibilityOptions("the manifest"),
    register: z
      .boolean()
      .default(true)
      .describe("Register each manifest in src/componentRegistry.ts (use --no-register to skip)"),
  }),
  async run(context) {
    const { args, options: flags } = context;
    const projectDir = getWorkingDirectory();
    if (!(await exists(path.join(projectDir, "package.json")))) {
      throw new ValidationError({
        message: `No package.json exists in ${projectDir}. Run this command from the root of a Code Native Integration.`,
      });
    }

    const generator = await resolveManifestGenerator(projectDir);
    if (generator.status === "missing") {
      throw new CommandFailedError({
        message: `@prismatic-io/spectral is not installed in ${projectDir}. Install the integration's dependencies, then retry.`,
      });
    }
    if (generator.status === "unsupported") {
      throw new CommandFailedError({
        message: `@prismatic-io/spectral ${generator.version} does not provide ${MANIFEST_GENERATOR}. Upgrade to ${MINIMUM_SPECTRAL_VERSION} or later.`,
      });
    }

    const components: ComponentIdentity[] = [];
    for (const componentKey of args.componentKeys) {
      try {
        components.push(
          await identifyComponent({ key: componentKey, public: resolveVisibility(flags) }),
        );
      } catch (error) {
        return context.error(requestFailure(error, "COMPONENT_LOOKUP_FAILED", true));
      }
    }

    const [accessToken, prismaticUrl] = await Promise.all([getAccessToken(), getPrismaticUrl()]);
    const childEnv: Record<string, string> = { PRISMATIC_URL: prismaticUrl, PRISM_NO_AGENT: "1" };
    if (accessToken) childEnv.PRISM_ACCESS_TOKEN = accessToken;

    const items: ManifestRow[] = [];
    for (const component of components) {
      await spawnProcess(
        [...generator.command, component.key, ...(component.public ? [] : ["--private"])],
        childEnv,
      );

      const outputDir = manifestDirectory(projectDir, component.key);
      const relativeDir = path.relative(projectDir, outputDir);
      if (!(await exists(path.join(outputDir, "index.ts")))) {
        throw new CommandFailedError({
          message: `${MANIFEST_GENERATOR} finished but ${relativeDir} was not created.`,
        });
      }

      const registration = flags.register
        ? await registerManifest(projectDir, component.key)
        : "skipped";
      if (registration === "unsupported") {
        const lines = registryLines(component.key);
        writeCommandOutput(
          `${REGISTRY_FILE} could not be updated for '${component.key}'. Add these lines by hand:\n  ${lines.importLine}\n  ${lines.propertyLine}`,
          "stderr",
        );
      }

      items.push({
        key: component.key,
        public: component.public,
        versionNumber: component.versionNumber,
        path: relativeDir,
        registration,
      });
    }

    return context.ok(
      { items },
      {
        cta: {
          commands: [
            {
              command: "integrations manifests list",
              description: "Show the manifests installed in this integration",
            },
          ],
        },
      },
    );
  },
});
