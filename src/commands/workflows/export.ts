import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";
import { dumpYaml, loadYaml } from "../../utils/serialize.js";

export default defineCommand({
  description: "Export an embedded workflow or workflow template YAML definition",
  args: {
    workflow: arg.string({
      required: true,
      description: "ID of the workflow to export",
    }),
  },
  options: {
    "latest-components": option.boolean({
      char: "l",
      description:
        "Use the latest available version of each component upon import. Defaults to true.",
      default: true,
      allowNo: true,
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { workflow },
      flags: { "latest-components": latest },
    } = commandInput();

    const result = await gqlRequest<{ workflow: { definition: string } }>({
      document: gql`
        query exportWorkflow($workflow: ID!, $useLatestComponentVersions: Boolean) {
          workflow(id: $workflow) {
            definition(
              definitionType: WORKFLOW
              useLatestComponentVersions: $useLatestComponentVersions
            )
          }
        }`,
      variables: { workflow, useLatestComponentVersions: latest },
    });
    commandOutput.log(dumpYaml(loadYaml(result.workflow.definition)));
  },
});
