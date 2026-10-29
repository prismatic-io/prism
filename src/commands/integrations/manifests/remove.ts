import path from "node:path";
import { Cli, z } from "incur";
import { getWorkingDirectory } from "../../../command-context.js";
import { ValidationError } from "../../../errors.js";
import { exists } from "../../../fs.js";
import { removeManifests } from "../../../utils/integration/manifestScaffolding.js";
import { componentKeyArg } from "../../components/schemas.js";

export default Cli.command({
  description:
    "Remove local component manifests and remove registry scaffolding when the last manifest is removed",
  hint: "Run this from the integration root. Remove usages in your code first. Published components and npm packages are unaffected.",
  args: z.object({ componentKeys: z.array(componentKeyArg("to remove")).min(1) }),
  output: z.object({
    items: z.array(z.object({ key: z.string(), path: z.string() })),
    scaffoldingRemoved: z.boolean(),
  }),
  examples: [{ description: "Remove the Slack manifest:", args: { componentKeys: ["slack"] } }],
  async run(context) {
    const root = getWorkingDirectory();
    if (!(await exists(path.join(root, "package.json")))) {
      throw new ValidationError({
        message:
          "Run this command from the root of a Code Native Integration containing package.json.",
      });
    }
    return removeManifests(root, context.args.componentKeys);
  },
});
