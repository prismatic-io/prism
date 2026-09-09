import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { DisableInstanceDocument as DISABLE_INSTANCE } from "../../graphql/operations/disableInstance.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class DisableCommand extends PrismaticBaseCommand {
  static description = "Disable an Instance";
  static args = {
    instance: Args.string({
      required: true,
      description: "ID of an instance",
    }),
  };

  async run() {
    const {
      args: { instance },
    } = await this.parse(DisableCommand);

    const result = await gqlRequest({
      document: DISABLE_INSTANCE,
      variables: {
        id: instance,
      },
    });

    this.log(
      result.updateInstance?.instance?.id ?? this.error("The operation returned no resource"),
    );
  }
}
