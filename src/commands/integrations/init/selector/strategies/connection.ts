import { CollectionType } from "@prismatic-io/spectral";
import { gql, gqlRequest } from "../../../../../graphql.js";
import { ComponentKey, SelectorStrategy } from "../types.js";

export class ConnectionSelectorStrategy implements SelectorStrategy {
  async searchComponents(input: string) {
    const result = await gqlRequest<{
      components: { nodes: { id: string; key: string; label: string; public: boolean }[] };
    }>({
      document: gql`
        query components($input: String) {
          components(hasConnections: true, searchTerms_Fulltext: $input, first: 10) {
            nodes {
              id
              key
              label
              public
            }
          }
        }
      `,
      variables: { input },
    });
    return result.components.nodes.map(({ id, key, label, public: isPublic }) => ({
      name: isPublic ? label : `${label} (private)`,
      value: { key, id },
    }));
  }

  async searchSelectors(componentKey: ComponentKey, input: string) {
    const result = await gqlRequest<{
      component: {
        connections: {
          nodes: {
            id: string;
            key: string;
            label: string;
            inputs: {
              nodes: {
                key: string;
                comments: string;
                collection: CollectionType;
                required: boolean;
                default: string;
              }[];
            };
          }[];
        };
      };
    }>({
      document: gql`
        query connections($componentId: ID!, $input: String) {
          component (id: $componentId) {
            connections (label_Icontains: $input, first: 10) {
              nodes {
                id
                key
                label
                inputs {
                  nodes {
                    key
                    comments
                    collection
                    required
                    default
                  }
                }
              }
            }
          }
        }
      `,
      variables: { componentId: componentKey.id, input },
    });
    return result.component.connections.nodes.map(({ id, key, label, inputs }) => ({
      name: label,
      value: {
        key,
        id,
        inputs: inputs.nodes.map(
          ({ key, comments, collection, required, default: defaultValue }) => ({
            key,
            comments,
            valueType: collection === "keyvaluelist" ? "KeyValuePair[]" : "string",
            required: required && !defaultValue,
          }),
        ),
      },
    }));
  }
}
