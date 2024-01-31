/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: IntegrationTranslation
// ====================================================
declare global {
  type Scalar_UUID = string;
  type Scalar_Date = string;
  type Scalar_DateTime = string;
  type Scalar_JSONString = string;
  type Scalar_JSONOrString = string;
  type Scalar_BigInt = number;
}

export interface IntegrationTranslation_requiredConfigVariables_nodes_inputs_nodes {
  __typename: "Expression";
  /**
   * The name of the Expression.
   */
  name: string;
  /**
   * An object that contains arbitrary meta data about an Expression.
   */
  meta: Scalar_JSONString | null;
}

export interface IntegrationTranslation_requiredConfigVariables_nodes_inputs {
  __typename: "ExpressionConnection";
  /**
   * List of nodes in this connection.
   */
  nodes: (IntegrationTranslation_requiredConfigVariables_nodes_inputs_nodes | null)[];
}

export interface IntegrationTranslation_requiredConfigVariables_nodes {
  __typename: "RequiredConfigVariable";
  /**
   * The Key for the Required Config Variable. Referred to as 'Name' in the UI.
   */
  key: string;
  /**
   * Additional notes about the Required Config Var.
   */
  description: string | null;
  /**
   * The collection of Expressions that serve as inputs to the RequiredConfigVariable.
   */
  inputs: IntegrationTranslation_requiredConfigVariables_nodes_inputs | null;
}

export interface IntegrationTranslation_requiredConfigVariables {
  __typename: "RequiredConfigVariableConnection";
  /**
   * List of nodes in this connection.
   */
  nodes: (IntegrationTranslation_requiredConfigVariables_nodes | null)[];
}

