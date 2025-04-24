import { Flags, ux } from "@oclif/core";
import axios from "axios";
import inquirer from "inquirer";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { listIntegrationFlows } from "../../../utils/integration/flows.js";
import { exists, fs } from "../../../fs.js";
import { getPrismMetadata } from "../../../utils/integration/metadata.js";
import { handleError } from "../../../utils/errors.js";

const MISSING_PARAM_MESSAGE = "You must provide either a flow-url or an integration-id parameter.";

export default class CniTestFlowCommand extends PrismaticBaseCommand {
  static description = "Run a test execution of a CNI flow";

  static flags = {
    "flow-url": Flags.string({
      char: "u",
      description: "Invocation URL of the flow to run",
      required: false,
    }),
    "integration-id": Flags.string({
      char: "i",
      description: "ID of the integration that the flow belongs to",
      required: false,
    }),
    sync: Flags.boolean({
      char: "s",
      description: "Forces the flow to run synchronously",
      required: false,
    }),
    "include-execution-id": Flags.boolean({
      char: "e",
      description: "Include the execution ID in the response of a synchronous flow execution",
      required: false,
    }),
    "trigger-payload-file": Flags.string({
      char: "p",
      description: "A file containing a custom trigger payload to run the flow with",
      required: false,
    }),
  };

  async run() {
    const {
      flags: {
        sync,
        "flow-url": flowUrl,
        "integration-id": integrationIdFlag,
        "include-execution-id": includeExecutionId,
        "trigger-payload-file": triggerPayloadFilePath,
      },
    } = await this.parse(CniTestFlowCommand);

    let triggerPayload: Record<string, string> = {};

    if (triggerPayloadFilePath) {
      if (await exists(triggerPayloadFilePath)) {
        try {
          triggerPayload = JSON.parse(
            await fs.readFile(triggerPayloadFilePath, { encoding: "utf-8" }),
          );
        } catch (err) {
          handleError({
            message: "The provided trigger payload file contains malformed JSON",
            err,
            throwError: true,
          });
        }
      } else {
        handleError({
          message: `No file found at ${triggerPayloadFilePath}. Please double check the --trigger-payload-file (-p) parameter.`,
          throwError: true,
        });
      }
    }

    let integrationId = integrationIdFlag;
    let invokeUrl = flowUrl ?? "";

    // Try to find an integrationId if we were not provided with an ID or
    // direct invocation URL.
    if (!invokeUrl && !integrationId) {
      try {
        const metadata = await getPrismMetadata();
        integrationId = metadata.integrationId;
      } catch (err) {
        handleError({ message: MISSING_PARAM_MESSAGE, err, throwError: true });
      }

      if (!integrationId) {
        handleError({ message: MISSING_PARAM_MESSAGE, throwError: true });
      }
    }

    // Once we have an integrationId, prompt the user to select a flow.
    // If an invocation URL was provided, this gets skipped.
    if (integrationId) {
      try {
        const flows = await listIntegrationFlows(integrationId);

        if (flows.length === 0) {
          console.error("No flows were found for the given integration.");
          return;
        }

        const { flow } = await inquirer.prompt({
          type: "list",
          name: "flow",
          message: "Select the flow to test:",
          choices: flows.map((flow) => {
            return {
              name: `${flow.name} (${flow.stableKey})`,
              value: {
                invokeUrl: flow.testUrl,
              },
            };
          }),
        });

        invokeUrl = flow.invokeUrl;
      } catch (err) {
        handleError({
          message:
            "There was an error looking up flows for your integration. Please provide an integration ID or reimport your integration.",
          err,
          throwError: true,
        });
      }
    }

    if (!invokeUrl) {
      throw MISSING_PARAM_MESSAGE;
    }

    // At this point we have an invocation URL.
    try {
      ux.action.start("Starting execution...");
      const response = await axios.post(invokeUrl, triggerPayload, {
        headers: {
          ...(sync ? { "prismatic-synchronous": true } : {}),
          "Content-Type": "application/json",
        },
      });
      ux.action.stop();

      this.log(`
        To re-run this flow, use the command:
        prism cni:test:flow -u=${invokeUrl}
        `);

      if (includeExecutionId) {
        this.log(
          JSON.stringify({
            data: response.data,
            executionId: response.headers["prismatic-executionid"],
          }),
        );
      } else {
        this.log(JSON.stringify(response.data));
      }
    } catch (err) {
      handleError({
        message: "There was an error when starting the execution.",
        err,
        throwError: true,
      });
    }
  }
}
