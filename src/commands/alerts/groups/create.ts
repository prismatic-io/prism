import type { ResultOf } from "@graphql-typed-document-node/core";
import { CreateAlertGroupDocument as CREATE_ALERT_GROUP } from "../../../graphql/operations/createAlertGroup.generated.js";
import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { parseJsonOrUndefined } from "../../../fields.js";
import { gqlRequest } from "../../../graphql.js";

export default class CreateCommand extends PrismaticBaseCommand {
  static description = "Create an Alert Group";

  static examples = [
    {
      description: "Create a group for 'DevOps':",
      command: `<%= config.bin %> <%= command.id %> --name DevOps --users "[\\"$(prism organization:users:list --columns id --filter 'Name=John Doe' --no-header)\\"]"`,
    },
  ];

  static flags = {
    name: Flags.string({
      char: "n",
      required: true,
      description: "name of the group to be created",
    }),
    users: Flags.string({
      required: false,
      char: "u",
      description: "JSON-formatted list of Prismatic user IDs to alert",
    }),
    webhooks: Flags.string({
      required: false,
      char: "w",
      description: "JSON-formatted list of Alert Webhook IDs to alert",
    }),
  };

  async run() {
    const {
      flags: { name, users: userJson, webhooks: webhookJson },
    } = await this.parse(CreateCommand);

    const users = parseJsonOrUndefined(userJson);
    const webhooks = parseJsonOrUndefined(webhookJson);

    const result: ResultOf<typeof CREATE_ALERT_GROUP> = await gqlRequest({
      document: CREATE_ALERT_GROUP,
      variables: {
        name,
        users,
        webhooks,
      },
    });

    this.log(result.createAlertGroup?.alertGroup?.id ?? this.error("Alert group was not created"));
  }
}
