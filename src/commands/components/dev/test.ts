import { Flags, ux } from "@oclif/core";
import { serverTypes } from "@prismatic-io/spectral"; // FIXME: Get rid of this and stop exporting it in Spectral.
import dotenv from "dotenv";
import inquirer, { DistinctQuestion, Answers, ListQuestionOptions } from "inquirer";
import { kebabCase, snakeCase, upperCase } from "lodash-es";
import open from "open";
import { promisify } from "util";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { exists } from "../../../fs.js";
import { deleteComponentByKey } from "../../../utils/component/deleteByKey.js";
import {
  createComponentPackage,
  loadEntrypoint,
  validateDefinition,
} from "../../../utils/component/index.js";
import {
  checkPackageSignature,
  publishDefinition,
  uploadConnectionIcons,
  uploadFile,
} from "../../../utils/component/publish.js";
import { displayLogs } from "../../../utils/execution/logs.js";
import {
  printFinalStepResults,
  writeFinalStepResults,
} from "../../../utils/execution/stepResults.js";
import {
  buildComponentTestHarnessIntegration,
  ComponentTestInfo,
  componentTestIntegrationName,
} from "../../../utils/integration/definition.js";
import { Expression } from "../../../utils/integration/export.js";
import { importDefinition } from "../../../utils/integration/import.js";
import { deleteIntegration, runIntegrationFlow } from "../../../utils/integration/invoke.js";
import { pollForActiveConfigVarState } from "../../../utils/integration/query.js";
import { spawnProcess } from "../../../utils/process.js";
import { whoAmI } from "../../../utils/user/query.js";

const setTimeoutPromise = promisify(setTimeout);

const envVarCase = (name: string): string => upperCase(snakeCase(name)).replace(/\s+/g, "_");

const toInquirerInputType = (
  type: string,
  collection: string | undefined,
): Required<DistinctQuestion["type"]> => {
  if (collection) {
    // FIXME: Improve prompting instead of instantly bailing to editor.
    return "editor";
  }

  switch (type) {
    case "boolean":
      return "list";
    case "password":
      return "password";
    case "code":
      return "editor";
    default:
      return "input";
  }
};

const getInputQuestion = ({
  key,
  label,
  type,
  collection,
  default: defaultValue,
}: serverTypes.Input): DistinctQuestion | ListQuestionOptions => {
  const questionBase = {
    type: toInquirerInputType(type, collection),
    name: key,
    message: `${label}:`,
    when: (answers: Answers) => {
      const envVar = envVarCase(key);
      const exists = envVar in process.env;
      if (exists) {
        const value = process.env[envVar] ?? "";
        answers[key] = collection
          ? { type: "complex", value: JSON.parse(value) }
          : { type: "value", value };
      }
      return !exists;
    },
    filter: (value: string) => {
      if (type === "connection") {
        return { type: "configVar", value };
      }

      if (collection) {
        return {
          type: "complex",
          value: JSON.parse(value),
        };
      }

      return {
        type: "value",
        value,
      };
    },
    default: () => (type === "connection" ? "testConnection" : defaultValue),
  };

  if (type === "boolean") {
    return {
      ...questionBase,
      choices: [
        {
          name: "true",
          value: "true",
        },
        {
          name: "false",
          value: "false",
        },
      ],
    };
  }

  return questionBase;
};

interface PromptAnswers {
  action: serverTypes.Action;
  actionInputs: Record<string, Expression>;
  connection?: serverTypes.Connection;
  connectionInputs?: Record<string, Expression>;
}

const valuesFromAnswers = ({
  action,
  actionInputs,
  connection,
  connectionInputs = {},
}: PromptAnswers): Pick<ComponentTestInfo, "actionInfo" | "connectionInfo"> => {
  const actionValues = Object.entries(actionInputs).reduce<
    ComponentTestInfo["actionInfo"]["values"]
  >(
    (result, [key, value]) => ({
      ...result,
      [key]: value,
    }),
    {},
  );

  const connectionValues = Object.entries(connectionInputs).reduce<
    Required<ComponentTestInfo>["connectionInfo"]["values"]
  >(
    (result, [key, value]) => ({
      ...result,
      [key]: value,
    }),
    {},
  );

  const connectionInfo = connection ? { key: connection.key, values: connectionValues } : undefined;

  return {
    actionInfo: { key: action.key, values: actionValues },
    connectionInfo,
  };
};

export default class TestCommand extends PrismaticBaseCommand {
  static description =
    "Run an action of a component within a test integration in the integration runner";
  static flags = {
    envPath: Flags.string({
      required: false,
      default: ".env",
      char: "e",
      description: "Path to dotenv file to load for supplying testing values",
    }),
    build: Flags.boolean({
      required: false,
      default: true,
      allowNo: true,
      char: "b",
      description: "Build the component prior to testing",
    }),
    "output-file": Flags.string({
      required: false,
      char: "o",
      description: "Output the results of the action to a specified file",
    }),
    "print-results": Flags.boolean({
      required: false,
      default: false,
      description: "Print the results of the action to stdout",
    }),
    "clean-up": Flags.boolean({
      required: false,
      default: false,
      description: "Clean up the integration and temporary component after running the action",
    }),
  };

