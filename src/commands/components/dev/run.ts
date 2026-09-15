import {
  IntegrationDocument as INTEGRATION,
  type IntegrationQuery,
} from "../../../graphql/operations/integration.generated.js";
import {
  InstanceDocument as INSTANCE,
  type InstanceQuery,
} from "../../../graphql/operations/instance.generated.js";
import { commandSignal } from "../../../command.js";
import { gqlRequest, requireResource } from "../../../graphql.js";
import { spawnProcess, streamProcess } from "../../../utils/process.js";
import { z, Cli } from "incur";
import { CommandFailedError, ValidationError } from "../../../errors.js";

type ConfigVariable =
  | NonNullable<IntegrationQuery["integration"]>["testConfigVariables"]["nodes"][number]
  | NonNullable<InstanceQuery["instance"]>["configVariables"]["nodes"][number];

export default Cli.command({
  output: z.discriminatedUnion("type", [
    z.object({ type: z.literal("stdout"), data: z.string() }),
    z.object({ type: z.literal("stderr"), data: z.string() }),
    z.object({ type: z.literal("completed"), exitCode: z.literal(0) }),
  ]),
  description:
    "Fetch an integration's active connection and execute a CLI command with that connection's fields as an environment variable.\nAfter specifying an integration ID and connection config variable name, this command executes a CLI command with that connection's fields saved as a config variable named PRISMATIC_CONNECTION_VALUE.",
  hint: `Pass the local command after --. For example:
prism components dev run -i INTEGRATION_ID -c "My Connection" -- printenv PRISMATIC_CONNECTION_VALUE
prism components dev run -i INTEGRATION_ID -c "Slack Connection" -- yarn run test
prism components dev run --instanceId INSTANCE_ID -c "Slack Connection" -- yarn run test`,
  args: z.object({
    command: z.array(z.string()).optional().describe("Local command and arguments to run"),
  }),
  options: z
    .object({
      integrationId: z.string().optional().describe("Integration ID"),
      instanceId: z.string().optional().describe("Instance ID. "),
      connectionKey: z
        .string()
        .describe("Key of the connection config variable to fetch meta/state for"),
    })
    .superRefine((options, ctx) => {
      if (
        [options.integrationId, options.instanceId].filter((value) => value !== undefined)
          .length !== 1
      )
        ctx.addIssue({
          code: "custom",
          path: ["integrationId"],
          message: "Exactly one of --integrationId, --instanceId is required",
        });
    }),
  async *run(context) {
    const {
      args: { command: argv },
      options: { integrationId, instanceId, connectionKey },
    } = context;

    if (!argv?.length) {
      throw new ValidationError({
        message:
          "A command to run must be supplied after a double dash (--) delimiter. See examples in this command's help for details.",
      });
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
      configVariables = requireResource(result.integration, "Integration").testConfigVariables
        .nodes;
    } else {
      if (!instanceId)
        throw new ValidationError({
          message: "Either integrationId or instanceId is required",
        });
      // Get the config variable from an instance
      const result = await gqlRequest({
        document: INSTANCE,
        variables: {
          id: instanceId,
        },
      });
      configVariables = requireResource(result.instance, "Instance").configVariables.nodes;
    }

    const [connection] = configVariables.filter(
      ({ requiredConfigVariable: { key } }) => key === connectionKey,
    );

    if (!connection) {
      throw new CommandFailedError({
        message: "Failed to find active connection with that name.",
      });
    }

    const { meta, inputs, requiredConfigVariable } = connection;

    // Combine templated connection field values with the test instance's field values
    const fields = {
      ...Object.fromEntries(
        requiredConfigVariable.connectionTemplate?.inputFieldTemplates.nodes.map(
          ({ inputField, value }) => [inputField.key, value],
        ) ?? [],
      ),
      ...Object.fromEntries((inputs?.nodes ?? []).map(({ name, value }) => [name, value])),
    };

    const value = JSON.stringify({
      ...(typeof meta === "string"
        ? JSON.parse(meta)
        : meta && typeof meta === "object"
          ? meta
          : {}),
      fields,
    });

    const environment = { PRISMATIC_CONNECTION_VALUE: value };
    if (context.agent) {
      yield* streamProcess(argv, environment, { signal: commandSignal() });
    } else {
      await spawnProcess(argv, environment, { signal: commandSignal() });
    }
  },
  alias: { connectionKey: "c", integrationId: "i" },
});
