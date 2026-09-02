import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { parseJsonOrUndefined } from "../../fields.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Create an Instance",
  examples: [
    {
      description: "Get the ID of the integration you want to deploy:",
      command:
        "INTEGRATION_ID=$(prism integrations:list --columns id --no-header --filter 'name=Acme Inc')",
    },
    {
      description: "Get the version ID of the latest available published version:",
      command:
        // biome-ignore lint/suspicious/noTemplateCurlyInString: TODO
        "VERSION_ID=$(prism integrations:versions ${INTEGRATION_ID} --latest-available --columns id --no-header)",
    },
    {
      description: "Set up connection credentials (must be escaped):",
      command:
        'CREDENTIALS=\'[{"name":"username","type":"value","value":"my.username"},{"name":"password","type":"value","value":"Pa$$W0Rd"}]\'',
    },
    {
      description: "Create an instance with config variables and labels:",
      command:
        // biome-ignore lint/suspicious/noTemplateCurlyInString: TODO
        '<%= config.bin %> <%= command.id %> --name \'Acme Inc\' --description \'Acme Inc instance for Smith Rocket Co\' --integration ${VERSION_ID} --customer ${CUSTOMER_ID} --config-vars \'[{"key":"My Endpoint","value":"https://example.com/api"},{"key":"Do Thing?","value":"true"},{"key":"Acme Basic Auth","values":"${CREDENTIALS}"}]\' --label \'Production\' --label \'Paid\'',
    },
  ],
  options: {
    name: option.string({
      char: "n",
      required: true,
      description: "name of your new instance.",
    }),
    integration: option.string({
      char: "i",
      required: true,
      description:
        "ID of the integration or a specific integration version ID this is an instance of",
    }),
    customer: option.string({
      char: "c",
      required: true,
      description: "ID of customer to deploy to",
    }),
    description: option.string({
      required: false,
      char: "d",
      description: "longer description of the instance",
    }),
    "config-vars": option.string({
      required: false,
      char: "v",
      description: "config variables to bind to steps of your instance",
    }),
    label: option.string({
      char: "l",
      description: "a label or set of labels to apply to the instance",
      multiple: true,
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { name, description, integration, customer, "config-vars": configVars, label },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation createInstance(
          $name: String!
          $description: String
          $integration: ID!
          $customer: ID!
          $configVariables: [InputInstanceConfigVariable]
          $labels: [String]
        ) {
          createInstance(
            input: {
              name: $name
              description: $description
              integration: $integration
              customer: $customer
              configVariables: $configVariables
              labels: $labels
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
        labels: label,
      },
    });

    commandOutput.log(result.createInstance.instance.id);
  },
});
