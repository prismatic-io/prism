import { Command, Args, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql.js";

export default class PublishCommand extends Command {
  static description = "Publish a version of an Integration for use in Instances";

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
    commitHash: Flags.string({
      required: false,
      description: "Commit hash corresponding to the integration version being published",
    }),
    repoUrl: Flags.string({
      required: false,
      description: "URL to the repository containing the YML definition for this integration",
    }),
    pullRequestUrl: Flags.string({
      required: false,
      description: "URL to the pull request that modified this version of the integration YML",
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: { comment, commitHash, repoUrl, pullRequestUrl },
    } = await this.parse(PublishCommand);

    const didProvideAttributes = Boolean(commitHash) || Boolean(repoUrl) || Boolean(pullRequestUrl);
    const attributes = {
      commitHash,
      repoUrl,
      pullRequestUrl,
    };

    const result = await gqlRequest({
      document: gql`
        mutation publishIntegration(
          $id: ID!
          $comment: String
          $attributes: String
        ) {
          publishIntegration(
            input: { id: $id, comment: $comment, attributes: $attributes }
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
        id: integration,
        comment,
        attributes: didProvideAttributes ? JSON.stringify(attributes) : undefined,
      },
    });

    this.log(result.publishIntegration.integration.id);
  }
}
