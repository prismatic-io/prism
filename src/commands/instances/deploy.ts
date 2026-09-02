import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Deploy an Instance",
  args: {
    instance: arg.string({
      required: true,
      description: "ID of an instance",
    }),
  },
  options: {
    force: option.boolean({
      char: "f",
      description:
        "Force deployment even when there are certain conditions that would normally prevent it",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { instance },
      flags: { force },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation deployInstance($id: ID!, $force: Boolean) {
          deployInstance(input: { id: $id, force: $force }) {
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
        force,
      },
    });

    commandOutput.log(result.deployInstance.instance.id);
  },
});
