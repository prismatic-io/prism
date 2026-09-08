import type { ResultOf } from "@graphql-typed-document-node/core";
import { DeployInstanceDocument as DEPLOY_INSTANCE } from "../../graphql/operations/deployInstance.generated.js";
import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
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

    const result: ResultOf<typeof DEPLOY_INSTANCE> = await gqlRequest({
      document: DEPLOY_INSTANCE,
      variables: {
        id: instance,
        force,
      },
    });

    this.log(result.deployInstance?.instance?.id ?? this.error("Instance was not deployed"));
  }
}
