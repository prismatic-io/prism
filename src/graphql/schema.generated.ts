export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  BigInt: { input: any; output: any };
  Date: { input: any; output: any };
  DateTime: { input: any; output: any };
  JSONOrString: { input: any; output: any };
  JSONString: { input: any; output: any };
  UUID: { input: any; output: any };
};

export enum ActionDataSourceType {
  /** Boolean */
  Boolean = "BOOLEAN",
  /** Code */
  Code = "CODE",
  /** Connection */
  Connection = "CONNECTION",
  /** Credential */
  Credential = "CREDENTIAL",
  /** Date */
  Date = "DATE",
  /** Jsonform */
  Jsonform = "JSONFORM",
  /** Number */
  Number = "NUMBER",
  /** Objectfieldmap */
  Objectfieldmap = "OBJECTFIELDMAP",
  /** Objectselection */
  Objectselection = "OBJECTSELECTION",
  /** Picklist */
  Picklist = "PICKLIST",
  /** Schedule */
  Schedule = "SCHEDULE",
  /** String */
  String = "STRING",
  /** Timestamp */
  Timestamp = "TIMESTAMP",
}

/** Represents a collection of data that defines a Component Action. */
export type ActionDefinitionInput = {
  /** Specifies whether the Action will allow Conditional Branching. */
  allowsBranching?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies how the Action handles Authorization. */
  authorization?: InputMaybe<AuthorizationDefinition>;
  /** Specifies whether an Action will break out of a loop. */
  breakLoop?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether the Action can call other Component Actions, Data Sources, or Triggers. */
  canCallComponentFunctions?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies how the Component Action is displayed. */
  display: ActionDisplayDefinition;
  /** The input associated with dynamic branching. */
  dynamicBranchInput?: InputMaybe<Scalars["String"]["input"]>;
  /** An example of the returned payload of an Action. */
  examplePayload?: InputMaybe<Scalars["JSONString"]["input"]>;
  /** The InputFields supported by the Component Action. */
  inputs: Array<InputMaybe<InputFieldDefinition>>;
  /** A string which uniquely identifies the Action in the context of the Component. */
  key: Scalars["String"]["input"];
  /** The static branch names associated with an Action. */
  staticBranchNames?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** Specifies whether the Action will terminate Instance execution. */
  terminateExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Represents a collection of data that defines how a Component Action is displayed. */
export type ActionDisplayDefinition = {
  /** The category of the Component. */
  category?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Component. */
  description: Scalars["String"]["input"];
  /** Notes which may provide insight on the intended use of the Action. */
  directions?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether the Action is important and/or commonly used. */
  important?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The name of the Component. */
  label: Scalars["String"]["input"];
};

/** Allows specifying which field and direction to order by. */
export type ActionOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ActionOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ActionOrderField {
  IsCommonTrigger = "IS_COMMON_TRIGGER",
  IsDataSource = "IS_DATA_SOURCE",
  IsPollingTrigger = "IS_POLLING_TRIGGER",
  IsTrigger = "IS_TRIGGER",
  Label = "LABEL",
}

export enum ActionScheduleSupport {
  /** Invalid */
  Invalid = "INVALID",
  /** Required */
  Required = "REQUIRED",
  /** Valid */
  Valid = "VALID",
}

export enum ActionSynchronousResponseSupport {
  /** Invalid */
  Invalid = "INVALID",
  /** Required */
  Required = "REQUIRED",
  /** Valid */
  Valid = "VALID",
}

/** Allows specifying which field and direction to order by. */
export type ActivityOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ActivityOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ActivityOrderField {
  Timestamp = "TIMESTAMP",
}

export type AdministerObjectPermissionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether to grant or revoke the specified Permission. */
  grant: Scalars["Boolean"]["input"];
  /** The ID of the User to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The object for which the specified Permission is being granted. */
  object: Scalars["ID"]["input"];
  /** The Permission to grant for the specified object. */
  permission: Scalars["ID"]["input"];
};

export enum AggregateDeploymentStatus {
  Activated = "ACTIVATED",
  Paused = "PAUSED",
  Unconfigured = "UNCONFIGURED",
}

/** Allows specifying which field and direction to order by. */
export type AlertEventOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertEventOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertEventOrderField {
  CreatedAt = "CREATED_AT",
  Customer = "CUSTOMER",
  Details = "DETAILS",
  FlowConfig = "FLOW_CONFIG",
  Instance = "INSTANCE",
  Integration = "INTEGRATION",
  Monitor = "MONITOR",
  Triggers = "TRIGGERS",
}

/** Allows specifying which field and direction to order by. */
export type AlertGroupOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertGroupOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertGroupOrderField {
  CreatedAt = "CREATED_AT",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}

/** Allows specifying which field and direction to order by. */
export type AlertMonitorOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertMonitorOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertMonitorOrderField {
  CreatedAt = "CREATED_AT",
  Customer = "CUSTOMER",
  FlowConfig = "FLOW_CONFIG",
  FlowConfigFlow = "FLOW_CONFIG__FLOW",
  Instance = "INSTANCE",
  Integration = "INTEGRATION",
  LastTriggeredAt = "LAST_TRIGGERED_AT",
  Name = "NAME",
  Triggered = "TRIGGERED",
  Triggers = "TRIGGERS",
  UpdatedAt = "UPDATED_AT",
}

/** Allows specifying which field and direction to order by. */
export type AlertTriggerOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertTriggerOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertTriggerOrderField {
  Name = "NAME",
}

/** Allows specifying which field and direction to order by. */
export type AlertWebhookOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AlertWebhookOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AlertWebhookOrderField {
  CreatedAt = "CREATED_AT",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
  Url = "URL",
}

/** Represents the collection of data that defines an Attachment. */
export type AttachmentInput = {
  /** The name of the Attachment. */
  name: Scalars["String"]["input"];
  /** The URL where the Attachment is located. */
  url: Scalars["String"]["input"];
};

/** Represents the collection of data that allows renaming an Attachment. */
export type AttachmentRenameInput = {
  /** The new name for the Attachment. */
  name: Scalars["String"]["input"];
  /** The old name of the Attachment. */
  oldName: Scalars["String"]["input"];
  /** The URL where the Attachment is located. */
  url: Scalars["String"]["input"];
};

/** Allows specifying which field and direction to order by. */
export type AuthObjectTypeOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: AuthObjectTypeOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum AuthObjectTypeOrderField {
  Name = "NAME",
}

/** Represents authorization details for a Component. */
export type AuthorizationDefinition = {
  /** The list of authorization methods supported by the Component. */
  methods: Array<InputMaybe<Scalars["String"]["input"]>>;
  /** Specifies whether authorization is required for the Component. */
  required: Scalars["Boolean"]["input"];
};

export type BulkDisableInstancesUsingConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ScopedConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type BulkDisableInstancesUsingCustomerConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type BulkUpdateInstancesToLatestIntegrationVersionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ChangePasswordInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The current password. */
  currentPassword: Scalars["String"]["input"];
  /** The new password. */
  newPassword: Scalars["String"]["input"];
};

export type ClearAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertMonitor to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ClearAllFifoDataInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceFlowConfig to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ClearFifoWorkingSetInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceFlowConfig to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

/** Represents a collection of data that defines a Component. */
export type ComponentDefinitionInput = {
  /** Specifies how the Component handles Authorization. */
  authorization?: InputMaybe<AuthorizationDefinition>;
  /** Specifies how the Component is displayed. */
  display: ComponentDisplayDefinition;
  /** The URL that specifies where the Component documentation exists. */
  documentationUrl?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether the Component is for a Code Native Integration. */
  forCodeNativeIntegration?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** A string that uniquely identifies the Component. */
  key: Scalars["String"]["input"];
  /** Specifies whether the Component is publicly available or whether it's private to the Organization. */
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** This field has been deprecated. */
  version?: InputMaybe<Scalars["String"]["input"]>;
};

/** Represents a collection of data that defines how a Component is displayed. */
export type ComponentDisplayDefinition = {
  /** The category of the Component. */
  category?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Component. */
  description: Scalars["String"]["input"];
  /** The URL that specifies where the Component icon exists. */
  iconPath?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the Component. */
  label: Scalars["String"]["input"];
};

/** Allows specifying which field and direction to order by. */
export type ComponentOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ComponentOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ComponentOrderField {
  Category = "CATEGORY",
  Customer = "CUSTOMER",
  Description = "DESCRIPTION",
  Label = "LABEL",
  VersionCreatedAt = "VERSION_CREATED_AT",
  VersionNumber = "VERSION_NUMBER",
}

/** Represents a collection of data that references a Component. */
export type ComponentSelector = {
  /** Specifies whether the Component is publicly available or whether it's private to the Organization. */
  isPublic: Scalars["Boolean"]["input"];
  /** A string that uniquely identifies the Component. */
  key: Scalars["String"]["input"];
  /** The version of the Component */
  version?: InputMaybe<Scalars["String"]["input"]>;
};

