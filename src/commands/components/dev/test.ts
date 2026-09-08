import { getRuntimeEnvironment, runWithEnvironment } from "../../../runtime.js";
import { resolve } from "node:path";
import { getPackageEntrypointDirectory } from "../../../utils/import.js";
import type serverTypes from "@prismatic-io/spectral/dist/serverTypes/index.js";
import dotenv from "dotenv";
import { z } from "incur";
import inquirer, { type Answers, type Question } from "inquirer";
import { kebabCase, snakeCase, upperCase } from "lodash-es";
import open from "open";
import { promisify } from "util";
import {
  commandOutput,
  defineCommand,
  requireInteractiveInput,
  optionsSchema,
} from "../../../command.js";
import { exists, fs } from "../../../fs.js";
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
  type ComponentTestInfo,
  componentTestIntegrationName,
} from "../../../utils/integration/definition.js";
import type { Expression } from "../../../utils/integration/export.js";
import { importDefinition } from "../../../utils/integration/import.js";
import { deleteIntegration, runIntegrationFlow } from "../../../utils/integration/invoke.js";
import { pollForActiveConfigVarState } from "../../../utils/integration/query.js";
import { spawnProcess } from "../../../utils/process.js";
import { whoAmI } from "../../../utils/user/query.js";
import { ux } from "../../../utils/ux.js";

const setTimeoutPromise = promisify(setTimeout);

const envVarCase = (name: string): string => upperCase(snakeCase(name)).replace(/\s+/g, "_");

type PromptType = "editor" | "select" | "password" | "input";
type InputQuestion = Question<Answers, PromptType>;

