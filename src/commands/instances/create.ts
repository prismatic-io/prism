import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";
import { parseJsonOrUndefined } from "../../fields";

export default class CreateCommand extends Command {
  static description = "Create an Instance";
  static flags = {
    name: Flags.string({
      char: "n",
      required: true,
      description: "name of your new instance.",
    }),
    integration: Flags.string({
      char: "i",
      required: true,
      description: "ID of the integration this is an instance of",
    }),
    customer: Flags.string({
      char: "c",
      required: true,
      description: "ID of customer to deploy to",
    }),
    description: Flags.string({
      required: false,
      char: "d",
      description: "longer description of the instance",
    }),
    "config-vars": Flags.string({
      required: false,
      char: "v",
      description: "config variables to bind to steps of your instance",
    }),
  };

  async run() {
    const {
      flags: {
        name,
        description,
        integration,
        customer,
        "config-vars": configVars,
      },
    } = await this.parse(CreateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation createInstance(
          $name: String!
          $description: String
          $integration: ID!
          $customer: ID!
          $configVariables: [InputInstanceConfigVariable]
        ) {
          createInstance(
            input: {
              name: $name
              description: $description
              integration: $integration
              customer: $customer
              configVariables: $configVariables
            }
          ) {
            instance {
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
        name,
        description,
        integration,
        customer,
        configVariables: parseJsonOrUndefined(configVars),
      },
    });

    this.log(result.createInstance.instance.id);
  }
}