/** Represents a collection of data that defines a Component Connection. */
export type ConnectionDefinitionInput = {
  /** Optional path to the avatar icon for this Connection. */
  avatarIconPath?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Connection. */
  comments?: InputMaybe<Scalars["String"]["input"]>;
  /** Optional path to the connect icon for this Connection. */
  iconPath?: InputMaybe<Scalars["String"]["input"]>;
  /** Inputs for this Connection. */
  inputs?: InputMaybe<Array<InputMaybe<ConnectionInputFieldDefinition>>>;
  /** A string which uniquely identifies the Connection in the context of the Component. */
  key: Scalars["String"]["input"];
  /** The name of the Connection. */
  label: Scalars["String"]["input"];
  /** Metadata to support bespoke OAuth2 flow behaviors for this Connection. */
  oauth2Config?: InputMaybe<ConnectionOAuth2Configuration>;
  /** Type of OAuth2 PKCE method, if any. */
  oauth2PkceMethod?: InputMaybe<Scalars["String"]["input"]>;
  /** Type of OAuth2 connection, if any. */
  oauth2Type?: InputMaybe<Scalars["String"]["input"]>;
};

/** Represents an input field for a Connection. */
export type ConnectionInputFieldDefinition = {
  /** Specifies the type of collection to use for storing input values, if applicable. */
  collection?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the InputField. */
  comments?: InputMaybe<Scalars["String"]["input"]>;
  /** If present, the related Data Source capable of supplying a value to this InputField. */
  dataSource?: InputMaybe<Scalars["String"]["input"]>;
  /** The default value for the InputField. */
  default?: InputMaybe<Scalars["JSONOrString"]["input"]>;
  /** An example valid input for this InputField. */
  example?: InputMaybe<Scalars["String"]["input"]>;
  /** A string which uniquely identifies the InputField in the context of the Action. */
  key: Scalars["String"]["input"];
  /** Label used for the Keys of a 'keyvaluelist' collection. */
  keyLabel?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the InputField. */
  label: Scalars["String"]["input"];
  /** Language to use for the Code Field. */
  language?: InputMaybe<Scalars["String"]["input"]>;
  /** Dictates how possible choices are provided for this InputField. */
  model?: InputMaybe<Array<InputMaybe<InputFieldChoice>>>;
  /** Whether or not the field is controlled by the attached On-Prem Resource. */
  onPremiseControlled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Placeholder text that will appear in the InputField UI. */
  placeholder?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether the InputField is required by the Action. */
  required?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Whether or not the field is shown to Integrators and Deployers. Field must have a default is this is `false`. */
  shown?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies the type of data the InputField handles. */
  type: Scalars["String"]["input"];
};

/** Represents metadata to support bespoke OAuth2 flow behaviors for a Component Connection. */
export type ConnectionOAuth2Configuration = {
  /** A list of allowed parameter keys to pass between the authorize response and the token request. */
  allowedTokenParams?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** An optional override for the grant_type of an OAuth2 flow. */
  overrideGrantType?: InputMaybe<Scalars["String"]["input"]>;
};

export enum ConnectionOauth2Type {
  /** Authorization Code */
  AuthorizationCode = "AUTHORIZATION_CODE",
  /** Client Credentials */
  ClientCredentials = "CLIENT_CREDENTIALS",
}

/** Allows specifying which field and direction to order by. */
export type ConnectionOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ConnectionOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ConnectionOrderField {
  Key = "KEY",
  Label = "LABEL",
  Order = "ORDER",
}

/** Represents a single preset input for a ConnectionTemplate */
export type ConnectionTemplateField = {
  /** The key of an InputField that the value is associated with. */
  key: Scalars["String"]["input"];
  /** The preset value of the field. */
  value: Scalars["String"]["input"];
};

/** Allows specifying which field and direction to order by. */
export type ConnectionTemplateOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ConnectionTemplateOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ConnectionTemplateOrderField {
  Name = "NAME",
}

export type ConvertLowCodeIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Whether to include inline comments in the generated code. */
  includeComments?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The registry prefix to use for the converted integration. */
  registryPrefix?: InputMaybe<Scalars["String"]["input"]>;
  /** The registry URL to use for the converted integration. */
  registryUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateAlertGroupInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the AlertGroup */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The users in the AlertGroup. */
  users?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  /** The AlertWebhooks in the AlertGroup */
  webhooks?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
};

export type CreateAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The execution duration condition to monitor for relevant AlertTrigger types. */
  durationSecondsCondition?: InputMaybe<Scalars["Int"]["input"]>;
  /** The execution overdue condition to monitor for relevant AlertTrigger types. */
  executionOverdueMinutesCondition?: InputMaybe<Scalars["Int"]["input"]>;
  /** The IntegrationFlow that is being monitored by the AlertMonitor. */
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  /** The AlertGroups to notify when the AlertMonitor is triggered. */
  groups?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  /** The Instance that is being monitored by the AlertMonitor. */
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  /** The log severity level condition to monitor for relevant AlertTrigger types. */
  logSeverityLevelCondition?: InputMaybe<Scalars["Int"]["input"]>;
  /** The name of the AlertMonitor. */
  name: Scalars["String"]["input"];
  /** The AlertTriggers that are setup to trigger the AlertMonitor. */
  triggers?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  /** The Users to notify when the AlertMonitor is triggered. */
  users?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  /** The AlertWebhooks to call when the AlertMonitor is triggered. */
  webhooks?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
};

export type CreateAlertWebhookInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** A JSON string of key/value pairs that will be sent as headers in the Webhook request. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the AlertWebhook. */
  name: Scalars["String"]["input"];
  /** The template that is hydrated and then used as the body of the AlertWebhook request. */
  payloadTemplate: Scalars["String"]["input"];
  /** The URL of the AlertWebhook. */
  url: Scalars["String"]["input"];
};

export type CreateConnectionTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Connection from which this template is structured. */
  connection: Scalars["ID"]["input"];
  /** The name of this template. */
  name: Scalars["String"]["input"];
  /** The input presets associated with this template. */
  presets: Array<InputMaybe<ConnectionTemplateField>>;
};

export type CreateCustomerConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer with which this Config Variable is associated. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** The collection of Expressions that serve as inputs to this variable. */
  inputs?: InputMaybe<Array<InputMaybe<InputExpression>>>;
  /** Specifies whether this Config Variable is meant for testing. */
  isTest?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The display name of this variable. */
  key?: InputMaybe<Scalars["String"]["input"]>;
  /** The Scoped Config Variable with which this Config Variable is associated. */
  scopedConfigVariable: Scalars["ID"]["input"];
};

export type CreateCustomerCredentialInput = {
  /** The specific AuthorizationMethod used by the Credential. */
  authorizationMethod: Scalars["ID"]["input"];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer the Credential belongs to, if any. If NULL then Organization will be specified. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name of the Credential. */
  label: Scalars["String"]["input"];
  /** A list of InputCredentialFieldValues that contain the values for the CredentialFields. */
  values?: InputMaybe<Array<InputMaybe<InputCredentialFieldValue>>>;
};

export type CreateCustomerInput = {
  /** Specifies whether this Customer can use the Embedded Designer. */
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Customer can use the Workflow Copilot. */
  allowWorkflowCopilot?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The maximum number of concurrent executions allowed for this Customer. If null, no Customer-specific limit is enforced. */
  concurrentExecutionLimit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Additional notes about the Customer. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** The name of the Customer, which must be unique within the scope of its Organization. */
  name: Scalars["String"]["input"];
};

export type CreateCustomerUserInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer the user belongs to, if any. If this is NULL then Organization will be specified. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** The email address associated with the User. */
  email: Scalars["String"]["input"];
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  /** The user's preferred name. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The preferred contact phone number for the User. */
  phone?: InputMaybe<Scalars["String"]["input"]>;
  role: Scalars["ID"]["input"];
};

export type CreateExternalLogStreamInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** A JSON string of key/value pairs that will be sent as headers in the ExternalLogStream request. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** Name of the ExternalLogStream. */
  name: Scalars["String"]["input"];
  /** The template that is hydrated and then used as the body of the ExternalLogStream request. */
  payloadTemplate: Scalars["String"]["input"];
  /** The Log severity levels for which Logs should be sent to the ExternalLogStream. */
  severityLevels: Array<InputMaybe<LogSeverityLevelInput>>;
  /** The URL of the ExternalLogStream. */
  url: Scalars["String"]["input"];
};

