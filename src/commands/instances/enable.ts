import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

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
