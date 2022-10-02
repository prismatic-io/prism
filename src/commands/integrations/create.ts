import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";

export default class CreateCommand extends Command {
  static description = "Create an Integration";
  static flags = {
    name: Flags.string({
      char: "n",
      required: true,
      description: "name of the integration to create",
    }),
    description: Flags.string({
      char: "d",
      required: true,
      description: "longer description of the integration",
    }),
  };

  async run() {
    const {
      flags: { name, description },
    } = await this.parse(CreateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation createIntegration($name: String!, $description: String!) {
          createIntegration(input: { name: $name, description: $description }) {
            integration {
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
        description,
      },
    });

    this.log(result.createIntegration.integration.id);
  }
}
