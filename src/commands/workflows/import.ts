import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";
import { extractYAMLFromPath } from "../../utils/integration/import.js";

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

export default defineCommand({
  description: "Import an embedded workflow or workflow template YAML definition",
  options: {
    path: option.string({
      char: "p",
      required: true,
      description: "The path to the YAML definition of the workflow to import",
    }),
    workflow: option.string({
      char: "w",
      required: false,
      description:
        "The ID of the workflow being imported. If omitted, a new workflow will be created.",
    }),
    customer: option.string({
      char: "c",
      required: false,
      description:
        "The ID of the customer to associate with the imported workflow. This will overwrite the existing workflow. If omitted, the workflow will be imported as a template.",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { path, workflow, customer },
    } = commandInput();
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

    commandOutput.log(result.importWorkflow.workflow?.id);
  },
});
