export type ValidComplexYAMLValue = Array<{
  type: string;
  value: ValidYAMLValue | ValidComplexYAMLValue | ConditionObjectFromYAML;
  name?:
    | string
    | {
        type: string;
        value: ValidYAMLValue;
        name?: string;
      };
}>;

export type ValidYAMLValue = string | Array<string | unknown> | number | boolean;

export type ConditionObjectFromYAML = Array<string | unknown>;

export type ComponentObjectFromYAML = {
  isPublic: boolean;
  key: string;
  version: number;
};

export type ActionObjectFromYAML = {
  action: {
    component: ComponentObjectFromYAML;
    key: string;
  };
  description: string;
  inputs: Record<
    string,
    {
      type: string;
      value: ValidYAMLValue | ValidComplexYAMLValue | Array<ValidComplexYAMLValue>;
    }
  >;
  formattedInputs?: string;
  isTrigger?: boolean;
  name: string;
  steps?: Array<ActionObjectFromYAML>;
  branches?: Array<{
    name: string;
    steps: Array<ActionObjectFromYAML>;
  }>;
  schedule?: {
    type?: string;
    value?: string;
    timezone: string;
    meta?: {
      scheduleType: string;
    };
  };

  // Added by prism during CNI generation
  loopString?: string;
  branchString?: string;
};

export type ConfigVarObjectFromYAML = {
  dataType: string;
  defaultValue?: string;
  description?: string;
  key: string;
  orgOnly?: boolean;
  collectionType?: string;
  connection?: {
    component: {
      isPublic: boolean;
      key: string;
      version: number;
    };
    key: string;
    dataType: string;
  };
  dataSource?: {
    component: {
      isPublic: boolean;
      key: string;
      version: number;
    };
    key: string;
    dataType: string;
  };
  inputs?: Record<
    string,
    {
      type: string;
      value: string;
      meta: {
        visibleToOrgDeployer: boolean;
        visibleToCustomerDeployer: boolean;
        orgOnly: boolean;
        writeOnly: boolean;
      };
    }
  >;
  useScopedConfigVar?: string;
  meta?: {
    visibleToOrgDeployer: boolean;
    visibleToCustomerDeployer: boolean;
    orgOnly?: boolean;
  };
};

export type FlowObjectFromYAML = {
  endpointSecurityType: string;
  isSynchronous: boolean;
  name: string;
  description: string;
  steps: Array<ActionObjectFromYAML>;
};

export type IntegrationObjectFromYAML = {
  name: string;
  description: string;
  definitionVersion: number;
  flows: Array<FlowObjectFromYAML>;
  configPages: Array<{
    elements: Array<{
      type: string;
      value: string;
    }>;
    name: string;
    tagline?: string;
    userLevelConfigured: boolean;
  }>;
  requiredConfigVars: Array<ConfigVarObjectFromYAML>;
  documentation: string;
};