export type CreateInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Desired configuration mode. */
  configMode?: InputMaybe<Scalars["String"]["input"]>;
  /** Config variable values that are associated with the Instance. */
  configVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>>>;
  /** The Customer for which the Instance is deployed. */
  customer: Scalars["ID"]["input"];
  /** Additional notes about the Instance. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration data for each IntegrationFlow that is associated with the Instance. */
  flowConfigs?: InputMaybe<Array<InputMaybe<InputInstanceFlowConfig>>>;
  /** The Integration that has been deployed for the Instance. */
  integration: Scalars["ID"]["input"];
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** DEPRECATED: Use Instance Profiles to configure logs_disabled instead. */
  logsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The name of the Instance. */
  name: Scalars["String"]["input"];
  /** DEPRECATED: Use Instance Profiles to configure step_results_disabled instead. */
  stepResultsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CreateInstanceProfileInput = {
  /** The amount of memory allocated to the Instance Runner Lambda function. */
  allocatedMemoryMb?: InputMaybe<Scalars["Int"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Instance Profile. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** The instance to create an override for (required for instance-scope). */
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  /** The billing type for the Instances that use this Instance Profile. */
  instanceBillingType?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether this Instance Profile is the default used when no Instance Profile is explicitly specified during Instance creation. */
  isDefaultProfile?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to disable the creation of logs during Instance execution. */
  logsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The name of the Instance Profile, which must be unique within the scope of its Organization. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** DEPRECATED: Use quick_start_instances instead. Whether instances using this profile will startup faster when triggered. */
  quickStart?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The number of QuickStart runners reserved for instances using this profile. */
  quickStartInstances?: InputMaybe<Scalars["Int"]["input"]>;
  /** The scope of this profile (org or instance). */
  scope?: InputMaybe<InstanceProfileScope>;
  /** A stable key for referencing this profile from Integration definitions. Cannot be changed after creation. */
  stableKey?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether to disable the creation of step results during Instance execution. */
  stepResultsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CreateIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** The YAML serialized definition of the Integration to import. */
  definition?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Integration. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Content type of the payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestContentType?: InputMaybe<Scalars["String"]["input"]>;
  /** A JSON string of key/value pairs that will be sent as headers when testing the endpoint configuration for this Integration. */
  endpointConfigTestHeaders?: InputMaybe<Scalars["String"]["input"]>;
  /** Data payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestPayload?: InputMaybe<Scalars["String"]["input"]>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** A JSON string that represents metadata for the Integration. */
  metadata?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the Integration. */
  name: Scalars["String"]["input"];
};

export type CreateOnPremiseResourceJwtInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer associated with this resource. */
  customerId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Set to true to register an On-Prem Resource only available to Organization users. Only valid for Organization users. */
  orgOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** An optional ID of an existing On-Prem Resource for which to generate a new JWT. */
  resourceId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type CreateOrganizationCredentialInput = {
  /** The specific AuthorizationMethod used by the Credential. */
  authorizationMethod: Scalars["ID"]["input"];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the Credential. */
  label: Scalars["String"]["input"];
  /** A list of InputCredentialFieldValues that contain the values for the CredentialFields. */
  values?: InputMaybe<Array<InputMaybe<InputCredentialFieldValue>>>;
};

export type CreateOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateOrganizationUserInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The email address associated with the User. */
  email: Scalars["String"]["input"];
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  /** The user's preferred name. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The preferred contact phone number for the User. */
  phone?: InputMaybe<Scalars["String"]["input"]>;
  /** The Role to associate with the User. */
  role: Scalars["ID"]["input"];
};

export type CreateScopedConfigVariableInput = {
  /** Whether or not this variable is used in build-only connections */
  buildOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Connection to which this variable is associated. */
  connection?: InputMaybe<Scalars["ID"]["input"]>;
  /** The Customer with which this Config Variable is associated. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** Additional notes about the Scoped Config Variable. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** The collection of Expressions that serve as inputs to this variable. */
  inputs?: InputMaybe<Array<InputMaybe<InputExpression>>>;
  /** The display name of this variable. */
  key: Scalars["String"]["input"];
  /** Enforces which group of users can modify the variable. */
  managedBy?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration for OAuth redirects. */
  oAuthRedirectConfig?: InputMaybe<OAuthRedirectConfigInput>;
  parent?: InputMaybe<Scalars["ID"]["input"]>;
  /** The stable key for referencing this variable from Integrations. Cannot change after setting. */
  stableKey: Scalars["String"]["input"];
  /** Specifies the scope of the variable. */
  variableScope: Scalars["String"]["input"];
};

export type CreateTestCaseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Content type of the test payload. */
  contentType?: InputMaybe<Scalars["String"]["input"]>;
  /** The IntegrationFlow this TestCase belongs to. */
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  /** Test headers as key/value pairs. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The Integration this TestCase belongs to. */
  integration: Scalars["ID"]["input"];
  /** The name of the TestCase. */
  name: Scalars["String"]["input"];
  /** Test step payload data. */
  payload?: InputMaybe<Scalars["String"]["input"]>;
  /** Test step result data. */
  result?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateUserLevelConfigInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Instance with which the User Level Config is associated. */
  instance: Scalars["ID"]["input"];
};

export type CreateWebhookEndpointInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about this webhook endpoint configuration. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Whether this webhook endpoint is currently enabled. Disabled endpoints will not receive events. */
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** List of event types to subscribe to. */
  eventTypes: Array<InputMaybe<Scalars["String"]["input"]>>;
  /** A JSON object of key/value pairs that will be sent as headers with each webhook request. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** Friendly name for the webhook endpoint. */
  name: Scalars["String"]["input"];
  /** Secret key used for HMAC signature generation. If provided, all webhook payloads will include an X-Webhook-Signature header. */
  secret?: InputMaybe<Scalars["String"]["input"]>;
  /** The URL where webhook events will be sent. */
  url: Scalars["String"]["input"];
};

export enum CredentialFieldType {
  /** keyvalue */
  Keyvalue = "KEYVALUE",
  /** password */
  Password = "PASSWORD",
  /** string */
  String = "STRING",
  /** text */
  Text = "TEXT",
}

/** Allows specifying which field and direction to order by. */
export type CredentialOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: CredentialOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum CredentialOrderField {
  AuthorizationMethod = "AUTHORIZATION_METHOD",
  Customer = "CUSTOMER",
  Label = "LABEL",
}

/** Allows specifying which field and direction to order by. */
export type CustomerConfigVariableOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: CustomerConfigVariableOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum CustomerConfigVariableOrderField {
  ComponentLabel = "COMPONENT_LABEL",
  CreatedAt = "CREATED_AT",
  Key = "KEY",
  LastConfiguredAt = "LAST_CONFIGURED_AT",
  Status = "STATUS",
  UpdatedAt = "UPDATED_AT",
}

export enum CustomerConfigVariableStatus {
  /** active */
  Active = "ACTIVE",
  /** error */
  Error = "ERROR",
  /** failed */
  Failed = "FAILED",
  /** pending */
  Pending = "PENDING",
}

/** Allows specifying which field and direction to order by. */
export type CustomerOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: CustomerOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum CustomerOrderField {
  ConcurrencyRejections = "CONCURRENCY_REJECTIONS",
  ConcurrentExecutionLimit = "CONCURRENT_EXECUTION_LIMIT",
  CreatedAt = "CREATED_AT",
  Description = "DESCRIPTION",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}

/** Allows specifying which field and direction to order by. */
export type CustomerTotalUsageMetricsOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: CustomerTotalUsageMetricsOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum CustomerTotalUsageMetricsOrderField {
  SnapshotTime = "SNAPSHOT_TIME",
}

/** Represents a collection of data that defines a Component Data Source. */
export type DataSourceDefinitionInput = {
  /** Specifies how the Data Source handles Authorization. */
  authorization?: InputMaybe<AuthorizationDefinition>;
  /** Specifies whether the Data Source can call other Component Actions, Data Sources, or Triggers. */
  canCallComponentFunctions?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The type of the resulting data from the Data Source. */
  dataSourceType: Scalars["String"]["input"];
  /** Specifies the key of a Data Source in this Component which can provide additional details about the content for this Data Source, such as example values when selecting particular API object fields. */
  detailDataSource?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies how the Data Source is displayed. */
  display: ActionDisplayDefinition;
  /** An example of the returned payload of an Data Source. */
  examplePayload?: InputMaybe<Scalars["JSONString"]["input"]>;
  /** The InputFields supported by the Data Source. */
  inputs: Array<InputMaybe<InputFieldDefinition>>;
  /** A string which uniquely identifies the Data Source in the context of the Component. */
  key: Scalars["String"]["input"];
};

/** Enum representing the format of definition output. */
export enum DefinitionType {
  Integration = "INTEGRATION",
  Workflow = "WORKFLOW",
}

export type DeleteAlertGroupInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertGroup to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertMonitor to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteAlertWebhookInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertWebhook to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteComponentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Component to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteConnectionTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ConnectionTemplate to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteCredentialInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Credential to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteCustomerConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteCustomerInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Customer to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteExternalLogStreamInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ExternalLogStream to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteInstanceProfileInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceProfile to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteIntegrationTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WorkflowTemplate to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteOnPremiseResourceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the OnPremiseResource to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteOrganizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Organization to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the OrganizationSigningKey to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteScopedConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ScopedConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteTestCaseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the TestCase to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteUserInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the User to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteUserLevelConfigInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the UserLevelConfig to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteWebhookEndpointInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WebhookEndpoint to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteWorkflowTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WorkflowTemplate to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeployInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** When true, will deploy the instance, ignoring certain validation rules that would normally prevent deployment. */
  force?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export enum DeployedInstancesQuantity {
  Multiple = "MULTIPLE",
  One = "ONE",
  Zero = "ZERO",
}

export type DisableWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisconnectConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisconnectCustomerConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisconnectScopedConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ScopedConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisconnectUserLevelConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the UserLevelConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type EnableWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

/** Enum representing reasons why an integration cannot be enabled. */
export enum EnablementBlocker {
  ReferencesDeletedConnection = "REFERENCES_DELETED_CONNECTION",
}

export type ExecutionInvokedByInput = {
  /** ID of the invoking execution. */
  id: Scalars["ID"]["input"];
  /** The timestamp at which the invoking execution started. */
  startedAt: Scalars["DateTime"]["input"];
};

export enum ExecutionStatus {
  Error = "ERROR",
  Pending = "PENDING",
  Queued = "QUEUED",
  Success = "SUCCESS",
}

export enum ExpressionType {
  Complex = "COMPLEX",
  Configvar = "CONFIGVAR",
  Reference = "REFERENCE",
  Template = "TEMPLATE",
  Value = "VALUE",
}