const toInquirerInputType = (type: string, collection: string | undefined): PromptType => {
  if (collection) {
    // FIXME: Improve prompting instead of instantly bailing to editor.
    return "editor";
  }

  switch (type) {
    case "boolean":
      return "select";
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
}: serverTypes.Input): InputQuestion => {
  const questionBase = {
    type: toInquirerInputType(type, collection),
    name: key,
    message: `${label}:`,
    when: (answers: Answers) => {
      const envVar = envVarCase(key);
      const environment = getRuntimeEnvironment();
      const exists = envVar in environment;
      if (exists) {
        const value = environment[envVar] ?? "";
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

export default defineCommand({
  mutates: true,
  description: "Run an action of a component within a test integration in the integration runner",
  output: z.union([
    z.object({ executionId: z.string(), outputPath: z.string().optional() }),
    z.object({
      authorizationRequired: z.object({
        configVarId: z.string(),
        url: z.string(),
      }),
    }),
  ]),
  options: optionsSchema(
    z.object({
      action: z.string().optional().describe("Action key to test (required in agent mode)"),
      "action-inputs": z
        .string()
        .optional()
        .describe("JSON object containing action input values (agent mode)"),
      envPath: z
        .string()
        .default(".env")
        .describe("Path to dotenv file to load for supplying testing values")
        .meta({ cli: { char: "e" } }),
      build: z
        .boolean()
        .default(true)
        .describe("Build the component prior to testing")
        .meta({ cli: { allowNo: true, char: "b" } }),
      "output-file": z
        .string()
        .optional()
        .describe("Output the results of the action to a specified file")
        .meta({ cli: { char: "o" } }),
      "print-results": z
        .boolean()
        .default(false)
        .describe("Print the results of the action to stdout"),
      "clean-up": z
        .boolean()
        .default(false)
        .describe("Clean up the integration and temporary component after running the action"),
      connection: z.string().optional().describe("Connection key to test (agent mode)"),
      "connection-inputs": z
        .string()
        .optional()
        .describe("JSON object containing connection input values (agent mode)"),
    }),
  ),
  async run(context) {
    const {
      options: {
        envPath,
        build,
        "output-file": outputFile,
        "print-results": printResults,
        "clean-up": cleanUp,
        action: actionKey,
        "action-inputs": rawActionInputs,
        connection: connectionKey,
        "connection-inputs": rawConnectionInputs,
      },
    } = context;

    // Agent input must be complete and syntactically valid before we build the local
    // component or perform any authenticated API work.
    const suppliedActionInputs = context.agent
      ? parseInputObject(rawActionInputs, "--action-inputs")
      : {};
    const suppliedConnectionInputs = context.agent
      ? parseInputObject(rawConnectionInputs, "--connection-inputs")
      : {};
    if (context.agent && !actionKey) {
      requireInteractiveInput("Agent mode requires --action and optional --action-inputs JSON");
    }

    // Save the current working directory, so we can return later after moving to dist/
    const cwd = process.cwd();

    if (build) {
      commandOutput.log("Building component...");
      await spawnProcess(["npm", "run", "build"], {});
    }

    const environment = { ...getRuntimeEnvironment() };
    if (await exists(envPath)) {
      Object.assign(environment, dotenv.parse(await fs.readFile(envPath)));
    }
    return runWithEnvironment(environment, async () => {
      ux.action.start("Validating Component");

      const { name } = await whoAmI();
      if (!name) {
        ux.error("Failed to determine the name of the currently logged in user.", {
          exit: 1,
        });
      }

      const testingKey = kebabCase(name);

      const componentDirectory = await getPackageEntrypointDirectory("component");
      const loadedDefinition = await loadEntrypoint(componentDirectory);
      const definition = { ...loadedDefinition, display: { ...loadedDefinition.display } };
      const { key: componentKey, public: isPublic } = definition;
      definition.key = `${componentKey}-${testingKey}-testing`;
      definition.display.label = `${definition.display.label} ${name} Testing`;
      await validateDefinition(definition, { cwd: componentDirectory });

      const packagePath = await createComponentPackage(componentDirectory);
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
          await uploadFile(resolve(componentDirectory, iconPath), iconUploadUrl);
        }

        await uploadConnectionIcons(definition, connectionIconUploadUrls, componentDirectory);
        await uploadFile(packagePath, packageUploadUrl);

        ux.action.stop();
      }

      const publishedTimestamp = Date.now();

      const actions = definition.actions || {};

      let action: serverTypes.Action;
      let actionInputs: Answers;
      if (context.agent) {
        const selected = actionKey ? actions[actionKey] : undefined;
        if (!selected) {
          commandOutput.error(`Unknown action key: ${actionKey}`, { exit: 2 });
        }
        action = selected;
        actionInputs = inputValues(action.inputs, suppliedActionInputs);
      } else {
        ({ action } = await inquirer.prompt<{ action: serverTypes.Action }>({
          type: "select",
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
        }));
        actionInputs = await inquirer.prompt(action.inputs.map((i) => getInputQuestion(i)));
      }

      const { inputs } = action;

      const answers = {
        action,
        actionInputs,
      };

      // Ask about Connection to test if there is a connection type input
      const hasConnection = inputs.some(({ type }) => type === "connection");
      if (hasConnection) {
        const connections = definition.connections || [];
        let connection: serverTypes.Connection;
        let connectionInputs: Answers;
        if (context.agent) {
          if (!connectionKey) {
            requireInteractiveInput(
              "The selected action requires --connection and optional --connection-inputs JSON",
            );
          }
          const selected = connections.find(({ key }) => key === connectionKey);
          if (!selected) {
            return commandOutput.error(`Unknown connection key: ${connectionKey}`, { exit: 2 });
          }
          connection = selected;
          connectionInputs = inputValues(connection.inputs, suppliedConnectionInputs);
        } else {
          ({ connection } = await inquirer.prompt<{
            connection: serverTypes.Connection;
          }>({
            type: "select",
            name: "connection",
            message: "Connection:",
            choices: connections.map(({ key, label }) => ({
              name: label,
              value: key,
              short: key,
            })),
            default: Object.keys(connections)[0],
            filter: (value: string) => {
              const [connection] = connections.filter(({ key }) => value === key);
              return connection;
            },
          }));

          connectionInputs = await inquirer.prompt(
            connection.inputs
              .filter(({ shown }) => shown === undefined || shown === true)
              .map((i) => getInputQuestion(i)),
          );
        }

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
        pendingAuthorizations,
        systemInstance: {
          flowConfigs: {
            nodes: [
              {
                flow: { id: flowId },
              },
            ],
          },
        },
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

        if (context.agent) {
          return { authorizationRequired: { configVarId: id, url } };
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
        commandOutput.log(`Writing step results to ${outputFile}`);
        await writeFinalStepResults(executionId, resolve(cwd, outputFile));
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
      return { executionId, ...(outputFile ? { outputPath: resolve(cwd, outputFile) } : {}) };
    });
  },
});

const parseInputObject = (raw: string | undefined, flag: string): Record<string, unknown> => {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    return commandOutput.error(`${flag} must be a JSON object`, { exit: 2 });
  }
};

const inputValues = (inputs: serverTypes.Input[], provided: Record<string, unknown>): Answers =>
  Object.fromEntries(
    inputs.flatMap((input) => {
      const value = provided[input.key] ?? input.default;
      if (value === undefined) return [];
      if (input.type === "connection") {
        return [[input.key, { type: "configVar", value: String(value) }]];
      }
      if (input.collection) return [[input.key, { type: "complex", value }]];
      return [[input.key, { type: "value", value }]];
    }),
  );
