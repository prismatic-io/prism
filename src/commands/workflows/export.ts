import { Args, Flags } from "@oclif/core";
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

  static flags = {
    "latest-components": Flags.boolean({
      char: "l",
      description:
        "Use the latest available version of each component upon import. Defaults to true.",
      default: true,
      allowNo: true,
    }),
  };

  async run() {
    const {
      args: { workflow },
      flags: { "latest-components": latest },
    } = await this.parse(ExportCommand);

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
    this.log(dumpYaml(loadYaml(result.workflow.definition)));
  }
}