/** Allows specifying which field and direction to order by. */
export type ExternalLogStreamOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ExternalLogStreamOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ExternalLogStreamOrderField {
  CreatedAt = "CREATED_AT",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}

export type FetchConfigWizardPageContentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name of the Configuration Page for which content should be fetched. */
  pageName?: InputMaybe<Scalars["String"]["input"]>;
};

export type FetchDataSourceContentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Data Source for which content should be fetched. */
  dataSource?: InputMaybe<Scalars["ID"]["input"]>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Input values for the specified Data Source. */
  inputs?: InputMaybe<Array<InputMaybe<InputExpression>>>;
};

export type ForkIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Integration. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the Integration. */
  name: Scalars["String"]["input"];
  /** Parent Integration this Integration was forked from, if any */
  parent: Scalars["ID"]["input"];
};

export type GenerateEmbeddedDemoJwtInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
};

export type ImportIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** The YAML serialized definition of the Integration to import. */
  definition: Scalars["String"]["input"];
  /** The ID of the Integration being imported. */
  integrationId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Allows for replacing an existing low-code integration or CNI with one of the opposite type. */
  replace?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type ImportIntegrationTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The YAML serialized definition of the IntegrationTemplate. */
  definition: Scalars["String"]["input"];
};

export type ImportOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Public key of the Signing Keypair. */
  publicKey: Scalars["String"]["input"];
};

export type ImportWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** The YAML serialized definition of the Workflow to import. */
  definition: Scalars["String"]["input"];
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

