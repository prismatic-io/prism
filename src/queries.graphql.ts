import { gql } from "./graphql.js";

export const GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS = gql`
  fragment IntegrationTranslation on Integration {
    name
    description
    definition
    category
    overview
    configPages
    requiredConfigVariables {
      nodes {
        key
        description
        inputs {
          nodes {
            name
            meta
          }
        }
      }
    }
  }
  query MarketplaceTranslations {
    marketplaceIntegrations {
      nodes {
        id
        ...IntegrationTranslation
        instances(isSystem: false) {
          nodes {
            id
            name
            integration {
              ...IntegrationTranslation
            }
          }
        }
      }
    }
  }
`;
