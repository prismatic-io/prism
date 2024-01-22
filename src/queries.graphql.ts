import { gql } from "./graphql";

export const GET_MARKETPLACE_INTEGRATIONS_TRANSLATIONS = gql`
  fragment IntegrationTranslation on Integration {
    namec
    description
    definition
    category
    overview
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
