import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { ImportWorkflowDocument as IMPORT_WORKFLOW } from "../../graphql/operations/importWorkflow.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("workflowId"),
  description: "Import an embedded workflow or workflow template YAML definition",
  options: optionsSchema(
    z.object({
      path: z
        .string()
        .describe("The path to the YAML definition of the workflow to import")
        .meta({ cli: { char: "p" } }),
      workflow: z
        .string()
        .optional()
        .describe(
          "The ID of the workflow being imported. If omitted, a new workflow will be created.",
        )
        .meta({ cli: { char: "w" } }),
      customer: z
        .string()
        .optional()
        .describe(
          "The ID of the customer to associate with the imported workflow. This will overwrite the existing workflow. If omitted, the workflow will be imported as a template.",
        )
        .meta({ cli: { char: "c" } }),
    }),
  ),
  async run(context) {
    const {
      options: { path, workflow, customer },
    } = context;
    const definition = await extractYAMLFromPath(path);

    const result: ResultOf<typeof IMPORT_WORKFLOW> = await gqlRequest({
      document: IMPORT_WORKFLOW,
      variables: { definition, customer, workflow },
    });

    return resourceOutput(
      context,
      "workflowId",
      result.importWorkflow?.workflow?.id ?? commandOutput.error("Workflow was not imported"),
    );
  },
});
