import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";
import { gql, gqlRequest } from "../../graphql.js";

interface ImportWorkflowResult {
  importWorkflow: {
    workflow?: {
      id: string;
    };
    errors: {
      field: string;
      messages: string[];
    }[];
  };
}

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

    const result = await gqlRequest<ImportWorkflowResult>({
      document: gql`
        mutation importWorkflow($workflow: ID, $customer: ID, $definition: String!) {
          importWorkflow(
            input: {id: $workflow, definition: $definition, customer: $customer}
          ) {
            workflow {
              id
            }
            errors {
              field
              messages
            }
          }
        }`,
      variables: { definition, customer, workflow },
    });

    this.log(result.importWorkflow.workflow?.id);
  }
}
