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
  description: "Update an Instance",
  args: {
    instance: arg.string({
      required: true,
      description: "ID of an instance",
    }),
  },
  options: {
    name: option.string({
      char: "n",
      description: "Name of the instance",
    }),
    description: option.string({
      char: "d",
      description: "Description for the instance",
    }),
    version: option.string({
      char: "v",
      description: "ID of integration version",
    }),
    deploy: option.boolean({
      description: "Deploy the instance after updating",
    }),
    label: option.string({
      char: "l",
      description: "a label or set of labels to apply to the instance",
      multiple: true,
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { instance },
      flags: { name, description, version, deploy, label },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation updateInstance(
          $id: ID!
          $name: String
          $description: String
          $version: ID
          $labels: [String]
        ) {
          updateInstance(
            input: {
              id: $id
              name: $name
              description: $description
              integration: $version
              labels: $labels
            }
          ) {
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
        name,
        description,
        version,
        labels: label,
      },
    });

    if (!deploy) {
      commandOutput.log(result.updateInstance.instance.id);
      return;
    }

    const deployResult = await gqlRequest({
      document: gql`
        mutation deployInstance($id: ID!) {
          deployInstance(input: { id: $id }) {
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

    commandOutput.log(deployResult.deployInstance.instance.id);
  },
});
