export type ValidComplexYAMLValue = Array<{
  type: string;
  value: ValidYAMLValue;
  name?: {
    type: string;
    value: ValidYAMLValue;
  };
}>;

export type ValidYAMLValue = string | string[] | number | boolean;

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
      value: ValidYAMLValue | ValidComplexYAMLValue;
    }
  >;
  formattedInputs?: string;
  isTrigger: boolean;
  name: string;
  steps?: Array<ActionObjectFromYAML>;
};

export type ConfigPageObjectFromYAML = {
  name: string;
  tagline?: string;
  elements: Array<{
    type: string;
    value: string;
  }>;
  // @TODO - what does this map to
  userLevelConfigured?: boolean;
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
    dataType: string;
  };
  dataSource?: {
    component: {
      isPublic: boolean;
      key: string;
      version: number;
    };
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
      };
    }
  >;
  meta: {
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
  flows: Array<FlowObjectFromYAML>;
  configPages: Array<{
    elements: Array<{
      type: string;
      value: string;
    }>;
    name: string;
    tagline?: string;
    userLeveLConfigured: boolean;
  }>;
  requiredConfigVars: Array<ConfigVarObjectFromYAML>;
};