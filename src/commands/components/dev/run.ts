import { Command, Flags, CliUx } from "@oclif/core";
import { isEmpty } from "lodash";
import { gqlRequest, gql } from "../../../graphql";
import { spawnProcess } from "../../../utils/process";

export default class RunCommand extends Command {
  static description = `Fetch an integration's active connection and execute a CLI command with that connection's fields as an environment variable.`;
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
  ];

  static strict = false; // Manual capture of argv so we can get the wrapped command
  static "--" = true; // Stop parsing flags if -- is encountered as an arg

  // TODO: Make this derive from the component manifest using the same
  // logic as the `test` command.
  static flags = {
    integrationId: Flags.string({
      required: true,
      char: "i",
      description: "Integration ID",
    }),
    connectionKey: Flags.string({
      required: true,
      char: "c",
      description:
        "Key of the connection config variable to fetch meta/state for",
    }),
  };

  async run() {
    const {
      argv,
      flags: { integrationId, connectionKey },
    } = await this.parse(RunCommand);

    if (isEmpty(argv)) {
      this.error(
        "A command to run must be supplied after a double dash (--) delimiter. See examples in this command's help for details."
      );
    }

    const result = await gqlRequest({
      document: gql`
        query integration($id: ID!) {
          integration(id: $id) {
            testConfigVariables {
              nodes {
                requiredConfigVariable {
                  key
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

    const nodes: {
      requiredConfigVariable: { key: string };
      inputs: { nodes: { name: string; value: string }[] };
      meta: string;
    }[] = result.integration.testConfigVariables.nodes;

    const [connection] = nodes.filter(
      ({ requiredConfigVariable: { key } }) => key === connectionKey
    );
    if (!connection) {
      CliUx.ux.error("Failed to find active connection.", { exit: 1 });
    }

    const { meta, inputs } = connection;

    const fields = inputs.nodes.reduce<Record<string, unknown>>(
      (result, { name, value }) => ({ ...result, [name]: value }),
      {}
    );

    const value = JSON.stringify({
      ...JSON.parse(meta),
      fields,
    });

    await spawnProcess(argv, { PRISMATIC_CONNECTION_VALUE: value });
  }
}
