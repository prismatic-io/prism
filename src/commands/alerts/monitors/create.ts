import { parseJsonOrUndefined } from "../../../fields.js";
import { CreateAlertMonitorDocument as CREATE_ALERT_MONITOR } from "../../../graphql/operations/createAlertMonitor.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ alertMonitorId: z.string() }).extend(warningsOutput),
  description:
    "Create an Alert Monitor by attaching an Alert Trigger and a set of users and webhooks to an Instance.\nWhile individual users and webhooks can be tied to alert monitors, it is recommended that you create alert groups and attach alert groups to alert monitors. This helps in the case that you need to add a user to a set of monitors: it's simpler to edit a single alert group than to edit dozens of alert monitors.",
  examples: [
    { description: "Get the ID of an alert group named 'DevOps':" },
    { description: "Get the ID of an instance named 'My Instance':" },
    { description: "Get the ID of an execution duration trigger:" },
    {
      description:
        "Create an alert monitor that alerts the DevOps group when an instance execution takes longer than 10 seconds:",
      options: {
        name: "Alert Devops of slow execution",
        instance: `\${INSTANCE_ID}`,
        triggers: `[\\"\${TRIGGER_ID}\\"]`,
        duration: 10,
        groups: `[\\"\${ALERT_GROUP_ID}\\"]`,
      },
    },
  ],
  options: z.object({
    name: z.string().describe("name of the alert monitor to be created"),
    instance: z.string().describe("ID of the instance to monitor"),
    triggers: z
      .string()
      .describe("JSON-formatted list of trigger IDs that should trigger this monitor"),
    duration: z.coerce
      .number()
      .int()
      .optional()
      .describe("greatest time allowed (in seconds) for time-based triggers"),
    "log-severity": z.coerce
      .number()
      .int()
      .optional()
      .describe("greatest log level {debug, info, warn, error} allowed for log-based triggers"),
    groups: z.string().optional().describe("JSON-formatted list of group IDs to alert"),
    users: z.string().optional().describe("JSON-formatted list of Prismatic user IDs alert"),
  }),
  async run(context) {
    const {
      options: {
        name,
        instance,
        triggers: triggerJson,
        duration,
        "log-severity": logSeverity,
        groups: groupJson,
        users: userJson,
      },
    } = context;

    const triggers = parseJsonOrUndefined(triggerJson);
    const groups = parseJsonOrUndefined(groupJson);
    const users = parseJsonOrUndefined(userJson);

    const result = await gqlRequest({
      document: CREATE_ALERT_MONITOR,
      variables: {
        name,
        instance,
        triggers,
        logSeverity,
        duration,
        groups,
        users,
      },
    });
    const requiredValue1 = result.createAlertMonitor?.alertMonitor?.id;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Alert monitor was not created",
        exitCode: 2,
      });

    return {
      alertMonitorId: requiredValue1,
    };
  },
  alias: {
    users: "u",
    groups: "g",
    "log-severity": "s",
    duration: "d",
    triggers: "t",
    instance: "i",
    name: "n",
  },
});
