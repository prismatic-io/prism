import { ExportWorkflowDocument as EXPORT_WORKFLOW } from "../../graphql/operations/exportWorkflow.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { dumpYaml, loadYaml } from "../../utils/serialize.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ definition: z.string() }).extend(warningsOutput),
  description: "Export an embedded workflow or workflow template YAML definition",
  args: z.object({
    workflow: z.string().describe("ID of the workflow to export"),
  }),
  options: z.object({
    "latest-components": z
      .boolean()
      .default(true)
      .describe(
        "Use the latest available version of each component upon import. Defaults to true.",
      ),
  }),
  async run(context) {
    const {
      args: { workflow },
      options: { "latest-components": latest },
    } = context;

    const result = await gqlRequest({
      document: EXPORT_WORKFLOW,
      variables: { workflow, useLatestComponentVersions: latest },
    });
    const definition = result.workflow?.definition;
    if (definition == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Workflow was not found or has no definition",
        exitCode: 2,
      });
    return { definition: dumpYaml(loadYaml(definition)) };
  },
  alias: { "latest-components": "l" },
});
