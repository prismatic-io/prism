import { ComponentDocument as COMPONENT } from "../../graphql/operations/component.generated.js";
import { DeleteComponent2Document as DELETE_COMPONENT2 } from "../../graphql/operations/deleteComponent2.generated.js";
import { gqlRequest } from "../../graphql.js";

export const deleteComponentByKey = async (key: string) => {
  // Fetch a component by key
  const result = await gqlRequest({
    document: COMPONENT,
    variables: {
      key,
    },
  });
  // Delete the component by ID
  await gqlRequest({
    document: DELETE_COMPONENT2,
    variables: { id: result.components.nodes[0].id },
  });
};
