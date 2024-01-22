import { gql } from "../../graphql";

const MARKETPLACE_QUERY = gql`
  fragment integrationFields on Integration {
    id
    category
    description
    name
    overview
  }

  fragment userLevelConfigVariableFields on UserLevelConfigVariable {
    id
    value
    requiredConfigVariable {
      id
      key
      defaultValue
      description
      header
      inputs {
        nodes {
          id
          name
        }
      }
      connection {
        id
        key
        label
        comments
        component {
          id
          key
        }
        inputs {
          nodes {
            id
            key
            keyLabel
            comments
          }
        }
      }
      dataSource {
        id
        label
        description
        component {
          id
          key
        }
        inputs {
          nodes {
            id
            key
            label
            keyLabel
          }
        }
        detailDataSource {
          id
          label
          description
          key
          component {
            id
            key
          }
          inputs {
            nodes {
              id
              key
              keyLabel
              label
            }
          }
        }
      }
    }
    inputs {
      nodes {
        id
        name
      }
    }
  }

  fragment instanceFields on Instance {
    id
    name
    userLevelConfigVariables {
      nodes {
        ...userLevelConfigVariableFields
      }
    }
  }

  query marketplace {
    marketplaceIntegrations {
      nodes {
        ...integrationFields
        instances {
          nodes {
            ...instanceFields
          }
        }
      }
    }
  }
`;

export default MARKETPLACE_QUERY;
