import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { toValues } from "../../../fields.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class UpdateCommand extends PrismaticBaseCommand {
  static description = "Update a Customer-specific Credential for use by Instance Actions";
  static args = {
    credential: Args.string({
      required: true,
      description: "ID of a credential",
    }),
  };
  static flags = {
    label: Flags.string({
      char: "l",
      required: true,
      description: "new name to give the credential",
    }),
    fields: Flags.string({
      char: "f",
      required: true,
      description: "username, password, etc., in JSON format",
    }),
  };
  async run() {
    const {
      args: { credential },
      flags: { label, fields },
    } = await this.parse(UpdateCommand);

    const values = toValues(fields);

    const result = await gqlRequest({
      document: gql`
        mutation updateCustomerCredential(
          $label: String!
          $values: [InputCredentialFieldValue]!
          $credential: ID!
        ) {
          updateCredential(
            input: { label: $label, values: $values, id: $credential }
          ) {
            errors {
              field
              messages
            }
            credential {
              id
            }
          }
        }
      `,
      variables: {
        credential,
        label,
        values,
      },
    });
    this.log(result.updateCredential.credential.id);
  }
}
