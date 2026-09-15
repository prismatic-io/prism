import { setTimeout as sleep } from "node:timers/promises";
import { z } from "incur";
import { commandSignal } from "../command.js";
import { ComponentVersionAvailabilityDocument as COMPONENT_VERSION_AVAILABILITY } from "../graphql/operations/componentVersionAvailability.generated.js";
import { IntegrationVersionAvailabilityDocument as INTEGRATION_VERSION_AVAILABILITY } from "../graphql/operations/integrationVersionAvailability.generated.js";
import { gqlRequest } from "../graphql.js";

export const DEFAULT_WAIT_TIMEOUT_SECONDS = 300;
const DEFAULT_POLL_INTERVAL_MS = 2000;

export interface WaitOptions {
  timeoutSeconds: number;
  intervalMs?: number;
}

export interface WaitDescription {
  until: string;
  otherwise: string;
}

export const waitOptions = ({ until, otherwise }: WaitDescription) => ({
  wait: z
    .boolean()
    .default(true)
    .describe(`Wait until ${until} (use --no-wait to return as soon as ${otherwise})`),
  "wait-timeout": z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_WAIT_TIMEOUT_SECONDS)
    .describe(`Seconds to wait until ${until}`),
});

export const publishWaitDescription: WaitDescription = {
  until: "the published version is available for use",
  otherwise: "the publish is submitted",
};

export const waitTimeout = (message: string) => ({
  code: "WAIT_TIMEOUT",
  message: `${message} Pass a larger --wait-timeout to wait longer.`,
  exitCode: 1,
  retryable: false,
});

export const resolveWaitOptions = ({
  wait,
  "wait-timeout": timeoutSeconds,
}: {
  wait: boolean;
  "wait-timeout": number;
}): WaitOptions | undefined => (wait ? { timeoutSeconds } : undefined);

export const pollUntil = async (
  check: () => Promise<boolean>,
  { timeoutSeconds, intervalMs = DEFAULT_POLL_INTERVAL_MS }: WaitOptions,
): Promise<boolean> => {
  const deadline = Date.now() + timeoutSeconds * 1000;
  const signal = commandSignal();
  while (true) {
    if (await check()) return true;
    const remaining = deadline - Date.now();
    if (remaining <= 0) return false;
    await sleep(Math.min(intervalMs, remaining), undefined, { signal });
  }
};

export const isComponentVersionAvailable = async (componentId: string): Promise<boolean> => {
  const result = await gqlRequest({
    document: COMPONENT_VERSION_AVAILABILITY,
    variables: { id: componentId },
  });
  return result.component?.versionIsAvailable === true;
};

export const waitForComponentVersion = (componentId: string, options: WaitOptions) =>
  pollUntil(() => isComponentVersionAvailable(componentId), options);

export const isIntegrationVersionAvailable = async (
  integrationId: string,
  versionNumber: number,
): Promise<boolean> => {
  const result = await gqlRequest({
    document: INTEGRATION_VERSION_AVAILABILITY,
    variables: { integrationId, versionNumber },
  });
  return (result.integration?.versionSequence.nodes.length ?? 0) > 0;
};

export const waitForIntegrationVersion = (
  integrationId: string,
  versionNumber: number,
  options: WaitOptions,
) => pollUntil(() => isIntegrationVersionAvailable(integrationId, versionNumber), options);
