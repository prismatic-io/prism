import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

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

    this.log(result.updateInstance.instance.id);
  }
}
