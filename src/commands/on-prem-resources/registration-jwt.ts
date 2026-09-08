import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { CreateOnPremiseResourceJwtDocument as CREATE_ON_PREMISE_RESOURCE_JWT } from "../../graphql/operations/createOnPremiseResourceJWT.generated.js";
import { RotateOnPremiseResourceJwtDocument as ROTATE_ON_PREMISE_RESOURCE_JWT } from "../../graphql/operations/rotateOnPremiseResourceJWT.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

const onlyWhenOrgUser = "Only valid for Organization users.";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("token"),
  description: "Create a JWT that may be used to register an On-Premise Resource.",
  options: optionsSchema(
    z.object({
      customerId: z
        .string()
        .optional()
        .describe(`The ID of the customer for which to create the JWT. ${onlyWhenOrgUser}`)
        .meta({ cli: { char: "c" } }),
      orgOnly: z
        .boolean()
        .optional()
        .describe(`Register a Resource available to Organization users only. ${onlyWhenOrgUser}`),
      resourceId: z
        .string()
        .optional()
        .describe(
          "An optional ID of an existing On-Premise Resource for which to generate a new JWT.",
        )
        .meta({ cli: { char: "r" } }),
      rotate: z
        .boolean()
        .optional()
        .describe("Invalidate all JWTs for the On-Premise Resource and get a new JWT."),
    }),
  ),
  async run(context) {
    const {
      options: { customerId, orgOnly, resourceId, rotate },
    } = context;

    if (rotate) {
      const result: ResultOf<typeof ROTATE_ON_PREMISE_RESOURCE_JWT> = await gqlRequest({
        document: ROTATE_ON_PREMISE_RESOURCE_JWT,
        variables: {
          customerId,
          resourceId: resourceId ?? commandOutput.error("--rotate requires --resourceId"),
          orgOnly,
        },
      });

      return resourceOutput(
        context,
        "token",
        result.rotateOnPremiseResourceJWT?.result?.jwt ??
          commandOutput.error("On-premise resource JWT was not rotated"),
      );
    } else {
      const result: ResultOf<typeof CREATE_ON_PREMISE_RESOURCE_JWT> = await gqlRequest({
        document: CREATE_ON_PREMISE_RESOURCE_JWT,
        variables: {
          customerId,
          resourceId,
          orgOnly,
        },
      });

      return resourceOutput(
        context,
        "token",
        result.createOnPremiseResourceJWT?.result?.jwt ??
          commandOutput.error("On-premise resource JWT was not created"),
      );
    }
  },
});
