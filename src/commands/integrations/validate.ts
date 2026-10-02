import { dirname } from "node:path";
import { Cli, z } from "incur";
import { withWorkingDirectory } from "../../command-context.js";
import { validateDefinition } from "../../utils/component/index.js";
import { loadCodeNativeIntegrationEntryPoint } from "../../utils/integration/import.js";

export default Cli.command({
  description:
    "Load and validate a built Code Native Integration locally, without publishing or running flows. Loading executes the project module; use only trusted projects.",
  output: z.object({
    valid: z.literal(true),
    entrypoint: z.string(),
    componentKey: z.string(),
    flowCount: z.number(),
  }),
  async run() {
    const { entrypoint, componentDefinition, componentKey, flowCount } =
      await loadCodeNativeIntegrationEntryPoint();
    await withWorkingDirectory(dirname(entrypoint), () =>
      validateDefinition(componentDefinition, { forCodeNativeIntegration: true }),
    );
    return { valid: true as const, entrypoint, componentKey, flowCount };
  },
});
