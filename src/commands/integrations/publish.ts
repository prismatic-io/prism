import { Cli, z } from "incur";
import { IntegrationDraftVersionDocument as INTEGRATION_DRAFT_VERSION } from "../../graphql/operations/integrationDraftVersion.generated.js";
import { PublishIntegrationDocument as PUBLISH_INTEGRATION } from "../../graphql/operations/publishIntegration.generated.js";
import { gqlRequest, requireOperationResult, requireResource } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import {
  publishWaitDescription,
  resolveWaitOptions,
  waitForIntegrationVersion,
  waitOptions,
  waitTimeout,
} from "../../utils/availability.js";
import { startAction, stopAction } from "../../utils/progress.js";
export default Cli.command({
  output: z
    .object({ integrationId: z.string(), versionNumber: z.number(), available: z.boolean() })
    .extend(warningsOutput),
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
    ...waitOptions(publishWaitDescription),
  }),
  async run(context) {
    const {
      args: { integration },
      options: { comment, commitHash, commitUrl, repoUrl, pullRequestUrl },
    } = context;
    const wait = resolveWaitOptions(context.options);

    const didProvideAttributes =
      Boolean(commitHash) || Boolean(repoUrl) || Boolean(pullRequestUrl) || Boolean(commitUrl);
    const attributes = {
      commitHash,
      commitUrl,
      repoUrl,
      pullRequestUrl,
    };

    const { versionNumber } = requireResource(
      (
        await gqlRequest({
          document: INTEGRATION_DRAFT_VERSION,
          variables: { integrationId: integration },
        })
      ).integration,
      "Integration",
    );

    const result = await gqlRequest({
      document: PUBLISH_INTEGRATION,
      variables: {
        id: integration,
        comment,
        attributes: didProvideAttributes ? JSON.stringify(attributes) : undefined,
      },
    });

    const resourceId = requireOperationResult(
      result.publishIntegration?.integration?.id,
      "Integration was not published",
    );

    const cta = {
      commands: [
        {
          command: "integrations versions",
          description: "Check whether the new version is available",
          args: { integration: resourceId },
        },
      ],
    };

    if (!wait) {
      return context.ok({ integrationId: resourceId, versionNumber, available: false }, { cta });
    }

    startAction(`Waiting for version ${versionNumber} to become available`);
    const available = await waitForIntegrationVersion(resourceId, versionNumber, wait);
    if (!available) {
      stopAction("timed out");
      return context.error({
        ...waitTimeout(
          `Version ${versionNumber} was published and is still processing after ${wait.timeoutSeconds} seconds.`,
        ),
        cta,
      });
    }
    stopAction();
    return context.ok({ integrationId: resourceId, versionNumber, available: true }, { cta });
  },
  alias: { comment: "c" },
});
