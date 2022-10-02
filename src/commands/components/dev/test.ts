import { promisify } from "util";
import dotenv from "dotenv";
import { Command, Flags, CliUx } from "@oclif/core";
import inquirer, { DistinctQuestion } from "inquirer";
import { snakeCase, upperCase, kebabCase } from "lodash";
import { serverTypes } from "@prismatic-io/spectral"; // FIXME: Get rid of this and stop exporting it in Spectral.
import {
  loadEntrypoint,
  createComponentPackage,
  publishDefinition,
  uploadConnectionIcons,
  uploadFile,
  validateDefinition,
  checkPackageSignature,
} from "../../../utils/component/publish";
import { displayLogs } from "../../../utils/execution/logs";
import {
  buildComponentTestHarnessIntegration,
  componentTestIntegrationName,
  ComponentTestInfo,
} from "../../../utils/integration/definition";
import { importDefinition } from "../../../utils/integration/import";
import { runIntegrationFlow } from "../../../utils/integration/invoke";
import { pollForActiveConfigVarState } from "../../../utils/integration/query";
import { Expression } from "../../../utils/integration/export";
import { exists } from "../../../fs";
import { whoAmI } from "../../../utils/user/query";

const setTimeoutPromise = promisify(setTimeout);

const envVarCase = (name: string): string =>
  upperCase(snakeCase(name)).replace(/\s+/g, "_");

const toInquirerInputType = (
  type: string,
  collection: string | undefined
): Required<DistinctQuestion["type"]> => {
  if (collection) {
    // FIXME: Improve prompting instead of instantly bailing to editor.
    return "editor";
  }

  switch (type) {
    case "boolean":
      return "checkbox";
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
}: serverTypes.Input): DistinctQuestion => ({
  type: toInquirerInputType(type, collection),
  name: key,
  message: `${label}:`,
  when: (answers) => {
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
  filter: (value) => {
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
});

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
    {}
  );

  const connectionValues = Object.entries(connectionInputs).reduce<
    Required<ComponentTestInfo>["connectionInfo"]["values"]
  >(
    (result, [key, value]) => ({
      ...result,
      [key]: value,
    }),
    {}
  );

  const connectionInfo = connection
    ? { key: connection.key, values: connectionValues }
    : undefined;

  return {
    actionInfo: { key: action.key, values: actionValues },
    connectionInfo,
  };
};

export default class TestCommand extends Command {
  static description =
    "Run a Component in Prismatic by publishing it into a test Integration";
  static flags = {
    envPath: Flags.string({
      required: false,
      default: ".env",
      char: "e",
      description: "Path to dotenv file to load for supplying testing values",
    }),
  };

  async run() {
    const {
      flags: { envPath },
    } = await this.parse(TestCommand);

    if (await exists(envPath)) {
      const { error } = dotenv.config({ path: envPath });
      if (error) {
        CliUx.ux.error(`Failed to load specified dotenv file: ${error}`, {
          exit: 1,
        });
      }
    }

    CliUx.ux.action.start("Validating Component");

    const { name } = await whoAmI();
    if (!name) {
      CliUx.ux.error(
        "Failed to determine the name of the currently logged in user.",
        {
          exit: 1,
        }
      );
    }

    const testingKey = kebabCase(name);

    const definition = await loadEntrypoint();
    const { key: componentKey, public: isPublic } = definition;
    definition.key = `${componentKey}-${testingKey}-testing`;
    definition.display.label = `${definition.display.label} ${name} Testing`;
    await validateDefinition(definition);

    const packagePath = await createComponentPackage();
    const signatureMatches = await checkPackageSignature(
      definition,
      packagePath
    );

    CliUx.ux.action.stop();

    if (!signatureMatches) {
      CliUx.ux.action.start("Publishing Component");

      const { iconUploadUrl, packageUploadUrl, connectionIconUploadUrls } =
        await publishDefinition(definition);

      const {
        display: { iconPath },
      } = definition;
      await uploadFile(iconPath, iconUploadUrl);
      await uploadConnectionIcons(definition, connectionIconUploadUrls);
      await uploadFile(packagePath, packageUploadUrl);

      CliUx.ux.action.stop();
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
        })
      ),
      default: Object.keys(actions)[0],
      filter: (value: string) => actions[value],
    });

    const { inputs } = action;

    // Ask for values of action's inputs
    const actionInputs = await inquirer.prompt(
      inputs.map((i) => getInputQuestion(i))
    );

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
          .map((i) => getInputQuestion(i))
      );

      Object.assign(answers, { connection, connectionInputs });
    }

    const { actionInfo, connectionInfo } = valuesFromAnswers(answers);

    CliUx.ux.action.start("Assembling test integration");

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

    CliUx.ux.action.stop();
    CliUx.ux.action.start("Updating test Integration");

    const {
      integrationId,
      flows: [{ id: flowId }],
      pendingAuthorizations,
    } = await importDefinition(harnessYaml);

    CliUx.ux.action.stop();

    // Prompt for user authorization of pending connections
    if (pendingAuthorizations.length > 0) {
      const [{ id, url }] = pendingAuthorizations;
      if (!url) {
        throw new Error(
          "Did not receive a valid URL for authorization. Verify your Connection inputs."
        );
      }

      CliUx.ux.url("Authorize URL", url);
      await CliUx.ux.anykey(
        "Press any key to open your browser and authorize the Connection"
      );
      await CliUx.ux.open(url);

      CliUx.ux.action.start("Waiting for Connection authorization");

      await pollForActiveConfigVarState(integrationId, id);

      CliUx.ux.action.stop();
    }

    CliUx.ux.action.start("Running test Integration");

    const { executionId } = await runIntegrationFlow({ integrationId, flowId });

    await displayLogs(executionId);

    CliUx.ux.action.stop();
  }
}
