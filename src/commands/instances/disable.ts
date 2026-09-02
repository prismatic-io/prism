import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Disable an Instance",
  args: {
    instance: arg.string({
      required: true,
      description: "ID of an instance",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { instance },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation disableInstance($id: ID!) {
          updateInstance(input: { id: $id, enabled: false }) {
            instance {
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
        id: instance,
      },
    });

    commandOutput.log(result.updateInstance.instance.id);
  },
});
