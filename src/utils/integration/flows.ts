import { gqlRequest, gql } from "../../graphql.js";

type IntegrationFlow = {
  id: string;
  name: string;
  description: string;
  stableKey: string;
  testUrl: string;
};

export async function listIntegrationFlows(integrationId: string) {
  let flows: Array<IntegrationFlow> = [];
  let hasNextPage = true;
  let cursor = "";

  while (hasNextPage) {
    const {
      integration: {
        flows: { nodes, pageInfo },
      },
    } = await gqlRequest({
      document: gql`
        query listIntegrationFlows($id: ID!, $after: String) {
          integration(id: $id) {
            flows(after: $after) {
              nodes {
                id
                stableKey
                name
                description
                testUrl
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
      variables: {
        id: integrationId,
        after: cursor,
      },
    });
    flows = [...flows, ...nodes];
    cursor = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;
  }

  return flows;
}