/** Represents a specific value of a CredentialField. */
export type InputCredentialFieldValue = {
  /** The name associated with the CredentialField. */
  key: Scalars["String"]["input"];
  /** The value of the CredentialField. */
  value?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * Represents an expression that is used to reference Configuration
 * Variables and results from previous steps.
 */
export type InputExpression = {
  meta?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the Expression. */
  name: Scalars["String"]["input"];
  /** The type of the Expression. */
  type?: InputMaybe<Scalars["String"]["input"]>;
  /** The value of the Expression. */
  value?: InputMaybe<Scalars["String"]["input"]>;
};

/** Represents a choice for an InputField. */
export type InputFieldChoice = {
  /** The label to display for the choice. */
  label: Scalars["String"]["input"];
  /** The value of the choice. */
  value: Scalars["String"]["input"];
};

export enum InputFieldCollection {
  /** keyvaluelist */
  Keyvaluelist = "KEYVALUELIST",
  /** valuelist */
  Valuelist = "VALUELIST",
}

/** Represents an input field for a Component Action. */
export type InputFieldDefinition = {
  /** Specifies the type of collection to use for storing input values, if applicable. */
  collection?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the InputField. */
  comments?: InputMaybe<Scalars["String"]["input"]>;
  /** If present, the related Data Source capable of supplying a value to this InputField. */
  dataSource?: InputMaybe<Scalars["String"]["input"]>;
  /** The default value for the InputField. */
  default?: InputMaybe<Scalars["JSONOrString"]["input"]>;
  /** An example valid input for this InputField. */
  example?: InputMaybe<Scalars["String"]["input"]>;
  /** A string which uniquely identifies the InputField in the context of the Action. */
  key: Scalars["String"]["input"];
  /** Label used for the Keys of a 'keyvaluelist' collection. */
  keyLabel?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the InputField. */
  label: Scalars["String"]["input"];
  /** Language to use for the Code Field. */
  language?: InputMaybe<Scalars["String"]["input"]>;
  /** Dictates how possible choices are provided for this InputField. */
  model?: InputMaybe<Array<InputMaybe<InputFieldChoice>>>;
  /** Placeholder text that will appear in the InputField UI. */
  placeholder?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether the InputField is required by the Action. */
  required?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies the type of data the InputField handles. */
  type: Scalars["String"]["input"];
};

export enum InputFieldType {
  /** boolean */
  Boolean = "BOOLEAN",
  /** code */
  Code = "CODE",
  /** conditional */
  Conditional = "CONDITIONAL",
  /** connection */
  Connection = "CONNECTION",
  /** data */
  Data = "DATA",
  /** date */
  Date = "DATE",
  /** dynamicFieldSelection */
  Dynamicfieldselection = "DYNAMICFIELDSELECTION",
  /** dynamicObjectSelection */
  Dynamicobjectselection = "DYNAMICOBJECTSELECTION",
  /** flow */
  Flow = "FLOW",
  /** jsonForm */
  Jsonform = "JSONFORM",
  /** objectFieldMap */
  Objectfieldmap = "OBJECTFIELDMAP",
  /** objectSelection */
  Objectselection = "OBJECTSELECTION",
  /** password */
  Password = "PASSWORD",
  /** string */
  String = "STRING",
  /** template */
  Template = "TEMPLATE",
  /** text */
  Text = "TEXT",
  /** timestamp */
  Timestamp = "TIMESTAMP",
}

export type InputInstanceConfigVariable = {
  customerConfigVariableId?: InputMaybe<Scalars["ID"]["input"]>;
  /** The key of the Required Config Var of the Integration for which a value is being provided. */
  key: Scalars["String"]["input"];
  onPremiseResourceId?: InputMaybe<Scalars["ID"]["input"]>;
  /** The schedule type for the specified Required Config Var of the Integration. */
  scheduleType?: InputMaybe<Scalars["String"]["input"]>;
  /** The timezone for the specified Required Config Var of the Integration. */
  timeZone?: InputMaybe<Scalars["String"]["input"]>;
  /** The value to provide for the specified Required Config Var of the Integration. */
  value?: InputMaybe<Scalars["String"]["input"]>;
  /** The values for nested inputs of the specified Required Config Var of the Integration. */
  values?: InputMaybe<Scalars["JSONString"]["input"]>;
};

export type InputInstanceFlowConfig = {
  apiKeys?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  flowId: Scalars["ID"]["input"];
  /** Content type of the payload for testing this IntegrationFlow associated with the Instance. */
  testContentType?: InputMaybe<Scalars["String"]["input"]>;
  /** Headers of the request for testing this IntegrationFlow associated with the Instance. */
  testHeaders?: InputMaybe<Scalars["JSONString"]["input"]>;
  /** Data payload for testing this IntegrationFlow associated with the Instance. */
  testPayload?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether executions of this InstanceFlowConfig will use Long Running Executions. */
  usesLre?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type InputIntegrationFlow = {
  id: Scalars["ID"]["input"];
  organizationApiKeys?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** Content type of the payload for testing this IntegrationFlow. */
  testContentType?: InputMaybe<Scalars["String"]["input"]>;
  /** Headers of the request for testing this IntegrationFlow. */
  testHeaders?: InputMaybe<Scalars["JSONString"]["input"]>;
  /** Data payload for testing this IntegrationFlow. */
  testPayload?: InputMaybe<Scalars["String"]["input"]>;
};

export enum InstanceConfigState {
  FullyConfigured = "FULLY_CONFIGURED",
  NeedsInstanceConfiguration = "NEEDS_INSTANCE_CONFIGURATION",
  NeedsUserLevelConfiguration = "NEEDS_USER_LEVEL_CONFIGURATION",
}

export enum InstanceConfigVariableScheduleType {
  /** Custom */
  Custom = "CUSTOM",
  /** Day */
  Day = "DAY",
  /** Hour */
  Hour = "HOUR",
  /** Minute */
  Minute = "MINUTE",
  /** None */
  None = "NONE",
  /** Week */
  Week = "WEEK",
}

export enum InstanceConfigVariableStatus {
  /** active */
  Active = "ACTIVE",
  /** error */
  Error = "ERROR",
  /** failed */
  Failed = "FAILED",
  /** pending */
  Pending = "PENDING",
}

/** Allows specifying which field and direction to order by. */
export type InstanceDailyUsageMetricsOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceDailyUsageMetricsOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceDailyUsageMetricsOrderField {
  SnapshotDate = "SNAPSHOT_DATE",
}

/** Indicates whether the Instance was deployed by a customer or org. */
export enum InstanceDesignedBy {
  Customer = "CUSTOMER",
  Org = "ORG",
}

export enum InstanceExecutionResultInvokeType {
  /** AI Agent */
  AiAgent = "AI_AGENT",
  /** Cross Flow */
  CrossFlow = "CROSS_FLOW",
  /** Deploy Flow */
  DeployFlow = "DEPLOY_FLOW",
  /** Integration Endpoint Test */
  IntegrationEndpointTest = "INTEGRATION_ENDPOINT_TEST",
  /** Integration Flow Test */
  IntegrationFlowTest = "INTEGRATION_FLOW_TEST",
  /** Scheduled */
  Scheduled = "SCHEDULED",
  /** Tear Down Flow */
  TearDownFlow = "TEAR_DOWN_FLOW",
  /** Webhook */
  Webhook = "WEBHOOK",
  /** Webhook Snapshot */
  WebhookSnapshot = "WEBHOOK_SNAPSHOT",
}

/** Allows specifying which field and direction to order by. */
export type InstanceExecutionResultOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceExecutionResultOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceExecutionResultOrderField {
  EndedAt = "ENDED_AT",
  StartedAt = "STARTED_AT",
}

export enum InstanceExecutionResultResultType {
  /** Canceled As Duplicate */
  CanceledAsDuplicate = "CANCELED_AS_DUPLICATE",
  /** Completed */
  Completed = "COMPLETED",
  /** Error */
  Error = "ERROR",
  /** Polled No Changes */
  PolledNoChanges = "POLLED_NO_CHANGES",
}

/** Allows specifying which field and direction to order by. */
export type InstanceFlowConfigOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceFlowConfigOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceFlowConfigOrderField {
  SortOrder = "SORT_ORDER",
}

/** Allows specifying which field and direction to order by. */
export type InstanceOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceOrderField {
  Category = "CATEGORY",
  CreatedAt = "CREATED_AT",
  Customer = "CUSTOMER",
  Description = "DESCRIPTION",
  Enabled = "ENABLED",
  InstanceType = "INSTANCE_TYPE",
  Integration = "INTEGRATION",
  LastExecutedAt = "LAST_EXECUTED_AT",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
  Version = "VERSION",
}

/** Allows specifying which field and direction to order by. */
export type InstanceProfileOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceProfileOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceProfileOrderField {
  Description = "DESCRIPTION",
  IsDefaultProfile = "IS_DEFAULT_PROFILE",
  Name = "NAME",
}

export enum InstanceProfileScope {
  Instance = "INSTANCE",
  Org = "ORG",
}

/** Allows specifying which field and direction to order by. */
export type InstanceStepResultOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: InstanceStepResultOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum InstanceStepResultOrderField {
  EndedAt = "ENDED_AT",
  StartedAt = "STARTED_AT",
}

/** Indicates what kind of Instance, if any, is related to this record. */
export enum InstanceType {
  Integration = "INTEGRATION",
  Workflow = "WORKFLOW",
}

export enum IntegrationActionErrorHandlerType {
  /** Fail */
  Fail = "FAIL",
  /** Ignore */
  Ignore = "IGNORE",
  /** Retry */
  Retry = "RETRY",
}

export enum IntegrationEndpointType {
  /** Flow Specific */
  FlowSpecific = "FLOW_SPECIFIC",
  /** Instance Specific */
  InstanceSpecific = "INSTANCE_SPECIFIC",
  /** Shared Instance */
  SharedInstance = "SHARED_INSTANCE",
}

export enum IntegrationFlowEndpointSecurityType {
  /** Customer Optional */
  CustomerOptional = "CUSTOMER_OPTIONAL",
  /** Customer Required */
  CustomerRequired = "CUSTOMER_REQUIRED",
  /** Organization */
  Organization = "ORGANIZATION",
  /** Unsecured */
  Unsecured = "UNSECURED",
}

/** Allows specifying which field and direction to order by. */
export type IntegrationOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: IntegrationOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum IntegrationOrderField {
  Category = "CATEGORY",
  CreatedAt = "CREATED_AT",
  Customer = "CUSTOMER",
  Description = "DESCRIPTION",
  Name = "NAME",
  PublishedAt = "PUBLISHED_AT",
  UpdatedAt = "UPDATED_AT",
  VersionNumber = "VERSION_NUMBER",
}

export enum IntegrationStoreConfiguration {
  AvailableAndDeployable = "AVAILABLE_AND_DEPLOYABLE",
  AvailableNotDeployable = "AVAILABLE_NOT_DEPLOYABLE",
  NotAvailableInStore = "NOT_AVAILABLE_IN_STORE",
}

export enum IntegrationTemplateConfiguration {
  /** Available */
  Available = "AVAILABLE",
  /** Customer Available */
  CustomerAvailable = "CUSTOMER_AVAILABLE",
  /** Not Available */
  NotAvailable = "NOT_AVAILABLE",
  /** Org Available */
  OrgAvailable = "ORG_AVAILABLE",
}

/** Allows specifying which field and direction to order by. */
export type IntegrationTemplateOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: IntegrationTemplateOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum IntegrationTemplateOrderField {
  Category = "CATEGORY",
  CreatedAt = "CREATED_AT",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}

/** Allows specifying which field and direction to order by. */
export type IntegrationVariantOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: IntegrationVariantOrderField;
};

/** Represents the fields by which collections of the union type may be ordered. */
export enum IntegrationVariantOrderField {
  Category = "CATEGORY",
  CreatedAt = "CREATED_AT",
  Customer = "CUSTOMER",
  Description = "DESCRIPTION",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
  VersionNumber = "VERSION_NUMBER",
}

/** Enum representing the types of integration variants. */
export enum IntegrationVariantType {
  Integration = "INTEGRATION",
  Workflow = "WORKFLOW",
}

/** Allows specifying which field and direction to order by. */
export type LogOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: LogOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum LogOrderField {
  Customer = "CUSTOMER",
  Flow = "FLOW",
  FlowConfig = "FLOW_CONFIG",
  Instance = "INSTANCE",
  Integration = "INTEGRATION",
  LogType = "LOG_TYPE",
  Message = "MESSAGE",
  Severity = "SEVERITY",
  Timestamp = "TIMESTAMP",
}

/** Indicates the severity level of a log message. */
export enum LogSeverityLevel {
  Debug = "DEBUG",
  Error = "ERROR",
  Fatal = "FATAL",
  Info = "INFO",
  Metric = "METRIC",
  Trace = "TRACE",
  Warn = "WARN",
}

export type LogSeverityLevelInput = {
  /** The integer value of the log severity level. */
  id: Scalars["Int"]["input"];
  /** The description of the log severity level. */
  name: Scalars["String"]["input"];
};

export enum LogType {
  Connection = "CONNECTION",
  DataSource = "DATA_SOURCE",
  Execution = "EXECUTION",
  Management = "MANAGEMENT",
  RateLimit = "RATE_LIMIT",
}

export enum MarketplaceConfiguration {
  AvailableAndDeployable = "AVAILABLE_AND_DEPLOYABLE",
  AvailableNotDeployable = "AVAILABLE_NOT_DEPLOYABLE",
  NotAvailableInMarketplace = "NOT_AVAILABLE_IN_MARKETPLACE",
}

export enum MediaType {
  Attachment = "ATTACHMENT",
  Avatar = "AVATAR",
}

export type OAuthRedirectConfigInput = {
  oAuthFailureRedirectUri?: InputMaybe<Scalars["String"]["input"]>;
  oAuthSuccessRedirectUri?: InputMaybe<Scalars["String"]["input"]>;
};

/** Allows specifying which field and direction to order by. */
export type ObjectPermissionGrantOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ObjectPermissionGrantOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ObjectPermissionGrantOrderField {
  Permission = "PERMISSION",
}

/** Allows specifying which field and direction to order by. */
export type OnPremiseResourceOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: OnPremiseResourceOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum OnPremiseResourceOrderField {
  Customer = "CUSTOMER",
  Name = "NAME",
}

export enum OnPremiseResourceStatus {
  /** Available */
  Available = "AVAILABLE",
  /** Pending */
  Pending = "PENDING",
  /** Unavailable */
  Unavailable = "UNAVAILABLE",
  /** Unknown */
  Unknown = "UNKNOWN",
}

/** Represents the supported sort order directions. */
export enum OrderDirection {
  Asc = "ASC",
  Desc = "DESC",
}

/** Allows specifying which field and direction to order by. */
export type OrgDailyUsageMetricsOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: OrgDailyUsageMetricsOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum OrgDailyUsageMetricsOrderField {
  SnapshotDate = "SNAPSHOT_DATE",
}

/** Allows specifying which field and direction to order by. */
export type OrgTotalUsageMetricsOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: OrgTotalUsageMetricsOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum OrgTotalUsageMetricsOrderField {
  SnapshotTime = "SNAPSHOT_TIME",
}

/** Allows specifying which field and direction to order by. */
export type OrganizationSigningKeyOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: OrganizationSigningKeyOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum OrganizationSigningKeyOrderField {
  CreatedAt = "CREATED_AT",
  UpdatedAt = "UPDATED_AT",
}

/** Allows specifying which field and direction to order by. */
export type PermissionOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: PermissionOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum PermissionOrderField {
  Name = "NAME",
}

export type PublishComponentInput = {
  /** A list of Component Actions. */
  actions?: InputMaybe<Array<InputMaybe<ActionDefinitionInput>>>;
  /** Attributes to set on the published version. */
  attributes?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Comment about changes in this Publish. */
  comment?: InputMaybe<Scalars["String"]["input"]>;
  /** A list of Component Connections. */
  connections?: InputMaybe<Array<InputMaybe<ConnectionDefinitionInput>>>;
  /** The Customer the Component belongs to, if any. If this is NULL then the Component belongs to the Organization. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** A list of Component Data Sources. */
  dataSources?: InputMaybe<Array<InputMaybe<DataSourceDefinitionInput>>>;
  /** The Component definition. */
  definition: ComponentDefinitionInput;
  /** A list of Component Triggers. */
  triggers?: InputMaybe<Array<InputMaybe<TriggerDefinitionInput>>>;
};

export type PublishIntegrationInput = {
  /** Attributes to set on the published version. */
  attributes?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Comment about changes in this Publish. */
  comment?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type PublishWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Comment about changes in this published Workflow version. */
  comment?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type RemoveFifoQueueItemsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceFlowConfig to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Number of items to remove from front of queue (1-100) */
  itemCount?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ReplayExecutionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceExecutionResult to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type RequestOAuth2CredentialAuthorizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The email of the recipient who will complete the OAuth2 authorization request. */
  email?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Credential to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The message that will be sent to the recipient of the email. */
  message?: InputMaybe<Scalars["String"]["input"]>;
};

export type RequiredComponentInput = {
  key: Scalars["String"]["input"];
  public: Scalars["Boolean"]["input"];
};

export enum RequiredConfigVariableCodeLanguage {
  /** Html */
  Html = "HTML",
  /** Json */
  Json = "JSON",
  /** Xml */
  Xml = "XML",
}

export enum RequiredConfigVariableCollectionType {
  /** Keyvaluelist */
  Keyvaluelist = "KEYVALUELIST",
  /** Valuelist */
  Valuelist = "VALUELIST",
}

export enum RequiredConfigVariableDataType {
  /** Boolean */
  Boolean = "BOOLEAN",
  /** Code */
  Code = "CODE",
  /** Connection */
  Connection = "CONNECTION",
  /** Credential */
  Credential = "CREDENTIAL",
  /** Date */
  Date = "DATE",
  /** Jsonform */
  Jsonform = "JSONFORM",
  /** Number */
  Number = "NUMBER",
  /** Objectfieldmap */
  Objectfieldmap = "OBJECTFIELDMAP",
  /** Objectselection */
  Objectselection = "OBJECTSELECTION",
  /** Picklist */
  Picklist = "PICKLIST",
  /** Schedule */
  Schedule = "SCHEDULE",
  /** String */
  String = "STRING",
  /** Timestamp */
  Timestamp = "TIMESTAMP",
}

export enum RequiredConfigVariableOnPremiseConnectionConfig {
  /** Allowed */
  Allowed = "ALLOWED",
  /** Disallowed */
  Disallowed = "DISALLOWED",
  /** Required */
  Required = "REQUIRED",
}

/** Allows specifying which field and direction to order by. */
export type RequiredConfigVariableOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: RequiredConfigVariableOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum RequiredConfigVariableOrderField {
  SortOrder = "SORT_ORDER",
}

export enum RequiredConfigVariableScheduleType {
  /** Custom */
  Custom = "CUSTOM",
  /** Day */
  Day = "DAY",
  /** Hour */
  Hour = "HOUR",
  /** Minute */
  Minute = "MINUTE",
  /** None */
  None = "NONE",
  /** Week */
  Week = "WEEK",
}

/** Allows specifying which field and direction to order by. */
export type ReusableConnectionOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ReusableConnectionOrderField;
};

