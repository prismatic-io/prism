import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql.js";

export default class CreateCommand extends Command {
  static description = "Create a JWT that may be used to register an On-Premise Resource.";
  static flags = {
    customerId: Flags.string({
      char: "c",
      required: false,
      description:
        "The ID of the customer for which to create the JWT. Only valid when authenticated as an Organization user.",
    }),
    resourceId: Flags.string({
      char: "r",
      required: false,
      description:
        "An optional ID of an existing On-Premise Resource for which to generate a new JWT.",
    }),
    rotate: Flags.boolean({
      required: false,
      description: "Invalidate all JWTs for the On-Premise Resource and get a new JWT.",
    }),
  };

  async run() {
    const {
      flags: { customerId, resourceId, rotate },
    } = await this.parse(CreateCommand);
    if (rotate) {
      const result = await gqlRequest({
        document: gql`
          mutation rotateOnPremiseResourceJWT(
            $customerId: ID
            $resourceId: ID
          ) {
            rotateOnPremiseResourceJWT(
              input: { customerId: $customerId, resourceId: $resourceId }
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
        },
      });

      this.log(result.rotateOnPremiseResourceJWT.result.jwt);
    } else {
      const result = await gqlRequest({
        document: gql`
          mutation createOnPremiseResourceJWT(
            $customerId: ID
            $resourceId: ID
          ) {
            createOnPremiseResourceJWT(
              input: { customerId: $customerId, resourceId: $resourceId }
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
        },
      });

      this.log(result.createOnPremiseResourceJWT.result.jwt);
    }
  }
}
