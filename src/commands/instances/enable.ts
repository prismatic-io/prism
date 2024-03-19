import { Command, Args } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql.js";

export default class EnableCommand extends Command {
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
