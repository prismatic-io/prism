import { Command, Args, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class PublishCommand extends Command {
  static description =
    "Publish a version of an Integration for use in Instances";

  static args = {
    integration: Args.string({
      required: true,
      description: "ID of an integration to publish",
    }),
  };

  static flags = {
    comment: Flags.string({
      char: "c",
      required: false,
      description: "comment about changes in this publication",
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: { comment },
    } = await this.parse(PublishCommand);

    const result = await gqlRequest({
      document: gql`
        mutation publishIntegration($id: ID!, $comment: String) {
          publishIntegration(input: { id: $id, comment: $comment }) {
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
        id: integration,
        comment,
      },
    });

    this.log(result.publishIntegration.integration.id);
  }
}
