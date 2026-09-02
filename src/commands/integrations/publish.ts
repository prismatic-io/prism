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
  description: "Publish a version of an Integration for use in Instances",
  args: {
    integration: arg.string({
      required: true,
      description: "ID of an integration to publish",
    }),
  },
  options: {
    comment: option.string({
      char: "c",
      required: false,
      description: "comment about changes in this publication",
    }),
    commitHash: option.string({
      required: false,
      description: "Commit hash corresponding to the integration version being published",
    }),
    commitUrl: option.string({
      required: false,
      description: "URL to the commit details corresponding to this integration version",
    }),
    repoUrl: option.string({
      required: false,
      description: "URL to the repository containing the definition for this integration",
    }),
    pullRequestUrl: option.string({
      required: false,
      description: "URL to the pull request that modified this integration version",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { integration },
      flags: { comment, commitHash, commitUrl, repoUrl, pullRequestUrl },
    } = commandInput();

    const didProvideAttributes =
      Boolean(commitHash) || Boolean(repoUrl) || Boolean(pullRequestUrl) || Boolean(commitUrl);
    const attributes = {
      commitHash,
      commitUrl,
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

    commandOutput.log(result.publishIntegration.integration.id);
  },
});
