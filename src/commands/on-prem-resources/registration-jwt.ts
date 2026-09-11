import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { CreateOnPremiseResourceJwtDocument as CREATE_ON_PREMISE_RESOURCE_JWT } from "../../graphql/operations/createOnPremiseResourceJWT.generated.js";
import { RotateOnPremiseResourceJwtDocument as ROTATE_ON_PREMISE_RESOURCE_JWT } from "../../graphql/operations/rotateOnPremiseResourceJWT.generated.js";
import { gqlRequest } from "../../graphql.js";

const onlyWhenOrgUser = "Only valid for Organization users.";

export default class CreateCommand extends PrismaticBaseCommand {
  static description = "Create a JWT that may be used to register an On-Premise Resource.";
  static flags = {
    customerId: Flags.string({
      char: "c",
      required: false,
      description: `The ID of the customer for which to create the JWT. ${onlyWhenOrgUser}`,
    }),
    orgOnly: Flags.boolean({
      required: false,
      description: `Register a Resource available to Organization users only. ${onlyWhenOrgUser}`,
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
      flags: { customerId, orgOnly, resourceId, rotate },
    } = await this.parse(CreateCommand);

    if (resourceId == null) {
      this.error("--rotate requires --resourceId");
    }

    if (rotate) {
      const result = await gqlRequest({
        document: ROTATE_ON_PREMISE_RESOURCE_JWT,
        variables: {
          customerId,
          resourceId,
          orgOnly,
        },
      });

      const jwt = result.rotateOnPremiseResourceJWT?.result?.jwt;
      if (jwt == null) {
        this.error("The operation returned no resource");
      }

      this.log(jwt);
    } else {
      const result = await gqlRequest({
        document: CREATE_ON_PREMISE_RESOURCE_JWT,
        variables: {
          customerId,
          resourceId,
          orgOnly,
        },
      });

      const jwt = result.createOnPremiseResourceJWT?.result?.jwt;
      if (jwt == null) {
        this.error("The operation returned no resource");
      }

      this.log(jwt);
    }
  }
}
