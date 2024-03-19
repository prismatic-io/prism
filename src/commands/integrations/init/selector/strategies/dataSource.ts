import { CollectionType } from "@prismatic-io/spectral";
import { gql } from "graphql-request";
import { gqlRequest } from "../../../../../graphql.js";
import { SelectorStrategy, ComponentKey } from "../types.js";

export class DataSourceSelectorStrategy implements SelectorStrategy {
  async searchComponents(input: string) {
    const result = await gqlRequest<{
      components: { nodes: { id: string; key: string; label: string; public: boolean }[] };
    }>({
      document: gql`
        query components($input: String) {
          components(hasDataSources: true, searchTerms_Fulltext: $input, first: 10) {
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
      actions: {
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
    }>({
      document: gql`
        query actions($componentId: ID!, $input: String) {
          actions(isDataSource: true, component: $componentId, searchTerms_Fulltext: $input, first: 10) {
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
      `,
      variables: { componentId: componentKey.id, input },
    });
    return result.actions.nodes.map(({ id, key, label, inputs }) => ({
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
