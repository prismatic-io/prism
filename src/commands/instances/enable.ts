import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { EnableInstanceDocument as ENABLE_INSTANCE } from "../../graphql/operations/enableInstance.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class EnableCommand extends PrismaticBaseCommand {
  static description = "Enable an Instance";
  static args = {
    instance: Args.string({
      required: true,
      description: "ID of an instance",
    }),
  };

  async run() {
    const {
      args: { instance },
    } = await this.parse(EnableCommand);

    const result = await gqlRequest({
      document: ENABLE_INSTANCE,
      variables: {
        id: instance,
      },
    });

    this.log(
      result.updateInstance?.instance?.id ?? this.error("The operation returned no resource"),
    );
  }
}
