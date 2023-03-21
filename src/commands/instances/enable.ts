import { Command } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class EnableCommand extends Command {
  static description = "Enable an Instance";
  static args = [
    {
      name: "instance",
      required: true,
      description: "ID of an instance",
    },
  ];

  async run() {
    const {
      args: { instance },
    } = await this.parse(EnableCommand);

    const result = await gqlRequest({
      document: gql`
        mutation enableInstance($id: ID!) {
          updateInstance(input: { id: $id, enabled: true }) {
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

    this.log(result.updateInstance.instance.id);
  }
}