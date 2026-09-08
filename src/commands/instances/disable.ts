import type { ResultOf } from "@graphql-typed-document-node/core";
import { DisableInstanceDocument as DISABLE_INSTANCE } from "../../graphql/operations/disableInstance.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
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

    const result: ResultOf<typeof DISABLE_INSTANCE> = await gqlRequest({
      document: DISABLE_INSTANCE,
      variables: {
        id: instance,
      },
    });

    this.log(result.updateInstance?.instance?.id ?? this.error("Instance was not disabled"));
  }
}
