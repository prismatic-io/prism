import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

const onlyWhenOrgUser = "Only valid for Organization users.";

export default defineCommand({
  description: "Create a JWT that may be used to register an On-Premise Resource.",
  options: {
    customerId: option.string({
      char: "c",
      required: false,
      description: `The ID of the customer for which to create the JWT. ${onlyWhenOrgUser}`,
    }),
    orgOnly: option.boolean({
      required: false,
      description: `Register a Resource available to Organization users only. ${onlyWhenOrgUser}`,
    }),
    resourceId: option.string({
      char: "r",
      required: false,
      description:
        "An optional ID of an existing On-Premise Resource for which to generate a new JWT.",
    }),
    rotate: option.boolean({
      required: false,
      description: "Invalidate all JWTs for the On-Premise Resource and get a new JWT.",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { customerId, orgOnly, resourceId, rotate },
    } = commandInput();

    if (rotate) {
      const result = await gqlRequest({
        document: gql`
          mutation rotateOnPremiseResourceJWT(
            $customerId: ID
            $resourceId: ID!
            $orgOnly: Boolean
          ) {
            rotateOnPremiseResourceJWT(
              input: { customerId: $customerId, orgOnly: $orgOnly, resourceId: $resourceId }
            ) {
              result {
                jwt
              }
              errors {
                field
                messages
              }
            }
          }
        `,
        variables: {
          customerId,
          resourceId,
          orgOnly,
        },
      });

      commandOutput.log(result.rotateOnPremiseResourceJWT.result.jwt);
    } else {
      const result = await gqlRequest({
        document: gql`
          mutation createOnPremiseResourceJWT(
            $customerId: ID
            $resourceId: ID
            $orgOnly: Boolean
          ) {
            createOnPremiseResourceJWT(
              input: { customerId: $customerId, orgOnly: $orgOnly, resourceId: $resourceId }
            ) {
              result {
                jwt
              }
              errors {
                field
                messages
              }
            }
          }
        `,
        variables: {
          customerId,
          resourceId,
          orgOnly,
        },
      });

      commandOutput.log(result.createOnPremiseResourceJWT.result.jwt);
    }
  },
});
