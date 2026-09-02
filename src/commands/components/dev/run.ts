import {
  arg,
  commandInput,
  commandOutput,
  decodePassthroughArgument,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { isEmpty } from "lodash-es";
import { gql, gqlRequest } from "../../../graphql.js";
import { spawnProcess } from "../../../utils/process.js";
import { ux } from "../../../utils/ux.js";

interface ConfigVariable {
  requiredConfigVariable: {
    key: string;
    connectionTemplate?: {
      inputFieldTemplates: { nodes: { inputField: { key: string }; value: string }[] };
    };
  };
  inputs: { nodes: { name: string; value: string }[] };
  meta: string;
}

export default defineCommand({
  description:
    "Fetch an integration's active connection and execute a CLI command with that connection's fields as an environment variable.\nAfter specifying an integration ID and connection config variable name, this command executes a CLI command with that connection's fields saved as a config variable named PRISMATIC_CONNECTION_VALUE.",
  hint: "Pass the local command after -- (for example: -- yarn run test).",
  examples: [
    {
      description: `To simply print an integration's basic auth config variable named "My Connection" and pipe the resulting JSON to jq, run:`,
      command: `<%= config.bin %> <%= command.id %> --integrationId SW50ZWexample --connectionKey "My Connection" -- printenv PRISMATIC_CONNECTION_VALUE | jq`,
    },
    {
      description: `If one of your integrations has an authenticated OAuth 2.0 config variable "Slack Connection", you could run your component's unit tests with that environment variable:`,
      command: `<%= config.bin %> <%= command.id %> -i SW50ZWexample -c "Slack Connection" -- yarn run test`,
    },
    {
      description:
        "If you would like to fetch a connection from an instance deployed to one of your customers, specify the --instanceId flag instead",
      command: `<%= config.bin %> <%= command.id %> --instanceId SW50ZWexample -c "Slack Connection" -- yarn run test`,
    },
  ],
  args: {
    command: arg.string({
      description: "Local command and arguments to run",
      multiple: true,
      required: false,
    }),
  },
  options: {
    integrationId: option.string({
      char: "i",
      description: "Integration ID",
      exactlyOne: ["instanceId", "integrationId"],
    }),
    instanceId: option.string({
      description: "Instance ID. ",
    }),
    connectionKey: option.string({
      required: true,
      char: "c",
      description: "Key of the connection config variable to fetch meta/state for",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { command: argv },
      flags: { integrationId, instanceId, connectionKey },
    } = commandInput();

    if (isEmpty(argv)) {
      commandOutput.error(
        "A command to run must be supplied after a double dash (--) delimiter. See examples in this command's help for details.",
      );
    }

    let configVariables: ConfigVariable[];

    // Get connection from the integration's test instance
    if (integrationId) {
      const result = await gqlRequest({
        document: gql`
          query integration($id: ID!) {
            integration(id: $id) {
              testConfigVariables {
                nodes {
                  requiredConfigVariable {
                    key
                    connectionTemplate {
                      inputFieldTemplates {
                        nodes {
                          inputField {
                            key
                          }
                          value
                        }
                      }
                    }
                  }
                  inputs {
                    nodes {
                      name
                      value
                    }
                  }
                  meta
                }
              }
            }
          }
        `,
        variables: {
          id: integrationId,
        },
      });

      configVariables = result.integration.testConfigVariables.nodes;
    } else {
      // Get the config variable from an instance
      const result = await gqlRequest({
        document: gql`
          query instance($id: ID!) {
            instance(id: $id) {
              configVariables {
                nodes {
                  requiredConfigVariable {
                    key
                    connectionTemplate {
                      inputFieldTemplates {
                        nodes {
                          inputField {
                            key
                          }
                          value
                        }
                      }
                    }
                  }
                  inputs {
                    nodes {
                      name
                      value
                    }
                  }
                  meta
                }
              }
            }
          }
        `,
        variables: {
          id: instanceId,
        },
      });

      configVariables = result.instance.configVariables.nodes;
    }

    const [connection] = configVariables.filter(
      ({ requiredConfigVariable: { key } }) => key === connectionKey,
    );

    if (!connection) {
      ux.error("Failed to find active connection with that name.", { exit: 1 });
    }

    const { meta, inputs, requiredConfigVariable } = connection;

    // Combine templated connection field values with the test instance's field values
    const fields = {
      ...requiredConfigVariable.connectionTemplate?.inputFieldTemplates.nodes.reduce<
        Record<string, unknown>
      >((result, { inputField, value }) => ({ ...result, [inputField.key]: value }), {}),
      ...inputs.nodes.reduce<Record<string, unknown>>(
        (result, { name, value }) => ({ ...result, [name]: value }),
        {},
      ),
    };

    const value = JSON.stringify({
      ...JSON.parse(meta),
      fields,
    });

    await spawnProcess(argv.map(decodePassthroughArgument), { PRISMATIC_CONNECTION_VALUE: value });
  },
});
