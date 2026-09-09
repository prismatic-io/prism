import { z, Cli } from "incur";
import { DeleteComponentDocument as DELETE_COMPONENT } from "../../graphql/operations/deleteComponent.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";

export default Cli.command({
  output: z
    .object({ componentId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete a Component",
  args: z.object({
    component: z.string().describe("ID of the component to delete"),
  }),
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
    return { componentId: component, deleted: true as const };
  },
});
