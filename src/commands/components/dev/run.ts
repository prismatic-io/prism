import { Flags, ux } from "@oclif/core";
import { isEmpty } from "lodash-es";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { spawnProcess } from "../../../utils/process.js";

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

export default class RunCommand extends PrismaticBaseCommand {
  static description =
    `Fetch an integration's active connection and execute a CLI command with that connection's fields as an environment variable.`;
  static usage = "components:dev:run -i <value> -c <value> -- /command/to/run";
  static examples = [
    {
      description: `To simply print an integration's basic auth config variable named "My Credentials" and pipe the resulting JSON to jq, run:`,
      command: `$ prism components:dev:run
    --integrationId SW50ZWexample
    --connectionKey "My Connection" --
    printenv PRISMATIC_CONNECTION_VALUE | jq`,
    },
    {
      description: `If one of your integrations has an authenticated OAuth 2.0 config variable "Slack Connection", you could run your component's unit tests with that environment variable:`,
      command: `$ prism components:dev:run -i SW50ZWexample -c "Slack Connection" -- yarn run test`,
    },
    {
      description:
        "If you would like to fetch a connection from an instance deployed to one of your customers, specify the --instanceId flag instead",
      command: `$ prism components:dev:run --instanceId SW50ZWexample -c "Slack Connection" -- yarn run test`,
    },
  ];

  static strict = false; // Manual capture of argv so we can get the wrapped command
  static "--" = true; // Stop parsing flags if -- is encountered as an arg

  static flags = {
    integrationId: Flags.string({
      char: "i",
      description: "Integration ID",
      exactlyOne: ["instanceId", "integrationId"],
    }),
    instanceId: Flags.string({
      description: "Instance ID. ",
    }),
    connectionKey: Flags.string({
      required: true,
      char: "c",
      description: "Key of the connection config variable to fetch meta/state for",
    }),
  };

  async run() {
    const {
      argv,
      flags: { integrationId, instanceId, connectionKey },
    } = await this.parse(RunCommand);

    if (isEmpty(argv)) {
      this.error(
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

    await spawnProcess(argv as string[], { PRISMATIC_CONNECTION_VALUE: value });
  }
}