/** Represents the fields by which collections of the union type may be ordered. */
export enum ReusableConnectionOrderField {
  ComponentLabel = "COMPONENT_LABEL",
  CreatedAt = "CREATED_AT",
  Key = "KEY",
  LastConfiguredAt = "LAST_CONFIGURED_AT",
  Status = "STATUS",
  UpdatedAt = "UPDATED_AT",
}

export type RotateOnPremiseResourceJwtInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer associated with this resource. */
  customerId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Set to true to register an On-Prem Resource only available to Organization users. Only valid for Organization users. */
  orgOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The ID of the On-Prem Resource. */
  resourceId: Scalars["ID"]["input"];
};

export type SaveWorkflowTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Integration Template. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WorkflowTemplate to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name of the Integration Template. Must be unique. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Workflow on which to base the template. */
  workflow?: InputMaybe<Scalars["ID"]["input"]>;
};

export enum ScopedConfigVariableManagedBy {
  /** Customer */
  Customer = "CUSTOMER",
  /** Org */
  Org = "ORG",
  /** System */
  System = "SYSTEM",
}

/** Allows specifying which field and direction to order by. */
export type ScopedConfigVariableOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: ScopedConfigVariableOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum ScopedConfigVariableOrderField {
  ComponentLabel = "COMPONENT_LABEL",
  CreatedAt = "CREATED_AT",
  Key = "KEY",
  LastConfiguredAt = "LAST_CONFIGURED_AT",
  Status = "STATUS",
  UpdatedAt = "UPDATED_AT",
}

export enum ScopedConfigVariableStatus {
  /** active */
  Active = "ACTIVE",
  /** error */
  Error = "ERROR",
  /** failed */
  Failed = "FAILED",
  /** pending */
  Pending = "PENDING",
}

export enum ScopedConfigVariableVariableScope {
  /** Customer */
  Customer = "CUSTOMER",
  /** Org */
  Org = "ORG",
}

/** Allows specifying which field and direction to order by. */
export type StarredRecordOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: StarredRecordOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum StarredRecordOrderField {
  Timestamp = "TIMESTAMP",
}

export type TestFlowTriggerEventInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The type of system event to use for testing. */
  eventType: Scalars["String"]["input"];
  /** The ID of the IntegrationFlow to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type TestInstanceFlowConfigInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The content type of the payload to send with the POST request that triggers the InstanceFlowConfig. */
  contentType?: InputMaybe<Scalars["String"]["input"]>;
  /** The headers to send with the POST request that triggers the InstanceFlowConfig. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceFlowConfig to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The payload to send with the POST request that triggers the InstanceFlowConfig. */
  payload?: InputMaybe<Scalars["String"]["input"]>;
};

export type TestIntegrationEndpointConfigInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The content type of the payload to send with the POST request to test the endpoint configuration for the Integration. */
  contentType?: InputMaybe<Scalars["String"]["input"]>;
  /** The headers to send with the POST request to test the endpoint configuration for the Integration. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The payload to send with the POST request to test the endpoint configuration for the Integration. */
  payload?: InputMaybe<Scalars["String"]["input"]>;
};

export type TestIntegrationFlowInput = {
  /** Whether or not to wait for the execution's response. */
  asynchronous?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The content type of the payload to send with the POST request that triggers the Integration Flow Test Instance. */
  contentType?: InputMaybe<Scalars["String"]["input"]>;
  /** The headers to send with the POST request that triggers the Integration Flow Test Instance. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the IntegrationFlow to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The payload to send with the POST request that triggers the Integration Flow Test Instance. */
  payload?: InputMaybe<Scalars["String"]["input"]>;
  /** The result of the test case. */
  result?: InputMaybe<Scalars["String"]["input"]>;
};

export type TestWebhookEndpointInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WebhookEndpoint to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

/** Represents a Theme Color of a given Type and the Variant that it is associated with. */
export type ThemeColorInput = {
  /** The type of Color. */
  type: Scalars["String"]["input"];
  /** The value of the color. */
  value: Scalars["String"]["input"];
  /** The Theme variant the color is associated with */
  variant: Scalars["String"]["input"];
};

export enum ThemeColorType {
  /** Accent */
  Accent = "ACCENT",
  /** Background */
  Background = "BACKGROUND",
  /** Debug */
  Debug = "DEBUG",
  /** Designer Shell */
  DesignerShell = "DESIGNER_SHELL",
  /** Error */
  Error = "ERROR",
  /** Icon Color */
  IconColor = "ICON_COLOR",
  /** Info */
  Info = "INFO",
  /** Link Color */
  LinkColor = "LINK_COLOR",
  /** Metric */
  Metric = "METRIC",
  /** Neutral */
  Neutral = "NEUTRAL",
  /** Other01 */
  Other01 = "OTHER01",
  /** Primary */
  Primary = "PRIMARY",
  /** Secondary */
  Secondary = "SECONDARY",
  /** Sidebar */
  Sidebar = "SIDEBAR",
  /** Success */
  Success = "SUCCESS",
  /** Trace */
  Trace = "TRACE",
  /** Warning */
  Warning = "WARNING",
}

export enum ThemeColorVariant {
  /** Dark */
  Dark = "DARK",
  /** Embedded Dark */
  EmbeddedDark = "EMBEDDED_DARK",
  /** Embedded Light */
  EmbeddedLight = "EMBEDDED_LIGHT",
  /** Light */
  Light = "LIGHT",
}

/** Represents a Property used to style a Theme */
export type ThemePropertyInput = {
  /** The type of Theme Property. */
  type: Scalars["String"]["input"];
  /** The value of the Property. */
  value: Scalars["String"]["input"];
  /** The Theme variant the color is associated with */
  variant?: InputMaybe<Scalars["String"]["input"]>;
};

export enum ThemePropertyType {
  /** Border Radius */
  BorderRadius = "BORDER_RADIUS",
  /** Disable Elevation */
  DisableElevation = "DISABLE_ELEVATION",
}

export enum ThemePropertyVariant {
  /** Dark */
  Dark = "DARK",
  /** Embedded Dark */
  EmbeddedDark = "EMBEDDED_DARK",
  /** Embedded Light */
  EmbeddedLight = "EMBEDDED_LIGHT",
  /** Light */
  Light = "LIGHT",
}

export enum TreeLocation {
  Leaf = "LEAF",
  Root = "ROOT",
}

