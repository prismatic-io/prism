import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { ImportWorkflowDocument as IMPORT_WORKFLOW } from "../../graphql/operations/importWorkflow.generated.js";
import { gqlRequest } from "../../graphql.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";

export default class ImportCommand extends PrismaticBaseCommand {
  static description = "Import an embedded workflow or workflow template YAML definition";

  static flags = {
    path: Flags.string({
      char: "p",
      required: true,
      description: "The path to the YAML definition of the workflow to import",
    }),
    workflow: Flags.string({
      char: "w",
      required: false,
      description:
        "The ID of the workflow being imported. If omitted, a new workflow will be created.",
    }),
    customer: Flags.string({
      char: "c",
      required: false,
      description:
        "The ID of the customer to associate with the imported workflow. This will overwrite the existing workflow. If omitted, the workflow will be imported as a template.",
    }),
  };

  async run() {
    const {
      flags: { path, workflow, customer },
    } = await this.parse(ImportCommand);
    const definition = await extractYAMLFromPath(path);

    const result = await gqlRequest({
      document: IMPORT_WORKFLOW,
      variables: { definition, customer, workflow },
    });

    const workflowId = result.importWorkflow?.workflow?.id;
    if (workflowId == null) {
      this.error("The operation returned no resource");
    }

    this.log(workflowId);
  }
}
