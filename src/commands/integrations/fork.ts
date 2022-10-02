import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";

export default class ForkCommand extends Command {
  static description = "Fork an Integration";

  static flags = {
    name: Flags.string({
      char: "n",
      required: true,
      description: "name of the forked integration",
    }),
    description: Flags.string({
      char: "d",
      required: true,
      description: "longer description of the forked integration",
    }),
  };

  static args = [
    {
      name: "parent",
      required: true,
      description: "ID of the Integration to fork",
    },
  ];

  async run() {
    const {
      flags: { name, description },
      args: { parent },
    } = await this.parse(ForkCommand);

    const result = await gqlRequest({
      document: gql`
        mutation forkIntegration(
          $parentID: ID!
          $name: String!
          $description: String!
        ) {
          forkIntegration(
            input: { parent: $parentID, name: $name, description: $description }
          ) {
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
        parentID: parent,
        name,
        description,
      },
    });

    this.log(result.forkIntegration.integration.id);
  }
}
