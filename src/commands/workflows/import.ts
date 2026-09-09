import { ImportWorkflowDocument as IMPORT_WORKFLOW } from "../../graphql/operations/importWorkflow.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ workflowId: z.string() }).extend(warningsOutput),
  description: "Import an embedded workflow or workflow template YAML definition",
  options: z.object({
    path: z.string().describe("The path to the YAML definition of the workflow to import"),
    workflow: z
      .string()
      .optional()
      .describe(
        "The ID of the workflow being imported. If omitted, a new workflow will be created.",
      ),
    customer: z
      .string()
      .optional()
      .describe(
        "The ID of the customer to associate with the imported workflow. This will overwrite the existing workflow. If omitted, the workflow will be imported as a template.",
      ),
  }),
  async run(context) {
    const {
      options: { path, workflow, customer },
    } = context;
    const definition = await extractYAMLFromPath(path);

    const result = await gqlRequest({
      document: IMPORT_WORKFLOW,
      variables: { definition, customer, workflow },
    });
    const requiredValue1 = result.importWorkflow?.workflow?.id;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Workflow was not imported",
        exitCode: 2,
      });

    return {
      workflowId: requiredValue1,
    };
  },
  alias: { customer: "c", workflow: "w", path: "p" },
});
