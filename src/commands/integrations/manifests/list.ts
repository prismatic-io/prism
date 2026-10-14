import { Cli, z } from "incur";
import { getWorkingDirectory } from "../../../command-context.js";
import { registeredManifestKeys } from "../../../utils/integration/componentRegistry.js";
import { readInstalledManifests } from "../../../utils/integration/manifests.js";
import { printTable, tableFlags, tableOutputSchema } from "../../../utils/table.js";

export default Cli.command({
  outputPolicy: "agent-only",
  description:
    "List the component manifests installed in a Code Native Integration and whether each is registered",
  hint: "Run this from the integration's root directory.",
  output: tableOutputSchema(["key", "public", "registered", "signature", "path"]),
  examples: [{ description: "List the manifests in the current integration:" }],
  options: z.object({ ...tableFlags() }),
  async run(context) {
    const projectDir = getWorkingDirectory();
    const [manifests, registered] = await Promise.all([
      readInstalledManifests(projectDir),
      registeredManifestKeys(projectDir),
    ]);
    const rows = manifests.map((manifest) => ({
      ...manifest,
      registered: registered?.has(manifest.key) ?? null,
    }));
    const result = printTable(
      rows,
      {
        key: {},
        public: {},
        registered: {},
        signature: { extended: true },
        path: { extended: true },
      },
      { ...context.options },
    );
    return context.ok(result, {
      cta: {
        commands: [
          {
            command: "integrations manifests add",
            description: "Generate and register another component manifest",
            args: { componentKeys: ["<componentKey>"] },
          },
        ],
      },
    });
  },
});
