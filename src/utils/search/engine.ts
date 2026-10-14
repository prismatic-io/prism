import { Errors } from "incur";
import { StackCapabilitiesDocument as STACK_CAPABILITIES } from "../../graphql/search/stackCapabilities.generated.js";
import { gqlRequest } from "../../graphql.js";

export type SearchEngine = "search" | "legacy";

let supportsSearchApi: Promise<boolean> | undefined;

export const stackSupportsSearchApi = (): Promise<boolean> => {
  supportsSearchApi ??= gqlRequest({ document: STACK_CAPABILITIES }).then(
    (result) => result.authenticatedUser?.org?.stackCapabilities.supportsAoss ?? false,
  );
  return supportsSearchApi;
};

export const forgetStackCapabilities = () => {
  supportsSearchApi = undefined;
};

export async function resolveEngine(): Promise<SearchEngine> {
  return (await stackSupportsSearchApi()) ? "search" : "legacy";
}

export const unsupportedOnLegacy = (reasons: string[]) =>
  new Errors.IncurError({
    code: "SEARCH_CAPABILITY_UNAVAILABLE",
    exitCode: 1,
    retryable: false,
    message: `${reasons.join("; ")} are unsupported by the legacy search API.`,
    hint: "Remove the unsupported options, or run the command against a stack with the search API.",
  });
