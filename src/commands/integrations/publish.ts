import { PublishIntegrationDocument as PUBLISH_INTEGRATION } from "../../graphql/operations/publishIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ integrationId: z.string() }).extend(warningsOutput),
  description: "Publish a version of an Integration for use in Instances",
  args: z.object({
    integration: z.string().describe("ID of an integration to publish"),
  }),
  options: z.object({
    comment: z.string().optional().describe("comment about changes in this publication"),
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

    const result = await gqlRequest({
      document: PUBLISH_INTEGRATION,
      variables: {
        id: integration,
        comment,
        attributes: didProvideAttributes ? JSON.stringify(attributes) : undefined,
      },
    });

    const resourceId = result.publishIntegration?.integration?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Integration was not published",
        exitCode: 2,
      });
    return context.ok(
      { integrationId: resourceId },
      {
        cta: {
          commands: [
            {
              command: "integrations flows list",
              description: "Inspect this integration's flows",
              args: { integration: resourceId },
            },
          ],
        },
      },
    );
  },
  alias: { comment: "c" },
});
