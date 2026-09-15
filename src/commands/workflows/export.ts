import { Cli, z } from "incur";
import { ExportWorkflowDocument as EXPORT_WORKFLOW } from "../../graphql/operations/exportWorkflow.generated.js";
import { gqlRequest, requireOperationResult, requireResource } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { dumpYaml, loadYaml } from "../../utils/serialize.js";
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
    const resource = requireResource(result.workflow, "Workflow");
    const definition = requireOperationResult(resource.definition, "Workflow has no definition");
    return { definition: dumpYaml(loadYaml(definition)) };
  },
  alias: { "latest-components": "l" },
});
