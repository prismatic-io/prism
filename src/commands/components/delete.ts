import { z } from "incur";
import { defineCommand, argsSchema } from "../../command.js";
import { DeleteComponentDocument as DELETE_COMPONENT } from "../../graphql/operations/deleteComponent.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("componentId").extend({ deleted: z.literal(true) }),
  description: "Delete a Component",
  args: argsSchema(
    z.object({
      component: z.string().describe("ID of the component to delete"),
    }),
  ),
  async run(context) {
    const {
      args: { component },
    } = context;

    await gqlRequest({
      document: DELETE_COMPONENT,
      variables: {
        id: component,
      },
    });
    return resultOutput(context, { componentId: component, deleted: true });
  },
});
