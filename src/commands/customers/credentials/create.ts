import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { toValues } from "../../../fields.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class CreateCommand extends PrismaticBaseCommand {
  static description = "Create a set of Customer-specific Credentials for use by Instance Actions";

  static flags = {
    customer: Flags.string({
      char: "c",
      required: true,
      description: "ID of the customer",
    }),
    label: Flags.string({
      char: "l",
      required: true,
      description: "name to give the new credentials",
    }),
    "authorization-method": Flags.string({
      char: "a",
      required: true,
      description: "ID of the authorization method",
    }),
    fields: Flags.string({
      char: "f",
      description: "username, password, etc., in JSON format",
    }),
  };

  async run() {
    const {
      flags: { label, "authorization-method": authorizationMethod, fields, customer },
    } = await this.parse(CreateCommand);

    const values = toValues(fields);

    const result = await gqlRequest({
      document: gql`
        mutation createCustomerCredential(
          $customer: ID!
          $label: String!
          $authorizationMethod: ID!
          $values: [InputCredentialFieldValue]
        ) {
          createCustomerCredential(
            input: {
              customer: $customer
              label: $label
              authorizationMethod: $authorizationMethod
              values: $values
            }
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
        customer,
        label,
        authorizationMethod,
        values,
      },
    });

    this.log(result.createCustomerCredential.credential.id);
  }
}