/** Represents a collection of data that defines a Component Trigger. */
export type TriggerDefinitionInput = {
  /** Specifies whether the Action will allow Conditional Branching. */
  allowsBranching?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies how the Action handles Authorization. */
  authorization?: InputMaybe<AuthorizationDefinition>;
  /** Specifies whether an Action will break out of a loop. */
  breakLoop?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether the Action can call other Component Actions, Data Sources, or Triggers. */
  canCallComponentFunctions?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies how the Component Action is displayed. */
  display: ActionDisplayDefinition;
  /** The input associated with dynamic branching. */
  dynamicBranchInput?: InputMaybe<Scalars["String"]["input"]>;
  /** An example of the returned payload of an Action. */
  examplePayload?: InputMaybe<Scalars["JSONString"]["input"]>;
  hasOnInstanceDelete?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOnInstanceDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasWebhookCreateFunction?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasWebhookDeleteFunction?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The InputFields supported by the Component Action. */
  inputs: Array<InputMaybe<InputFieldDefinition>>;
  isCommonTrigger?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPollingTrigger?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** A string which uniquely identifies the Action in the context of the Component. */
  key: Scalars["String"]["input"];
  /** Specifies support for triggering an Integration on a recurring schedule. */
  scheduleSupport?: InputMaybe<Scalars["String"]["input"]>;
  /** The static branch names associated with an Action. */
  staticBranchNames?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** Specifies support for synchronous responses to an Integration webhook request. */
  synchronousResponseSupport?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether the Action will terminate Instance execution. */
  terminateExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateAlertGroupInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertGroup to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name of the AlertGroup */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The users in the AlertGroup. */
  users?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  /** The AlertWebhooks in the AlertGroup */
  webhooks?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
};

export type UpdateAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The execution duration condition to monitor for relevant AlertTrigger types. */
  durationSecondsCondition?: InputMaybe<Scalars["Int"]["input"]>;
  /** The execution overdue condition to monitor for relevant AlertTrigger types. */
  executionOverdueMinutesCondition?: InputMaybe<Scalars["Int"]["input"]>;
  /** The IntegrationFlow that is being monitored by the AlertMonitor. */
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  /** The AlertGroups to notify when the AlertMonitor is triggered. */
  groups?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  /** The ID of the AlertMonitor to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The Instance that is being monitored by the AlertMonitor. */
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  /** The log severity level condition to monitor for relevant AlertTrigger types. */
  logSeverityLevelCondition?: InputMaybe<Scalars["Int"]["input"]>;
  /** The name of the AlertMonitor. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The AlertTriggers that are setup to trigger the AlertMonitor. */
  triggers?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  /** The Users to notify when the AlertMonitor is triggered. */
  users?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  /** The AlertWebhooks to call when the AlertMonitor is triggered. */
  webhooks?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
};

export type UpdateAlertWebhookInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** A JSON string of key/value pairs that will be sent as headers in the Webhook request. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertWebhook to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name of the AlertWebhook. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The template that is hydrated and then used as the body of the AlertWebhook request. */
  payloadTemplate?: InputMaybe<Scalars["String"]["input"]>;
  /** The URL of the AlertWebhook. */
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateComponentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Component to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateConnectionTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Connection from which this template is structured. */
  connection?: InputMaybe<Scalars["ID"]["input"]>;
  /** The ID of the ConnectionTemplate to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name of this template. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The input presets associated with this template. */
  presets?: InputMaybe<Array<InputMaybe<ConnectionTemplateField>>>;
};

export type UpdateCredentialInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Credential to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name of the Credential. */
  label?: InputMaybe<Scalars["String"]["input"]>;
  /** A list of InputCredentialFieldValues that contain the values for the CredentialFields. */
  values?: InputMaybe<Array<InputMaybe<InputCredentialFieldValue>>>;
};

