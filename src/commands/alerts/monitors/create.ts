import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { parseJsonOrUndefined } from "../../../fields.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class CreateCommand extends PrismaticBaseCommand {
  static description =
    "Create an Alert Monitor by attaching an Alert Trigger and a set of users and webhooks to an Instance.\nWhile individual users and webhooks can be tied to alert monitors, it is recommended that you create alert groups and attach alert groups to alert monitors. This helps in the case that you need to add a user to a set of monitors: it's simpler to edit a single alert group than to edit dozens of alert monitors.";

  static examples = [
    {
      description: "Get the ID of an alert group named 'DevOps':",
      command:
        "ALERT_GROUP_ID=$(prism alerts:groups:list --columns id --filter 'name=^DevOps$' --no-header)",
    },
    {
      description: "Get the ID of an instance named 'My Instance':",
      command:
        "INSTANCE_ID=$(prism instances:list --columns id --filter 'name=^My Instance$' --no-header)",
    },
    {
      description: "Get the ID of an execution duration trigger:",
      command:
        "TRIGGER_ID=$(prism alerts:triggers:list --columns id --filter 'name=^Execution Duration Matched or Exceeded$' --no-header)",
    },
    {
      description:
        "Create an alert monitor that alerts the DevOps group when an instance execution takes longer than 10 seconds:",
      command:
        '<%= config.bin %> <%= command.id %> --name "Alert Devops of slow execution" --instance ${INSTANCE_ID} --triggers "[\\"${TRIGGER_ID}\\"]" --duration 10 --groups "[\\"${ALERT_GROUP_ID}\\"]"',
    },
  ];

  static flags = {
    name: Flags.string({
      name: "name",
      char: "n",
      required: true,
      description: "name of the alert monitor to be created",
    }),
    instance: Flags.string({
      name: "instance",
      char: "i",
      required: true,
      description: "ID of the instance to monitor",
    }),
    triggers: Flags.string({
      name: "triggers",
      char: "t",
      required: true,
      description: "JSON-formatted list of trigger IDs that should trigger this monitor",
    }),
    duration: Flags.integer({
      name: "duration",
      required: false,
      char: "d",
      description: "greatest time allowed (in seconds) for time-based triggers",
    }),
    "log-severity": Flags.integer({
      name: "log-severity",
      required: false,
      char: "s",
      description: "greatest log level {debug, info, warn, error} allowed for log-based triggers",
    }),
    groups: Flags.string({
      required: false,
      name: "groups",
      char: "g",
      description: "JSON-formatted list of group IDs to alert",
    }),
    users: Flags.string({
      required: false,
      name: "users",
      char: "u",
      description: "JSON-formatted list of Prismatic user IDs alert",
    }),
  };

  async run() {
    const {
      flags: {
        name,
        instance,
        triggers: triggerJson,
        duration,
        "log-severity": logSeverity,
        groups: groupJson,
        users: userJson,
      },
    } = await this.parse(CreateCommand);

    const triggers = parseJsonOrUndefined(triggerJson);
    const groups = parseJsonOrUndefined(groupJson);
    const users = parseJsonOrUndefined(userJson);

    const result = await gqlRequest({
      document: gql`
        mutation createAlertMonitor(
          $name: String!
          $instance: ID!
          $triggers: [ID]!
          $logSeverity: Int
          $duration: Int
          $groups: [ID]
          $users: [ID]
        ) {
          createAlertMonitor(
            input: {
              name: $name
              instance: $instance
              triggers: $triggers
              logSeverityLevelCondition: $logSeverity
              durationSecondsCondition: $duration
              groups: $groups
              users: $users
            }
          ) {
            alertMonitor {
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
        instance,
        triggers,
        logSeverity,
        duration,
        groups,
        users,
      },
    });

    this.log(result.createAlertMonitor.alertMonitor.id);
  }
}
