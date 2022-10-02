import { dumpYaml } from "../serialize";
import { merge } from "lodash";
import {
  exportDefinition,
  IntegrationDefinition,
  Expression,
  ConfigVar,
  Step,
} from "./export";

interface ConnectionInfo {
  key: string;
  values: Record<string, Expression>;
}

interface ActionInfo {
  key: string;
  values: Record<string, Expression>;
}

interface ComponentInfo {
  key: string;
  isPublic: boolean;
}

export interface ComponentTestInfo {
  integrationInfo: {
    id?: string;
    name: string;
  };
  componentInfo: ComponentInfo;
  actionInfo: ActionInfo;
  connectionInfo?: ConnectionInfo;
}

export const componentTestIntegrationName = (
  componentKey: string,
  name: string
): string => `Component Test Harness - ${componentKey} - ${name}`;

export const buildConnectionConfigVar = (
  { key: componentKey, isPublic }: ComponentInfo,
  { key, values }: ConnectionInfo
): ConfigVar => {
  return {
    key: "testConnection",
    description: "Test Connection",
    dataType: "connection",
    connection: {
      component: {
        key: componentKey,
        isPublic,
        version: "LATEST",
      },
      key,
    },
    inputs: values,
  };
};

export const buildStep = (
  { key: componentKey, isPublic }: ComponentInfo,
  { key, values }: ActionInfo
): Step => {
  return {
    name: "Test Step",
    action: {
      component: {
        key: componentKey,
        isPublic,
        version: "LATEST",
      },
      key,
    },
    inputs: values,
  };
};

export const defaultDefinition = ({
  integrationInfo: { name: integrationName },
  componentInfo,
  actionInfo,
  connectionInfo,
}: ComponentTestInfo): IntegrationDefinition => {
  const requiredConfigVars = connectionInfo
    ? [buildConnectionConfigVar(componentInfo, connectionInfo)]
    : [];

  const { key: componentKey } = componentInfo;

  const definition = {
    definitionVersion: 6,
    name: integrationName,
    description: `Test Harness for the ${componentKey} Component`,
    category: "Component Development",
    requiredConfigVars,
    flows: [
      {
        name: "Flow 1",
        steps: [
          {
            name: "Trigger",
            isTrigger: true,
            action: {
              component: {
                key: "webhook-triggers",
                isPublic: true,
                version: "LATEST",
              },
              key: "webhook",
            },
          },
          buildStep(componentInfo, actionInfo),
        ],
      },
    ],
  };
  return definition;
};

export const buildComponentTestHarnessIntegration = async (
  info: ComponentTestInfo
): Promise<string> => {
  const {
    integrationInfo: { id: integrationId },
    componentInfo,
    actionInfo,
    connectionInfo,
  } = info;

  const definition = integrationId
    ? await exportDefinition({ integrationId })
    : defaultDefinition(info);

  // Update "current definition" accordingly.
  if (connectionInfo) {
    const connection = buildConnectionConfigVar(componentInfo, connectionInfo);

    const existingConnection = definition.requiredConfigVars?.filter(
      ({ key }) => key === "testConnection"
    )?.[0];
    if (existingConnection) {
      merge(existingConnection, connection);
    } else if (definition.requiredConfigVars) {
      definition.requiredConfigVars.push(connection);
    } else {
      definition.requiredConfigVars = [connection];
    }
  }

  const step = buildStep(componentInfo, actionInfo);
  const existingStep = definition.flows[0].steps.filter(
    ({ name }) => name === "Test Step"
  )[0];
  merge(existingStep, step);

  return dumpYaml(definition);
};