export type UpdateCustomerConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer with which this Config Variable is associated. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The collection of Expressions that serve as inputs to this variable. */
  inputs?: InputMaybe<Array<InputMaybe<InputExpression>>>;
  /** Specifies whether this Config Variable is meant for testing. */
  isTest?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The display name of this variable. */
  key?: InputMaybe<Scalars["String"]["input"]>;
  /** Indicates whether to redeploy Instances using this Customer Config Variable. */
  redeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateCustomerInput = {
  /** Adds the specified Attachment to the object. */
  addAttachment?: InputMaybe<AttachmentInput>;
  /** Specifies whether this Customer can use the Embedded Designer. */
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Customer can use the Workflow Copilot. */
  allowWorkflowCopilot?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The maximum number of concurrent executions allowed for this Customer. If null, no Customer-specific limit is enforced. */
  concurrentExecutionLimit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Additional notes about the Customer. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Customer to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** The name of the Customer, which must be unique within the scope of its Organization. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Removes the specified Attachment on the object. */
  removeAttachment?: InputMaybe<AttachmentInput>;
  /** Renames the specified Attachment from the object. */
  renameAttachment?: InputMaybe<AttachmentRenameInput>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateCustomerOAuth2ConnectionInput = {
  /** The OAuth2 access token to use for the Connection. */
  accessToken?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional fields to store on the token. */
  additionalTokenFields?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The context to use for the Connection. Completely replaces any existing value for context on the Connection. */
  context?: InputMaybe<Scalars["String"]["input"]>;
  /** The number of seconds until the token is expired and a refresh must occur for the Connection. */
  expiresIn?: InputMaybe<Scalars["Int"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The timestamp at which the next refresh attempt will occur for the Connection. */
  refreshAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  /** The OAuth2 refresh token to use for the Connection. */
  refreshToken?: InputMaybe<Scalars["String"]["input"]>;
  /** The status to use for the Connection. */
  status?: InputMaybe<Scalars["String"]["input"]>;
  /** The type of OAuth2 token to use for the Connection. */
  tokenType?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateEmbeddedInput = {
  /** Specifies custom names for branded elements. */
  brandedElements?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** A list of Component identifiers that embedded designers are required to build into Integrations. */
  requiredComponents?: InputMaybe<Array<InputMaybe<RequiredComponentInput>>>;
};

export type UpdateExternalLogStreamInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** A JSON string of key/value pairs that will be sent as headers in the ExternalLogStream request. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ExternalLogStream to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Name of the ExternalLogStream. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The template that is hydrated and then used as the body of the ExternalLogStream request. */
  payloadTemplate?: InputMaybe<Scalars["String"]["input"]>;
  /** The Log severity levels for which Logs should be sent to the ExternalLogStream. */
  severityLevels?: InputMaybe<Array<InputMaybe<LogSeverityLevelInput>>>;
  /** The URL of the ExternalLogStream. */
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateInstanceConfigVariablesInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Whether the configuration is complete and ready to be deployed. */
  configComplete?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Desired configuration mode. */
  configMode?: InputMaybe<Scalars["String"]["input"]>;
  /** The Instance with which the Config Variable is associated. */
  configVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>>>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UpdateInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Desired configuration mode. */
  configMode?: InputMaybe<Scalars["String"]["input"]>;
  /** The Instance with which the Config Variable is associated. */
  configVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>>>;
  /** Additional notes about the Instance. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether the Instance is currently enabled and in an executable state. */
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The configuration for the IntegrationFlow associated with the Instance. */
  flowConfigs?: InputMaybe<Array<InputMaybe<InputInstanceFlowConfig>>>;
  /** Specifies whether Instance executions should run in debug mode. */
  globalDebug?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The Integration that has been deployed for the Instance. */
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** DEPRECATED: Use Instance Profiles to configure logs_disabled instead. */
  logsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The name of the Instance. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether to update the value of needsDeploy as part of the mutation or leave its current value unaltered. */
  preserveDeployState?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** DEPRECATED: Use Instance Profiles to configure step_results_disabled instead. */
  stepResultsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateInstanceProfileInput = {
  /** The amount of memory allocated to the Instance Runner Lambda function. */
  allocatedMemoryMb?: InputMaybe<Scalars["Int"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Instance Profile. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceProfile to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The instance whose override profile to update (alternative to specifying profile id). */
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  /** The billing type for the Instances that use this Instance Profile. */
  instanceBillingType?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether this Instance Profile is the default used when no Instance Profile is explicitly specified during Instance creation. */
  isDefaultProfile?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to disable the creation of logs during Instance execution. */
  logsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The name of the Instance Profile, which must be unique within the scope of its Organization. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** DEPRECATED: Use quick_start_instances instead. Whether instances using this profile will startup faster when triggered. */
  quickStart?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The number of QuickStart runners reserved for instances using this profile. */
  quickStartInstances?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies whether to disable the creation of step results during Instance execution. */
  stepResultsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateInstancesUsingCustomerConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UpdateIntegrationInput = {
  /** Adds the specified Attachment to the object. */
  addAttachment?: InputMaybe<AttachmentInput>;
  /** Specifies whether multiple Instances of this Integration may be created from the Marketplace. */
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies the category of the Integration. */
  category?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  /** The YAML serialized definition of the Integration to import. */
  definition?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Integration. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Content type of the payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestContentType?: InputMaybe<Scalars["String"]["input"]>;
  /** A JSON string of key/value pairs that will be sent as headers when testing the endpoint configuration for this Integration. */
  endpointConfigTestHeaders?: InputMaybe<Scalars["String"]["input"]>;
  /** Data payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestPayload?: InputMaybe<Scalars["String"]["input"]>;
  /** The Integration of which the IntegrationFlow is a part. */
  flows?: InputMaybe<Array<InputMaybe<InputIntegrationFlow>>>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** A JSON string that represents metadata for the Integration. */
  metadata?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the Integration. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Removes the specified Attachment on the object. */
  removeAttachment?: InputMaybe<AttachmentInput>;
  /** Renames the specified Attachment from the object. */
  renameAttachment?: InputMaybe<AttachmentRenameInput>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether the latest published version of this Integration may be used as a template to create new Integrations. */
  templateConfiguration?: InputMaybe<Scalars["String"]["input"]>;
  /** Config Variables that have been specified for the purposes of testing the Integration. */
  testConfigVariables?: InputMaybe<Array<InputMaybe<InputInstanceConfigVariable>>>;
  /** Specifies whether the latest published version of this Integration may be used as a template to create new Integrations. */
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateIntegrationMarketplaceConfigurationInput = {
  /** Specifies whether multiple Instances of this Integration may be created from the Marketplace. */
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Specifies whether an Integration will be available in the Integration Marketplace and if the Integration is deployable by a Customer User. */
  marketplaceConfiguration?: InputMaybe<Scalars["String"]["input"]>;
  /** The Marketplace Tabs available to Customer Users for configuring this Integration. */
  marketplaceTabConfiguration?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies an Overview of the Integration to describe its functionality for use in the Integration Marketplace. */
  overview?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateIntegrationTestConfigurationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Content type of the payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestContentType?: InputMaybe<Scalars["String"]["input"]>;
  /** A JSON string of key/value pairs that will be sent as headers when testing the endpoint configuration for this Integration. */
  endpointConfigTestHeaders?: InputMaybe<Scalars["String"]["input"]>;
  /** Data payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestPayload?: InputMaybe<Scalars["String"]["input"]>;
  /** The Integration of which the IntegrationFlow is a part. */
  flows?: InputMaybe<Array<InputMaybe<InputIntegrationFlow>>>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Toggle listening mode for webhook snapshot executions. */
  listeningMode?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateIntegrationVersionAvailabilityInput = {
  /** Flag the Integration version as available or not */
  available: Scalars["Boolean"]["input"];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UpdateOAuth2ConnectionInput = {
  /** The OAuth2 access token to use for the Connection. */
  accessToken?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional fields to store on the token. */
  additionalTokenFields?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The context to use for the Connection. Completely replaces any existing value for context on the Connection. */
  context?: InputMaybe<Scalars["String"]["input"]>;
  /** The number of seconds until the token is expired and a refresh must occur for the Connection. */
  expiresIn?: InputMaybe<Scalars["Int"]["input"]>;
  /** The ID of the InstanceConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The timestamp at which the next refresh attempt will occur for the Connection. */
  refreshAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  /** The OAuth2 refresh token to use for the Connection. */
  refreshToken?: InputMaybe<Scalars["String"]["input"]>;
  /** The status to use for the Connection. */
  status?: InputMaybe<Scalars["String"]["input"]>;
  /** The type of OAuth2 token to use for the Connection. */
  tokenType?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateOrganizationInput = {
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies custom names for branded elements. */
  brandedElements?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  featureFlags?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Organization to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** DEPRECATED. Display name of the Organization's Marketplace. */
  marketplaceName?: InputMaybe<Scalars["String"]["input"]>;
  /** The unique name of the Organization. */
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateScopedConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether this Config Variable is required for Customers using the related Component. */
  defaultForComponent?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Additional notes about the Scoped Config Variable. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ScopedConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The collection of Expressions that serve as inputs to this variable. */
  inputs?: InputMaybe<Array<InputMaybe<InputExpression>>>;
  /** The display name of this variable. */
  key?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration for OAuth redirects. */
  oAuthRedirectConfig?: InputMaybe<OAuthRedirectConfigInput>;
  /** Indicates whether to redeploy Instances using Scoped Config Variable. */
  redeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** When true, removes oAuthSuccessRedirectUri and oAuthFailureRedirectUri from meta. */
  unsetOAuthRedirectConfig?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateScopedOAuth2ConnectionInput = {
  /** The OAuth2 access token to use for the Connection. */
  accessToken?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional fields to store on the token. */
  additionalTokenFields?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The context to use for the Connection. Completely replaces any existing value for context on the Connection. */
  context?: InputMaybe<Scalars["String"]["input"]>;
  /** The number of seconds until the token is expired and a refresh must occur for the Connection. */
  expiresIn?: InputMaybe<Scalars["Int"]["input"]>;
  /** The ID of the ScopedConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The timestamp at which the next refresh attempt will occur for the Connection. */
  refreshAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  /** The OAuth2 refresh token to use for the Connection. */
  refreshToken?: InputMaybe<Scalars["String"]["input"]>;
  /** The status to use for the Connection. */
  status?: InputMaybe<Scalars["String"]["input"]>;
  /** The type of OAuth2 token to use for the Connection. */
  tokenType?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateTestCaseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Content type of the test payload. */
  contentType?: InputMaybe<Scalars["String"]["input"]>;
  /** Test headers as key/value pairs. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the TestCase to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name of the TestCase. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Test step payload data. */
  payload?: InputMaybe<Scalars["String"]["input"]>;
  /** Test step result data. */
  result?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateThemeInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** A list of inputs that describe the colors used in the theme. */
  colors?: InputMaybe<Array<InputMaybe<ThemeColorInput>>>;
  /** The ID of the Theme to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** A list of inputs that describe the properties used in the theme. */
  properties?: InputMaybe<Array<InputMaybe<ThemePropertyInput>>>;
};

export type UpdateUserInput = {
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Designates whether the User has dark mode activated or not. */
  darkMode?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Designates whether dark mode should be derived from the operating system. */
  darkModeSyncWithOs?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  featureFlags?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the User to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The user's preferred name. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** The preferred contact phone number for the User. */
  phone?: InputMaybe<Scalars["String"]["input"]>;
  /** The role to associate with the User. */
  role?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UpdateUserLevelOAuth2ConnectionInput = {
  /** The OAuth2 access token to use for the Connection. */
  accessToken?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional fields to store on the token. */
  additionalTokenFields?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The context to use for the Connection. Completely replaces any existing value for context on the Connection. */
  context?: InputMaybe<Scalars["String"]["input"]>;
  /** The number of seconds until the token is expired and a refresh must occur for the Connection. */
  expiresIn?: InputMaybe<Scalars["Int"]["input"]>;
  /** The ID of the UserLevelConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** The timestamp at which the next refresh attempt will occur for the Connection. */
  refreshAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  /** The OAuth2 refresh token to use for the Connection. */
  refreshToken?: InputMaybe<Scalars["String"]["input"]>;
  /** The status to use for the Connection. */
  status?: InputMaybe<Scalars["String"]["input"]>;
  /** The type of OAuth2 token to use for the Connection. */
  tokenType?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateWebhookEndpointInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about this webhook endpoint configuration. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Whether this webhook endpoint is currently enabled. Disabled endpoints will not receive events. */
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** List of event types to subscribe to. */
  eventTypes?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** A JSON object of key/value pairs that will be sent as headers with each webhook request. */
  headers?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WebhookEndpoint to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Friendly name for the webhook endpoint. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Secret key used for HMAC signature generation. If provided, all webhook payloads will include an X-Webhook-Signature header. */
  secret?: InputMaybe<Scalars["String"]["input"]>;
  /** The URL where webhook events will be sent. */
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateWorkflowTestConfigurationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Toggle listening mode for webhook snapshot executions. */
  listeningMode?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Allows specifying which field and direction to order by. */
export type UserLevelConfigOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: UserLevelConfigOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum UserLevelConfigOrderField {
  CreatedAt = "CREATED_AT",
  Email = "EMAIL",
  ExternalId = "EXTERNAL_ID",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}

export enum UserLevelConfigVariableScheduleType {
  /** Custom */
  Custom = "CUSTOM",
  /** Day */
  Day = "DAY",
  /** Hour */
  Hour = "HOUR",
  /** Minute */
  Minute = "MINUTE",
  /** None */
  None = "NONE",
  /** Week */
  Week = "WEEK",
}

export enum UserLevelConfigVariableStatus {
  /** active */
  Active = "ACTIVE",
  /** error */
  Error = "ERROR",
  /** failed */
  Failed = "FAILED",
  /** pending */
  Pending = "PENDING",
}

/** Allows specifying which field and direction to order by. */
export type UserOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: UserOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum UserOrderField {
  CreatedAt = "CREATED_AT",
  Customer = "CUSTOMER",
  Email = "EMAIL",
  Name = "NAME",
  Role = "ROLE",
  UpdatedAt = "UPDATED_AT",
}

export type ValidateIntegrationSchemaInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The YAML serialized definition of the Integration to validate. */
  definition: Scalars["String"]["input"];
};

/** Allows specifying which field and direction to order by. */
export type VersionOrder = {
  /** The direction to order by. */
  direction: VersionOrderDirection;
  /** The field to order by. */
  field: VersionOrderField;
};

export enum VersionOrderDirection {
  Asc = "ASC",
  Desc = "DESC",
}

/** Represents the fields by which collections of the related type may be ordered. */
export enum VersionOrderField {
  PublishedAt = "PUBLISHED_AT",
  PublishedBy = "PUBLISHED_BY",
  VersionNumber = "VERSION_NUMBER",
}

/** Allows specifying which field and direction to order by. */
export type WebhookEndpointOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: WebhookEndpointOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum WebhookEndpointOrderField {
  CreatedAt = "CREATED_AT",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}

/** Allows specifying which field and direction to order by. */
export type WorkflowOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: WorkflowOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum WorkflowOrderField {
  Category = "CATEGORY",
  CreatedAt = "CREATED_AT",
  Customer = "CUSTOMER",
  Description = "DESCRIPTION",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
  VersionNumber = "VERSION_NUMBER",
}

/** Allows specifying which field and direction to order by. */
export type WorkflowTemplateOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: WorkflowTemplateOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum WorkflowTemplateOrderField {
  Category = "CATEGORY",
  CreatedAt = "CREATED_AT",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}
