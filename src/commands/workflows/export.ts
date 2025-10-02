import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";
import { dumpYaml, loadYaml } from "../../utils/serialize.js";

export default class ExportCommand extends PrismaticBaseCommand {
  static description = "Export an embedded workflow or workflow template YAML definition";

  static args = {
    workflow: Args.string({
      required: true,
      description: "ID of the workflow to export",
    }),
  };

  async run() {
    const {
      args: { workflow },
    } = await this.parse(ExportCommand);

    const result = await gqlRequest<{ workflow: { definition: string } }>({
      document: gql`
        query exportWorkflow($workflow: ID!) {
          workflow(id: $workflow) {
            definition
          }
        }`,
      variables: { workflow },
    });
    this.log(dumpYaml(loadYaml(result.workflow.definition)));
  }
}
