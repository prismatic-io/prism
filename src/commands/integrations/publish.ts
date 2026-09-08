import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { PublishIntegrationDocument as PUBLISH_INTEGRATION } from "../../graphql/operations/publishIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("integrationId"),
  description: "Publish a version of an Integration for use in Instances",
  args: argsSchema(
    z.object({
      integration: z.string().describe("ID of an integration to publish"),
    }),
  ),
  options: optionsSchema(
    z.object({
      comment: z
        .string()
        .optional()
        .describe("comment about changes in this publication")
        .meta({ cli: { char: "c" } }),
      commitHash: z
        .string()
        .optional()
        .describe("Commit hash corresponding to the integration version being published"),
      commitUrl: z
        .string()
        .optional()
        .describe("URL to the commit details corresponding to this integration version"),
      repoUrl: z
        .string()
        .optional()
        .describe("URL to the repository containing the definition for this integration"),
      pullRequestUrl: z
        .string()
        .optional()
        .describe("URL to the pull request that modified this integration version"),
    }),
  ),
  async run(context) {
    const {
      args: { integration },
      options: { comment, commitHash, commitUrl, repoUrl, pullRequestUrl },
    } = context;

    const didProvideAttributes =
      Boolean(commitHash) || Boolean(repoUrl) || Boolean(pullRequestUrl) || Boolean(commitUrl);
    const attributes = {
      commitHash,
      commitUrl,
      repoUrl,
      pullRequestUrl,
    };

    const result: ResultOf<typeof PUBLISH_INTEGRATION> = await gqlRequest({
      document: PUBLISH_INTEGRATION,
      variables: {
        id: integration,
        comment,
        attributes: didProvideAttributes ? JSON.stringify(attributes) : undefined,
      },
    });

    return resourceOutput(
      context,
      "integrationId",
      result.publishIntegration?.integration?.id ??
        commandOutput.error("Integration was not published"),
    );
  },
});
