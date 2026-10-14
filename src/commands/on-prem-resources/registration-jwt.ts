import { Cli, z } from "incur";
import { ValidationError } from "../../errors.js";
import { CreateOnPremiseResourceJwtDocument as CREATE_ON_PREMISE_RESOURCE_JWT } from "../../graphql/operations/createOnPremiseResourceJWT.generated.js";
import { RotateOnPremiseResourceJwtDocument as ROTATE_ON_PREMISE_RESOURCE_JWT } from "../../graphql/operations/rotateOnPremiseResourceJWT.generated.js";
import { gqlRequest, requireOperationResult } from "../../graphql.js";
import { warningsOutput } from "../../output.js";

const onlyWhenOrgUser = "Only valid for Organization users.";

export default Cli.command({
  output: z.object({ token: z.string() }).extend(warningsOutput),
  description: "Create a JWT that may be used to register an On-Premise Resource.",
  options: z.object({
    customerId: z
      .string()
      .optional()
      .describe(`The ID of the customer for which to create the JWT. ${onlyWhenOrgUser}`),
    orgOnly: z
      .boolean()
      .optional()
      .describe(`Register a Resource available to Organization users only. ${onlyWhenOrgUser}`),
    resourceId: z
      .string()
      .optional()
      .describe(
        "An optional ID of an existing On-Premise Resource for which to generate a new JWT.",
      ),
    rotate: z
      .boolean()
      .optional()
      .describe("Invalidate all JWTs for the On-Premise Resource and get a new JWT."),
  }),
  async run(context) {
    const {
      options: { customerId, orgOnly, resourceId, rotate },
    } = context;

    if (rotate) {
      const requiredValue3 = resourceId;
      if (requiredValue3 == null)
        throw new ValidationError({
          message: "--rotate requires --resourceId",
        });
      const result = await gqlRequest({
        document: ROTATE_ON_PREMISE_RESOURCE_JWT,
        variables: {
          customerId,
          resourceId: requiredValue3,
          orgOnly,
        },
      });
      const requiredValue2 = requireOperationResult(
        result.rotateOnPremiseResourceJWT?.result?.jwt,
        "On-premise resource JWT was not rotated",
      );

      return {
        token: requiredValue2,
      };
    } else {
      const result = await gqlRequest({
        document: CREATE_ON_PREMISE_RESOURCE_JWT,
        variables: {
          customerId,
          resourceId,
          orgOnly,
        },
      });
      const requiredValue1 = requireOperationResult(
        result.createOnPremiseResourceJWT?.result?.jwt,
        "On-premise resource JWT was not created",
      );

      return {
        token: requiredValue1,
      };
    }
  },
  alias: { resourceId: "r", customerId: "c" },
});
