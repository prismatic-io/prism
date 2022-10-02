import { Command, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";
import { parseJsonOrUndefined } from "../../../fields";

export default class CreateCommand extends Command {
  static description = "Create an Alert Group";
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

    const result = await gqlRequest({
      document: gql`
        mutation createAlertGroup(
          $name: String!
          $users: [ID]
          $webhooks: [ID]
        ) {
          createAlertGroup(
            input: { name: $name, users: $users, webhooks: $webhooks }
          ) {
            alertGroup {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        name,
        users,
        webhooks,
      },
    });

    this.log(result.createAlertGroup.alertGroup.id);
  }
}
