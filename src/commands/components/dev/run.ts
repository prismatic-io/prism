import { IntegrationDocument as INTEGRATION } from "../../../graphql/operations/integration.generated.js";
import { InstanceDocument as INSTANCE } from "../../../graphql/operations/instance.generated.js";
import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import { spawnProcess, streamProcess } from "../../../utils/process.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";

interface ConfigVariable {
  requiredConfigVariable: {
    key: string;
    connectionTemplate?: {
      inputFieldTemplates: { nodes: { inputField: { key: string }; value: string | null }[] };
    } | null;
  };
  inputs: { nodes: { name: string; value: string }[] } | null;
  meta: unknown;
}

export default defineCommand({
  mutates: true,
  output: z.discriminatedUnion("type", [
    z.object({ type: z.literal("stdout"), data: z.string() }),
    z.object({ type: z.literal("stderr"), data: z.string() }),
    z.object({ type: z.literal("completed"), exitCode: z.literal(0) }),
  ]),
  description:
    "Fetch an integration's active connection and execute a CLI command with that connection's fields as an environment variable.\nAfter specifying an integration ID and connection config variable name, this command executes a CLI command with that connection's fields saved as a config variable named PRISMATIC_CONNECTION_VALUE.",
  hint: "Pass the local command after -- (for example: -- yarn run test).",
  examples: [
    {
      description:
        'To simply print an integration\'s basic auth config variable named "My Connection" and pipe the resulting JSON to jq, run:',
      args: { command: ["printenv"] },
      options: { integrationId: "SW50ZWexample", connectionKey: "My Connection" },
    },
    {
      description:
        'If one of your integrations has an authenticated OAuth 2.0 config variable "Slack Connection", you could run your component\'s unit tests with that environment variable:',
      args: { command: ["yarn"] },
      options: { integrationId: "SW50ZWexample", connectionKey: "Slack Connection" },
    },
    {
      description:
        "If you would like to fetch a connection from an instance deployed to one of your customers, specify the --instanceId flag instead",
      args: { command: ["yarn"] },
      options: { instanceId: "SW50ZWexample", connectionKey: "Slack Connection" },
    },
  ],
  args: argsSchema(
    z.object({
      command: z.array(z.string()).optional().describe("Local command and arguments to run"),
    }),
  ),
  options: optionsSchema(
    z.object({
      integrationId: z
        .string()
        .optional()
        .describe("Integration ID")
        .meta({ cli: { char: "i", exactlyOne: ["instanceId", "integrationId"] } }),
      instanceId: z.string().optional().describe("Instance ID. "),
      connectionKey: z
        .string()
        .describe("Key of the connection config variable to fetch meta/state for")
        .meta({ cli: { char: "c" } }),
    }),
  ),
  async *run(context) {
    const {
      args: { command: argv },
      options: { integrationId, instanceId, connectionKey },
    } = context;

    if (!argv?.length) {
      commandOutput.error(
        "A command to run must be supplied after a double dash (--) delimiter. See examples in this command's help for details.",
      );
    }

    let configVariables: ConfigVariable[];

    // Get connection from the integration's test instance
    if (integrationId) {
      const result = await gqlRequest({
        document: INTEGRATION,
        variables: {
          id: integrationId,
        },
      });

      configVariables =
        result.integration?.testConfigVariables.nodes ??
        commandOutput.error("Integration was not found");
    } else {
      if (!instanceId) commandOutput.error("Either integrationId or instanceId is required");
      // Get the config variable from an instance
      const result = await gqlRequest({
        document: INSTANCE,
        variables: {
          id: instanceId,
        },
      });

      configVariables =
        result.instance?.configVariables.nodes ?? commandOutput.error("Instance was not found");
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
      ...inputs?.nodes.reduce<Record<string, unknown>>(
        (result, { name, value }) => ({ ...result, [name]: value }),
        {},
      ),
    };

    const value = JSON.stringify({
      ...(typeof meta === "string" ? JSON.parse(meta) : {}),
      fields,
    });

    const environment = { PRISMATIC_CONNECTION_VALUE: value };
    if (context.agent) {
      yield* streamProcess(argv, environment, { signal: context.var.signal });
    } else {
      await spawnProcess(argv, environment, { signal: context.var.signal });
    }
  },
});
