import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { parseJsonOrUndefined } from "../../../fields.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Create an Alert Group",
  examples: [
    {
      description: "Create a group for 'DevOps':",
      command: `<%= config.bin %> <%= command.id %> --name DevOps --users "[\\"$(prism organization:users:list --columns id --filter 'Name=John Doe' --no-header)\\"]"`,
    },
  ],
  options: {
    name: option.string({
      char: "n",
      required: true,
      description: "name of the group to be created",
    }),
    users: option.string({
      required: false,
      char: "u",
      description: "JSON-formatted list of Prismatic user IDs to alert",
    }),
    webhooks: option.string({
      required: false,
      char: "w",
      description: "JSON-formatted list of Alert Webhook IDs to alert",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { name, users: userJson, webhooks: webhookJson },
    } = commandInput();

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

    commandOutput.log(result.createAlertGroup.alertGroup.id);
  },
});
