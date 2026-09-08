import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { ExportWorkflowDocument as EXPORT_WORKFLOW } from "../../graphql/operations/exportWorkflow.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { dumpYaml, loadYaml } from "../../utils/serialize.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  output: resourceOutputSchema("definition"),
  description: "Export an embedded workflow or workflow template YAML definition",
  args: argsSchema(
    z.object({
      workflow: z.string().describe("ID of the workflow to export"),
    }),
  ),
  options: optionsSchema(
    z.object({
      "latest-components": z
        .boolean()
        .default(true)
        .describe(
          "Use the latest available version of each component upon import. Defaults to true.",
        )
        .meta({ cli: { char: "l", allowNo: true } }),
    }),
  ),
  async run(context) {
    const {
      args: { workflow },
      options: { "latest-components": latest },
    } = context;

    const result: ResultOf<typeof EXPORT_WORKFLOW> = await gqlRequest({
      document: EXPORT_WORKFLOW,
      variables: { workflow, useLatestComponentVersions: latest },
    });
    const definition =
      result.workflow?.definition ??
      commandOutput.error("Workflow was not found or has no definition");
    return resourceOutput(context, "definition", dumpYaml(loadYaml(definition)));
  },
});
