import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { DeployInstanceDocument as DEPLOY_INSTANCE } from "../../graphql/operations/deployInstance.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class DeployCommand extends PrismaticBaseCommand {
  static description = "Deploy an Instance";
  static args = {
    instance: Args.string({
      required: true,
      description: "ID of an instance",
    }),
  };
  static flags = {
    force: Flags.boolean({
      char: "f",
      description:
        "Force deployment even when there are certain conditions that would normally prevent it",
    }),
  };

  async run() {
    const {
      args: { instance },
      flags: { force },
    } = await this.parse(DeployCommand);

    const result = await gqlRequest({
      document: DEPLOY_INSTANCE,
      variables: {
        id: instance,
        force,
      },
    });

    const instanceId = result.deployInstance?.instance?.id;
    if (instanceId == null) {
      this.error("The operation returned no resource");
    }

    this.log(instanceId);
  }
}