  async run() {
    const {
      flags: {
        envPath,
        build,
        "output-file": outputFile,
        "print-results": printResults,
        "clean-up": cleanUp,
      },
    } = await this.parse(TestCommand);

    // Save the current working directory, so we can return later after moving to dist/
    const cwd = process.cwd();

    if (build) {
      console.log("Building component...");
      await spawnProcess(["npm", "run", "build"], {});
    }

    if (await exists(envPath)) {
      const { error } = dotenv.config({ path: envPath, override: true });
      if (error) {
        ux.error(`Failed to load specified dotenv file: ${error}`, {
          exit: 1,
        });
      }
    }

    ux.action.start("Validating Component");

    const { name } = await whoAmI();
    if (!name) {
      ux.error("Failed to determine the name of the currently logged in user.", {
        exit: 1,
      });
    }

    const testingKey = kebabCase(name);

    const definition = await loadEntrypoint();
    const { key: componentKey, public: isPublic } = definition;
    definition.key = `${componentKey}-${testingKey}-testing`;
    definition.display.label = `${definition.display.label} ${name} Testing`;
    await validateDefinition(definition);

    const packagePath = await createComponentPackage();
    const signatureMatches = await checkPackageSignature(definition, packagePath);

    ux.action.stop();

    if (!signatureMatches) {
      ux.action.start("Publishing Component");

      const { iconUploadUrl, packageUploadUrl, connectionIconUploadUrls } =
        await publishDefinition(definition);

      const {
        display: { iconPath },
      } = definition;
      if (iconPath) {
        await uploadFile(iconPath, iconUploadUrl);
      }

      await uploadConnectionIcons(definition, connectionIconUploadUrls);
      await uploadFile(packagePath, packageUploadUrl);

      ux.action.stop();
    }

    const publishedTimestamp = Date.now();

    const actions = definition.actions || {};

    const { action } = await inquirer.prompt<{ action: serverTypes.Action }>({
      type: "list",
      name: "action",
      message: "Action:",
      choices: Object.entries(actions).map(
        ([
          key,
          {
            display: { label },
          },
        ]) => ({
          name: label,
          value: key,
          short: key,
        }),
      ),
      default: Object.keys(actions)[0],
      filter: (value: string) => actions[value],
    });

    const { inputs } = action;

    // Ask for values of action's inputs
    const actionInputs = await inquirer.prompt(inputs.map((i) => getInputQuestion(i)));

    const answers = {
      action,
      actionInputs,
    };

    // Ask about Connection to test if there is a connection type input
    const hasConnection = inputs.some(({ type }) => type === "connection");
    if (hasConnection) {
      const connections = definition.connections || [];
      const { connection } = await inquirer.prompt<{
        connection: serverTypes.Connection;
      }>({
        type: "list",
        name: "connection",
        message: "Connection:",
        choices: connections.map(({ key, label }) => ({
          name: label,
          value: key,
          short: key,
        })),
        default: Object.keys(connections)[0],
        filter: (value) => {
          const [connection] = connections.filter(({ key }) => value === key);
          return connection;
        },
      });

      // Prompt for connection's inputs
      const { inputs } = connection;
      const connectionInputs = await inquirer.prompt(
        inputs
          .filter(({ shown }) => shown === undefined || shown === true)
          .map((i) => getInputQuestion(i)),
      );

      Object.assign(answers, { connection, connectionInputs });
    }

    const { actionInfo, connectionInfo } = valuesFromAnswers(answers);

    ux.action.start("Assembling test integration");

    // FIXME: Wait for version to be available but due to issues we have to do a static wait.
    const wait = 5000 - (Date.now() - publishedTimestamp);
    if (wait > 0) {
      await setTimeoutPromise(wait);
    }

    // Build up YAML
    const harnessYaml = await buildComponentTestHarnessIntegration({
      integrationInfo: {
        name: componentTestIntegrationName(componentKey, name),
      },
      componentInfo: { key: definition.key, isPublic: isPublic ?? false },
      actionInfo,
      connectionInfo,
    });

    ux.action.stop();
    ux.action.start("Updating test Integration");

    const {
      integrationId,
      flows: [{ id: flowId }],
      pendingAuthorizations,
    } = await importDefinition(harnessYaml);

    ux.action.stop();

    // Prompt for user authorization of pending connections
    if (pendingAuthorizations.length > 0) {
      const [{ id, url }] = pendingAuthorizations;
      if (!url) {
        throw new Error(
          "Did not receive a valid URL for authorization. Verify your Connection inputs.",
        );
      }

      ux.url("Authorize URL", url);
      await ux.anykey("Press any key to open your browser and authorize the Connection");
      await open(url);

      ux.action.start("Waiting for Connection authorization");

      await pollForActiveConfigVarState(integrationId, id);

      ux.action.stop();
    }

    ux.action.start("Running test Integration");

    const { executionId } = await runIntegrationFlow({ integrationId, flowId });

    await displayLogs(executionId);

    if (outputFile) {
      process.chdir(cwd);
      console.log(`Writing step results to ${outputFile}`);
      await writeFinalStepResults(executionId, outputFile);
    }

    if (printResults) {
      await printFinalStepResults(executionId);
    }

    if (cleanUp) {
      ux.action.start(`Cleaning up test Integration (${integrationId})`);
      await deleteIntegration(integrationId);
      ux.action.stop();

      ux.action.start(`Cleaning up test component (${definition.key})`);
      await deleteComponentByKey(definition.key);
      ux.action.stop();
    }

    ux.action.stop();
  }
}
