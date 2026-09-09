import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { DeployInstance2Document as DEPLOY_INSTANCE2 } from "../../graphql/operations/deployInstance2.generated.js";
import { UpdateInstanceDocument as UPDATE_INSTANCE } from "../../graphql/operations/updateInstance.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class UpdateCommand extends PrismaticBaseCommand {
  // TODO: Add more flags once optional updates are implemented
  static description = "Update an Instance";
  static args = {
    instance: Args.string({
      required: true,
      description: "ID of an instance",
    }),
  };

  static flags = {
    name: Flags.string({
      char: "n",
      description: "Name of the instance",
    }),
    description: Flags.string({
      char: "d",
      description: "Description for the instance",
    }),
    version: Flags.string({
      char: "v",
      description: "ID of integration version",
    }),
    deploy: Flags.boolean({
      description: "Deploy the instance after updating",
    }),
    label: Flags.string({
      char: "l",
      description: "a label or set of labels to apply to the instance",
      multiple: true,
    }),
  };

  async run() {
    const {
      args: { instance },
      flags: { name, description, version, deploy, label },
    } = await this.parse(UpdateCommand);

    const result = await gqlRequest({
      document: UPDATE_INSTANCE,
      variables: {
        id: instance,
        name,
        description,
        version,
        labels: label,
      },
    });

    if (!deploy) {
      this.log(
        result.updateInstance?.instance?.id ?? this.error("The operation returned no resource"),
      );
      return;
    }

    const deployResult = await gqlRequest({
      document: DEPLOY_INSTANCE2,
      variables: {
        id: instance,
      },
    });

    this.log(
      deployResult.deployInstance?.instance?.id ?? this.error("The operation returned no resource"),
    );
  }
}
