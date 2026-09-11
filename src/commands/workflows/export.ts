import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { ExportWorkflowDocument as EXPORT_WORKFLOW } from "../../graphql/operations/exportWorkflow.generated.js";
import { gqlRequest } from "../../graphql.js";
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

    const result = await gqlRequest({
      document: EXPORT_WORKFLOW,
      variables: { workflow, useLatestComponentVersions: latest },
    });
    const definition = result.workflow?.definition;
    if (definition == null) {
      this.error("Workflow was not found");
    }

    this.log(dumpYaml(loadYaml(definition)));
  }
}
