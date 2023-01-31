import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";
import { parseJsonOrUndefined } from "../../fields";

export default class UpdateCommand extends Command {
  static description = "Update an Integration's name or description";
  static args = [
    {
      name: "integration",
      required: true,
      description: "ID of an integration",
    },
  ];

  static flags = {
    name: Flags.string({
      char: "n",
      description: "new name to give the integration",
    }),
    description: Flags.string({
      char: "d",
      description: "new description to give the integration",
    }),
    customer: Flags.string({
      char: "c",
      description: "ID of customer with which to associate the integration",
    }),
    "test-config-vars": Flags.string({
      description: "JSON-formatted config variables to be used for testing",
    }),
    "default-config-vars": Flags.string({
      description:
        "JSON-formatted default values for config variables that are replaced with instance or test config variables",
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: {
        name,
        description,
        customer,
        "test-config-vars": testConfigVars,
      },
    } = await this.parse(UpdateCommand);
    const result = await gqlRequest({
      document: gql`
        mutation updateIntegration(
          $id: ID!
          $name: String
          $description: String
          $customer: ID
          $testConfigVars: [InputInstanceConfigVariable]
        ) {
          updateIntegration(
            input: {
              id: $id
              name: $name
              description: $description
              customer: $customer
              testConfigVariables: $testConfigVars
            }
          ) {
            integration {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        id: integration,
        name,
        description,
        customer,
        testConfigVars: parseJsonOrUndefined(testConfigVars),
      },
    });

    this.log(result.updateIntegration.integration.id);
  }
}