export interface IntegrationTranslation {
  __typename: "Integration";
  /**
   * The name of the Integration.
   */
  name: string;
  /**
   * Additional notes about the Integration.
   */
  description: string | null;
  /**
   * The YAML that is the declarative definition for the Integration. Suitable for using to re-import the Integration.
   */
  definition: string | null;
  /**
   * Specifies the category of the Integration.
   */
  category: string | null;
  /**
   * Specifies an Overview of the Integration to describe its functionality for use in the Integration Marketplace.
   */
  overview: string | null;
  requiredConfigVariables: IntegrationTranslation_requiredConfigVariables;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MarketplaceTranslations
// ====================================================

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_requiredConfigVariables_nodes_inputs_nodes {
  __typename: "Expression";
  /**
   * The name of the Expression.
   */
  name: string;
  /**
   * An object that contains arbitrary meta data about an Expression.
   */
  meta: Scalar_JSONString | null;
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_requiredConfigVariables_nodes_inputs {
  __typename: "ExpressionConnection";
  /**
   * List of nodes in this connection.
   */
  nodes: (MarketplaceTranslations_marketplaceIntegrations_nodes_requiredConfigVariables_nodes_inputs_nodes | null)[];
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_requiredConfigVariables_nodes {
  __typename: "RequiredConfigVariable";
  /**
   * The Key for the Required Config Variable. Referred to as 'Name' in the UI.
   */
  key: string;
  /**
   * Additional notes about the Required Config Var.
   */
  description: string | null;
  /**
   * The collection of Expressions that serve as inputs to the RequiredConfigVariable.
   */
  inputs: MarketplaceTranslations_marketplaceIntegrations_nodes_requiredConfigVariables_nodes_inputs | null;
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_requiredConfigVariables {
  __typename: "RequiredConfigVariableConnection";
  /**
   * List of nodes in this connection.
   */
  nodes: (MarketplaceTranslations_marketplaceIntegrations_nodes_requiredConfigVariables_nodes | null)[];
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration_requiredConfigVariables_nodes_inputs_nodes {
  __typename: "Expression";
  /**
   * The name of the Expression.
   */
  name: string;
  /**
   * An object that contains arbitrary meta data about an Expression.
   */
  meta: Scalar_JSONString | null;
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration_requiredConfigVariables_nodes_inputs {
  __typename: "ExpressionConnection";
  /**
   * List of nodes in this connection.
   */
  nodes: (MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration_requiredConfigVariables_nodes_inputs_nodes | null)[];
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration_requiredConfigVariables_nodes {
  __typename: "RequiredConfigVariable";
  /**
   * The Key for the Required Config Variable. Referred to as 'Name' in the UI.
   */
  key: string;
  /**
   * Additional notes about the Required Config Var.
   */
  description: string | null;
  /**
   * The collection of Expressions that serve as inputs to the RequiredConfigVariable.
   */
  inputs: MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration_requiredConfigVariables_nodes_inputs | null;
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration_requiredConfigVariables {
  __typename: "RequiredConfigVariableConnection";
  /**
   * List of nodes in this connection.
   */
  nodes: (MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration_requiredConfigVariables_nodes | null)[];
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration {
  __typename: "Integration";
  /**
   * The name of the Integration.
   */
  name: string;
  /**
   * Additional notes about the Integration.
   */
  description: string | null;
  /**
   * The YAML that is the declarative definition for the Integration. Suitable for using to re-import the Integration.
   */
  definition: string | null;
  /**
   * Specifies the category of the Integration.
   */
  category: string | null;
  /**
   * Specifies an Overview of the Integration to describe its functionality for use in the Integration Marketplace.
   */
  overview: string | null;
  requiredConfigVariables: MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration_requiredConfigVariables;
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes {
  __typename: "Instance";
  /**
   * The ID of the object
   */
  id: string;
  /**
   * The name of the Instance.
   */
  name: string;
  /**
   * The Integration that has been deployed for the Instance.
   */
  integration: MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes_integration;
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes_instances {
  __typename: "InstanceConnection";
  /**
   * List of nodes in this connection.
   */
  nodes: (MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes | null)[];
}

export interface MarketplaceTranslations_marketplaceIntegrations_nodes {
  __typename: "Integration";
  /**
   * The ID of the object
   */
  id: string;
  /**
   * The name of the Integration.
   */
  name: string;
  /**
   * Additional notes about the Integration.
   */
  description: string | null;
  /**
   * The YAML that is the declarative definition for the Integration. Suitable for using to re-import the Integration.
   */
  definition: string | null;
  /**
   * Specifies the category of the Integration.
   */
  category: string | null;
  /**
   * Specifies an Overview of the Integration to describe its functionality for use in the Integration Marketplace.
   */
  overview: string | null;
  requiredConfigVariables: MarketplaceTranslations_marketplaceIntegrations_nodes_requiredConfigVariables;
  /**
   * The Integration that has been deployed for the Instance.
   */
  instances: MarketplaceTranslations_marketplaceIntegrations_nodes_instances;
}

export interface MarketplaceTranslations_marketplaceIntegrations {
  __typename: "IntegrationConnection";
  /**
   * List of nodes in this connection.
   */
  nodes: (MarketplaceTranslations_marketplaceIntegrations_nodes | null)[];
}

export interface MarketplaceTranslations {
  /**
   *     Returns a Relay Connection to a collection of Integration objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  marketplaceIntegrations: MarketplaceTranslations_marketplaceIntegrations;
}

export interface IntegrationSchema {
  definitionVersion: 7;
  name: string;
  description: string;
  documentation?: string;
  category?: string;
  labels?: string[];
  requiredConfigVars?: RequiredConfigVar[];
  renameAttributes?: RenameIntegrationAttributes;
  endpointType?: EndpointTypeEnum;
  preprocessFlowName?: string;
  externalCustomerIdField?: SimpleInput;
  externalCustomerUserIdField?: SimpleInput;
  flowNameField?: SimpleInput;
  flows: Flow[];
  configPages?: ConfigPage[];
}

export interface Flow {
  name: string;
  description?: string;
  isSynchronous?: boolean;
  retryConfig?: RetryConfig;
  endpointSecurityType?: EndpointSecurityTypeEnum;
  organizationApiKeys?: string[];
  renameAttributes?: RenameFlowAttributes;
  steps: Step[];
}

export interface Step {
  action: ComponentKeySelector;
  name: string;
  description?: string;
  inputs?: Record<string, Input>;
  steps?: Step[];
  branches?: Branch[];
  credential?: string;
  isTrigger?: boolean;
  schedule?: Schedule;
  errorConfig?: ErrorConfig;
}

export interface ConfigPage {
  name: string;
  tagline?: string;
  userLevelConfigured?: boolean;
  elements: ConfigPageElement[];
}

export interface ConfigPageElement {
  type: ConfigPageElementTypeEnum;
  value: string;
}

export type Input = SimpleInput | ComplexInput;

export interface SimpleInput {
  name?: string;
  type: SimpleInputTypeEnum;
  value: string;
  meta?: object;
}

export interface ComplexInput {
  name?: string;
  type: ComplexInputTypeEnum;
  value: ComplexInputValue;
  meta?: object;
}

export type ComplexInputValue = Array<
  string | Input | ComplexInputValue | undefined
>;

export interface Branch {
  name: string;
  steps: Step[];
}

export interface Component {
  key: string;
  version: number;
  isPublic: boolean;
}

export interface ComponentKeySelector {
  component: Component;
  key: string;
}

export interface ConnectionComponentKeySelector extends ComponentKeySelector {
  template?: string;
}

export interface Schedule {
  type: SimpleInputTypeEnum;
  value: string;
  meta: {
    scheduleType: ScheduleTypeEnum;
    timeZone?: string;
  };
}

export interface ErrorConfig {
  errorHandlerType?: StepErrorHandlerTypeEnum;
  // Times 0-5
  maxAttempts?: number;
  // Seconds 0-60
  delaySeconds?: number;
  usesExponentialBackoff?: boolean;
  ignoreFinalError?: boolean;
}

export interface RenameIntegrationAttributes {
  requiredConfigVars?: RenameAttr[];
  flows?: RenameAttr[];
}

export interface RenameFlowAttributes {
  steps?: RenameAttr[];
}

export interface RenameAttr {
  oldName: string;
  newName: string;
}

export interface RetryConfig {
  // Times 1-3
  maxAttempts: number;
  // Spaced 0-60
  delayMinutes: number;
  usesExponentialBackoff: boolean;
  uniqueRequestIdField?: SimpleInput;
}

export interface DataSourceConfigVar extends DefaultRequiredConfigVar {
  dataSource: ComponentKeySelector;
  inputs?: Record<string, Input>;
}

export type RequiredConfigVar =
  | DefaultRequiredConfigVar
  | ConnectionConfigVar
  | DataSourceConfigVar;

export interface DefaultRequiredConfigVar {
  key: string;
  defaultValue?: string;
  header?: string;
  dataType?: Exclude<DefaultConfigVarDataTypeEnum, "connection">;
  pickList?: string[];
  scheduleType?: ScheduleTypeEnum;
  timeZone?: string;
  credentialTypes?: CredentialTypeEnum[];
  codeLanguage?: CodeLanguageEnum;
  description?: string;
  orgOnly?: boolean;
  collectionType?: CollectionTypeEnum;
  meta?: object;
}

export type SimpleInputTypeEnum =
  | "value"
  | "reference"
  | "configVar"
  | "template";
export type ComplexInputTypeEnum = "complex";

export interface ConnectionConfigVar {
  key: string;
  description?: string;
  // TODO: Post-kraken
  // Remove this
  header?: string;
  dataType?: Extract<DefaultConfigVarDataTypeEnum, "connection">;
  connection: ConnectionComponentKeySelector;
  inputs?: Record<string, Input>;
  orgOnly?: boolean;
  meta?: object;
}

export type ScheduleTypeEnum =
  | "none"
  | "custom"
  | "minute"
  | "hour"
  | "day"
  | "week";
export type ConfigVarDataTypeEnum =
  | "string"
  | "date"
  | "timestamp"
  | "picklist"
  | "schedule"
  | "code"
  | "credential"
  | "boolean";
export type DefaultConfigVarDataTypeEnum =
  | "string"
  | "date"
  | "timestamp"
  | "picklist"
  | "schedule"
  | "code"
  | "credential"
  | "boolean"
  | "number"
  // Backend schema does not include 'connection' or 'dataSource' as yml validation doesn't have the equivalent of Exclude/Extract
  | "connection"
  | "objectSelection"
  | "objectFieldMap"
  | "jsonForm";
export type DataSourceConfigVarDataTypeEnum = Exclude<
  DefaultConfigVarDataTypeEnum,
  "connection"
>;
export type CredentialTypeEnum =
  | "oauth2"
  | "basic"
  | "privateKey"
  | "apiKey"
  | "apiKeySecret"
  | "oauth2ClientCredentials";
export type CollectionTypeEnum = "valuelist" | "keyvaluelist";
export type CodeLanguageEnum = "json" | "xml" | "html";
export type EndpointTypeEnum =
  | "flow_specific"
  | "instance_specific"
  | "shared_instance";
export type StepErrorHandlerTypeEnum = "fail" | "ignore" | "retry";
export type ConfigPageElementTypeEnum =
  | "configVar"
  | "htmlElement"
  | "jsonForm";
export type EndpointSecurityTypeEnum =
  | "unsecured"
  | "customer_optional"
  | "customer_required"
  | "organization";

export interface JsonSchema4 {
  $ref?: string;
  /**
   * This is important because it tells refs where
   * the root of the document is located
   */
  id?: string;
  /**
   * It is recommended that the meta-schema is
   * included in the root of any JSON Schema
   */
  $schema?: string;
  /**
   * Title of the schema
   */
  title?: string;
  /**
   * Schema description
   */
  description?: string;
  /**
   * Default json for the object represented by
   * this schema
   */
  default?: any;
  /**
   * The value must be a multiple of the number
   * (e.g. 10 is a multiple of 5)
   */
  multipleOf?: number;
  maximum?: number;
  /**
   * If true maximum must be > value, >= otherwise
   */
  exclusiveMaximum?: boolean;
  minimum?: number;
  /**
   * If true minimum must be < value, <= otherwise
   */
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  /**
   * This is a regex string that the value must
   * conform to
   */
  pattern?: string;
  additionalItems?: boolean | JsonSchema4;
  items?: JsonSchema4 | JsonSchema4[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  additionalProperties?: boolean | JsonSchema4;
  /**
   * Holds simple JSON Schema definitions for
   * referencing from elsewhere.
   */
  definitions?: {
    [key: string]: JsonSchema4;
  };
  /**
   * The keys that can exist on the object with the
   * json schema that should validate their value
   */
  properties?: {
    [property: string]: JsonSchema4;
  };
  /**
   * The key of this object is a regex for which
   * properties the schema applies to
   */
  patternProperties?: {
    [pattern: string]: JsonSchema4;
  };
  /**
   * If the key is present as a property then the
   * string of properties must also be present.
   * If the value is a JSON Schema then it must
   * also be valid for the object if the key is
   * present.
   */
  dependencies?: {
    [key: string]: JsonSchema4 | string[];
  };
  /**
   * Enumerates the values that this schema can be
   * e.g.
   * {"type": "string",
   *  "enum": ["red", "green", "blue"]}
   */
  enum?: any[];
  /**
   * The basic type of this schema, can be one of
   * [string, number, object, array, boolean, null]
   * or an array of the acceptable types
   */
  type?: string | string[];
  allOf?: JsonSchema4[];
  anyOf?: JsonSchema4[];
  oneOf?: JsonSchema4[];
  /**
   * The entity being validated must not match this schema
   */
  not?: JsonSchema4;
  format?: string;
  const?: any;
}

export interface JsonSchema7 {
  $ref?: string;
  /**
   * This is important because it tells refs where
   * the root of the document is located
   */
  $id?: string;
  /**
   * It is recommended that the meta-schema is
   * included in the root of any JSON Schema
   */
  $schema?: string;
  /**
   * Title of the schema
   */
  title?: string;
  /**
   * Schema description
   */
  description?: string;
  /**
   * Default json for the object represented by
   * this schema
   */
  default?: any;
  /**
   * The value must be a multiple of the number
   * (e.g. 10 is a multiple of 5)
   */
  multipleOf?: number;
  maximum?: number;
  /**
   * If true maximum must be > value, >= otherwise
   */
  exclusiveMaximum?: number;
  minimum?: number;
  /**
   * If true minimum must be < value, <= otherwise
   */
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  /**
   * This is a regex string that the value must
   * conform to
   */
  pattern?: string;
  additionalItems?: boolean | JsonSchema7;
  items?: JsonSchema7 | JsonSchema7[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  additionalProperties?: boolean | JsonSchema7;
  /**
   * Holds simple JSON Schema definitions for
   * referencing from elsewhere.
   */
  definitions?: {
    [key: string]: JsonSchema7;
  };
  /**
   * The keys that can exist on the object with the
   * json schema that should validate their value
   */
  properties?: {
    [property: string]: JsonSchema7;
  };
  /**
   * The key of this object is a regex for which
   * properties the schema applies to
   */
  patternProperties?: {
    [pattern: string]: JsonSchema7;
  };
  /**
   * If the key is present as a property then the
   * string of properties must also be present.
   * If the value is a JSON Schema then it must
   * also be valid for the object if the key is
   * present.
   */
  dependencies?: {
    [key: string]: JsonSchema7 | string[];
  };
  /**
   * Enumerates the values that this schema can be
   * e.g.
   * {"type": "string",
   *  "enum": ["red", "green", "blue"]}
   */
  enum?: any[];
  /**
   * The basic type of this schema, can be one of
   * [string, number, object, array, boolean, null]
   * or an array of the acceptable types
   */
  type?: string | string[];
  allOf?: JsonSchema7[];
  anyOf?: JsonSchema7[];
  oneOf?: JsonSchema7[];
  /**
   * The entity being validated must not match this schema
   */
  not?: JsonSchema7;
  format?: string;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: any[];
  contains?: JsonSchema7;
  propertyNames?: JsonSchema7;
  const?: any;
  if?: JsonSchema7;
  then?: JsonSchema7;
  else?: JsonSchema7;
  errorMessage?: any;
}

export declare type JsonSchema = JsonSchema4 | JsonSchema7;
