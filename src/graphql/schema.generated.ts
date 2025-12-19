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
  Decimal: { input: any; output: any };
  JSONOrString: { input: any; output: any };
  JSONString: { input: any; output: any };
  UUID: { input: any; output: any };
};

export type Ai = {
  __typename?: "AI";
  agentFlows?: Maybe<AgentFlowConnection>;
};

export type AiAgentFlowsArgs = {
  integrationId?: InputMaybe<Scalars["ID"]["input"]>;
};

/** Represents an action that is available on a Component. */
export type Action = Node & {
  __typename?: "Action";
  /** Specifies whether the signed-in User can remove the Action. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Action. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Specifies whether the Action will allow Conditional Branching. */
  allowsBranching: Scalars["Boolean"]["output"];
  /** The AuthorizationMethods that are supported by the Action. */
  authorizationMethods: AuthorizationMethodConnection;
  /** Specifies whether the Action requires authorization to function. */
  authorizationRequired?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether an Action will break out of a loop. */
  breakLoop?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether the Action can call other Component Actions, Data Sources, or Triggers. */
  canCallComponentFunctions: Scalars["Boolean"]["output"];
  /** The Component to which this Action is associated. */
  component?: Maybe<Component>;
  /** Specifies the type of the resulting data from the data source. */
  dataSourceType?: Maybe<ActionDataSourceType>;
  /** Additional notes about the Action. */
  description: Scalars["String"]["output"];
  /** The Data Source in this Component which can provide additional details about the content for this Data Source, such as example values when selecting particular API object fields. */
  detailDataSource?: Maybe<Action>;
  /** Notes which may provide insight on the intended use of the Action. */
  directions?: Maybe<Scalars["String"]["output"]>;
  /** A string that associates an Input with Dynamic Branching. */
  dynamicBranchInput: Scalars["String"]["output"];
  /** An example of the returned payload of an Action. */
  examplePayload?: Maybe<Scalars["JSONString"]["output"]>;
  /** Specifies whether the Action, if it is a Trigger, has an Instance Delete handler function defined. */
  hasOnInstanceDelete: Scalars["Boolean"]["output"];
  /** Specifies whether the Action, if it is a Trigger, has an Instance Deploy handler function defined. */
  hasOnInstanceDeploy: Scalars["Boolean"]["output"];
  /** Specifies whether the Action, if it is a Trigger, has a webhook create handler function defined. */
  hasWebhookCreateFunction: Scalars["Boolean"]["output"];
  /** Specifies whether the Action, if it is a Trigger, has a webhook delete handler function defined. */
  hasWebhookDeleteFunction: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Specifies whether the Action is important and/or commonly used. */
  important: Scalars["Boolean"]["output"];
  /** The Action to which this InputField is associated, if any. */
  inputs: InputFieldConnection;
  /** Specifies whether the Action is a commonly used Trigger. */
  isCommonTrigger?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether the Action is a Data Source. */
  isDataSource: Scalars["Boolean"]["output"];
  /** Specifies whether the Action is designed to be used as a detail data source. */
  isDetailDataSource: Scalars["Boolean"]["output"];
  /** Specifies whether the Action, if it is a Trigger, is a polling trigger. */
  isPollingTrigger?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether the Action is a Trigger. */
  isTrigger: Scalars["Boolean"]["output"];
  /** A string that uniquely identifies this Action within the context of the Component. */
  key: Scalars["String"]["output"];
  /** The name of the Action. */
  label: Scalars["String"]["output"];
  /** Specifies support for triggering an Integration on a recurring schedule. */
  scheduleSupport?: Maybe<ActionScheduleSupport>;
  /** A combination of an action's text metadata to be used in search functionality. */
  searchTerms?: Maybe<Scalars["String"]["output"]>;
  /** The static branch names associated with an Action. */
  staticBranchNames?: Maybe<Array<Scalars["String"]["output"]>>;
  /** Specifies support for synchronous responses to an Integration webhook request. */
  synchronousResponseSupport?: Maybe<ActionSynchronousResponseSupport>;
  /** Specifies whether the Action will terminate Instance execution. */
  terminateExecution: Scalars["Boolean"]["output"];
};

/** Represents an action that is available on a Component. */
export type ActionAuthorizationMethodsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents an action that is available on a Component. */
export type ActionInputsArgs = {
  action?: InputMaybe<Scalars["ID"]["input"]>;
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  shown?: InputMaybe<Scalars["Boolean"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  type_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/** Represents a Relay Connection to a collection of Action objects. */
export type ActionConnection = {
  __typename?: "ActionConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ActionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Action>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
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

/** A Relay edge to a related Action object and a cursor for pagination. */
export type ActionEdge = {
  __typename?: "ActionEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Action>;
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

export type Activity = Node & {
  __typename?: "Activity";
  /** Specifies whether the signed-in User can remove the Activity. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Activity. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Description of an activity performed by a user */
  description: Scalars["String"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Date/Time when an activity occurred */
  timestamp: Scalars["DateTime"]["output"];
  /** User that performed an activity */
  user?: Maybe<User>;
  /** Name of the user that performed the activity */
  userName: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of Activity objects. */
export type ActivityConnection = {
  __typename?: "ActivityConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ActivityEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Activity>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related Activity object and a cursor for pagination. */
export type ActivityEdge = {
  __typename?: "ActivityEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Activity>;
};

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

export type AddBlockedRequestIdsInput = {
  /** The requestId to block. */
  blockedId: Scalars["ID"]["input"];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddBlockedRequestIdsPayload = {
  __typename?: "AddBlockedRequestIdsPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<UpdateBlockedIdsResult>;
};

export type AddOrgUsersToControlPlaneInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Optional custom domain to use as the host URL. */
  customDomain?: InputMaybe<Scalars["String"]["input"]>;
  /** Global ID of Organization whose users should be added to the control plane. */
  orgId: Scalars["ID"]["input"];
};

export type AddOrgUsersToControlPlanePayload = {
  __typename?: "AddOrgUsersToControlPlanePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type AdminOperationResult = {
  __typename?: "AdminOperationResult";
  message?: Maybe<Scalars["String"]["output"]>;
};

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

export type AdministerObjectPermissionPayload = {
  __typename?: "AdministerObjectPermissionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

export type AgentFlow = Node & {
  __typename?: "AgentFlow";
  apiKeys?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  /** JSON Schema defining how to invoke this flow */
  invokeSchema?: Maybe<Scalars["JSONString"]["output"]>;
  name: Scalars["String"]["output"];
  /** JSON Schema defining the result of this flow */
  resultSchema?: Maybe<Scalars["JSONString"]["output"]>;
  webhookUrl: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of AgentFlow objects. */
export type AgentFlowConnection = {
  __typename?: "AgentFlowConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AgentFlowEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AgentFlow>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related AgentFlow object and a cursor for pagination. */
export type AgentFlowEdge = {
  __typename?: "AgentFlowEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<AgentFlow>;
};

export enum AggregateDeploymentStatus {
  Activated = "ACTIVATED",
  Paused = "PAUSED",
  Unconfigured = "UNCONFIGURED",
}

/**
 * Represents a specific instance of an Event that triggered a specific Alert
 * Monitor.
 */
export type AlertEvent = Node & {
  __typename?: "AlertEvent";
  /** Specifies whether the signed-in User can remove the AlertEvent. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the AlertEvent. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** Additional information about the event. */
  details: Scalars["String"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The AlertMonitor to which the AlertEvent is associated. */
  monitor: AlertMonitor;
};

/** Represents a Relay Connection to a collection of AlertEvent objects. */
export type AlertEventConnection = {
  __typename?: "AlertEventConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertEventEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertEvent>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related AlertEvent object and a cursor for pagination. */
export type AlertEventEdge = {
  __typename?: "AlertEventEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertEvent>;
};

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

/**
 * Represents a reusable group of users and webhooks for the purposes
 * of alert notification.
 */
export type AlertGroup = Node & {
  __typename?: "AlertGroup";
  /** Specifies whether the signed-in User can remove the AlertGroup. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the AlertGroup. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The AlertGroups to notify when the AlertMonitor is triggered. */
  monitors: AlertMonitorConnection;
  /** The name of the AlertGroup */
  name: Scalars["String"]["output"];
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The users in the AlertGroup. */
  users: UserConnection;
  /** The AlertWebhooks in the AlertGroup */
  webhooks: AlertWebhookConnection;
};

/**
 * Represents a reusable group of users and webhooks for the purposes
 * of alert notification.
 */
export type AlertGroupMonitorsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  triggers_IsGlobal?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents a reusable group of users and webhooks for the purposes
 * of alert notification.
 */
export type AlertGroupUsersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  email_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  externalId_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  includeMarketplaceUsers?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents a reusable group of users and webhooks for the purposes
 * of alert notification.
 */
export type AlertGroupWebhooksArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertWebhookOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertWebhookOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  url_Icontains?: InputMaybe<Scalars["String"]["input"]>;
};

/** Represents a Relay Connection to a collection of AlertGroup objects. */
export type AlertGroupConnection = {
  __typename?: "AlertGroupConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertGroupEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertGroup>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related AlertGroup object and a cursor for pagination. */
export type AlertGroupEdge = {
  __typename?: "AlertGroupEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertGroup>;
};

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

/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitor = Node & {
  __typename?: "AlertMonitor";
  /** Specifies whether the signed-in User can remove the AlertMonitor. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the AlertMonitor. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The execution duration condition to monitor for relevant AlertTrigger types. */
  durationSecondsCondition?: Maybe<Scalars["Int"]["output"]>;
  /** The AlertMonitor to which the AlertEvent is associated. */
  events: AlertEventConnection;
  /** The execution overdue condition to monitor for relevant AlertTrigger types. */
  executionOverdueMinutesCondition?: Maybe<Scalars["Int"]["output"]>;
  /** The IntegrationFlow that is being monitored by the AlertMonitor. */
  flowConfig?: Maybe<InstanceFlowConfig>;
  /** The AlertGroups to notify when the AlertMonitor is triggered. */
  groups: AlertGroupConnection;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Instance that is being monitored by the AlertMonitor. */
  instance?: Maybe<Instance>;
  /** The timestamp when the AlertMonitor was last triggered. */
  lastTriggeredAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The log severity level condition to monitor for relevant AlertTrigger types. */
  logSeverityLevelCondition?: Maybe<Scalars["Int"]["output"]>;
  /** The name of the AlertMonitor. */
  name: Scalars["String"]["output"];
  /** Specifies whether the Alert Monitor has been suspended by Prismatic. */
  systemSuspended: Scalars["Boolean"]["output"];
  /** Specifies whether the AlertMonitor is currently triggered. */
  triggered: Scalars["Boolean"]["output"];
  /** The AlertTriggers that are setup to trigger the AlertMonitor. */
  triggers: AlertTriggerConnection;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The Users to notify when the AlertMonitor is triggered. */
  users: UserConnection;
  /** The AlertWebhooks to call when the AlertMonitor is triggered. */
  webhooks: AlertWebhookConnection;
};

/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorEventsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  details_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  monitor?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_FlowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_Instance?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_Instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_Instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_Instance_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  monitor_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertEventOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertEventOrder>>>;
};

/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorGroupsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertGroupOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertGroupOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorTriggersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  isGlobal?: InputMaybe<Scalars["Boolean"]["input"]>;
  isInstanceSpecific?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertTriggerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertTriggerOrder>>>;
};

/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorUsersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  email_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  externalId_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  includeMarketplaceUsers?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents a set of rules that are applied to a specific Instance which
 * determine when an alert notification is sent as well to whom and how they
 * are delivered.
 */
export type AlertMonitorWebhooksArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertWebhookOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertWebhookOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  url_Icontains?: InputMaybe<Scalars["String"]["input"]>;
};

/** Represents a Relay Connection to a collection of AlertMonitor objects. */
export type AlertMonitorConnection = {
  __typename?: "AlertMonitorConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertMonitorEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertMonitor>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related AlertMonitor object and a cursor for pagination. */
export type AlertMonitorEdge = {
  __typename?: "AlertMonitorEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertMonitor>;
};

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

/** Represents a type of event in the system that can trigger an AlertMonitor. */
export type AlertTrigger = Node & {
  __typename?: "AlertTrigger";
  /** Specifies whether the signed-in User can remove the AlertTrigger. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the AlertTrigger. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Specifies whether the AlertTrigger is global, rather than Instance or InstanceFlowConfig-specific. */
  isGlobal: Scalars["Boolean"]["output"];
  /** Specifies whether the AlertTrigger is specific to an Instance rather than an InstanceFlowConfig. */
  isInstanceSpecific: Scalars["Boolean"]["output"];
  /** The AlertTriggers that are setup to trigger the AlertMonitor. */
  monitors: AlertMonitorConnection;
  /** The name of the AlertTrigger. */
  name: Scalars["String"]["output"];
};

/** Represents a type of event in the system that can trigger an AlertMonitor. */
export type AlertTriggerMonitorsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  triggers_IsGlobal?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/** Represents a Relay Connection to a collection of AlertTrigger objects. */
export type AlertTriggerConnection = {
  __typename?: "AlertTriggerConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertTriggerEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertTrigger>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related AlertTrigger object and a cursor for pagination. */
export type AlertTriggerEdge = {
  __typename?: "AlertTriggerEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertTrigger>;
};

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

/** Represents a Webhook that is used for the purposes of alert notification. */
export type AlertWebhook = Node & {
  __typename?: "AlertWebhook";
  /** Specifies whether the signed-in User can remove the AlertWebhook. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the AlertWebhook. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The AlertWebhooks in the AlertGroup */
  groups: AlertGroupConnection;
  /** A JSON string of key/value pairs that will be sent as headers in the Webhook request. */
  headers?: Maybe<Scalars["JSONString"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The AlertWebhooks to call when the AlertMonitor is triggered. */
  monitors: AlertMonitorConnection;
  /** The name of the AlertWebhook. */
  name: Scalars["String"]["output"];
  /** The template that is hydrated and then used as the body of the AlertWebhook request. */
  payloadTemplate: Scalars["String"]["output"];
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The URL of the AlertWebhook. */
  url: Scalars["String"]["output"];
};

/** Represents a Webhook that is used for the purposes of alert notification. */
export type AlertWebhookGroupsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertGroupOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertGroupOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/** Represents a Webhook that is used for the purposes of alert notification. */
export type AlertWebhookMonitorsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  triggers_IsGlobal?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/** Represents a Relay Connection to a collection of AlertWebhook objects. */
export type AlertWebhookConnection = {
  __typename?: "AlertWebhookConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AlertWebhookEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AlertWebhook>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related AlertWebhook object and a cursor for pagination. */
export type AlertWebhookEdge = {
  __typename?: "AlertWebhookEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<AlertWebhook>;
};

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
export type Attachment = {
  __typename?: "Attachment";
  /** The name of the Attachment. */
  name: Scalars["String"]["output"];
  /** The URL where the Attachment is located. */
  url: Scalars["String"]["output"];
};

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

/** Represents a type of object to which permissions may be assigned. */
export type AuthObjectType = Node & {
  __typename?: "AuthObjectType";
  /** Specifies whether the signed-in User can remove the AuthObjectType. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the AuthObjectType. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Name of the AuthObjectType. */
  name: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of AuthObjectType objects. */
export type AuthObjectTypeConnection = {
  __typename?: "AuthObjectTypeConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AuthObjectTypeEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AuthObjectType>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related AuthObjectType object and a cursor for pagination. */
export type AuthObjectTypeEdge = {
  __typename?: "AuthObjectTypeEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<AuthObjectType>;
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

/**
 * DEPRECATED. Represents a type of authorization that may be used to authorize an
 * interaction with an external resource by a Component Action.
 */
export type AuthorizationMethod = Node & {
  __typename?: "AuthorizationMethod";
  /** Specifies whether the signed-in User can remove the AuthorizationMethod. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the AuthorizationMethod. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Additional notes about the AuthorizationMethod. */
  description: Scalars["String"]["output"];
  /** The AuthorizationMethod that the CredentialField is associated to. */
  fields: CredentialFieldConnection;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** A string which uniquely identifies the AuthorizationMethod. */
  key: Scalars["String"]["output"];
  /** The name of the AuthorizationMethod. */
  label: Scalars["String"]["output"];
};

/**
 * DEPRECATED. Represents a type of authorization that may be used to authorize an
 * interaction with an external resource by a Component Action.
 */
export type AuthorizationMethodFieldsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents a Relay Connection to a collection of AuthorizationMethod objects. */
export type AuthorizationMethodConnection = {
  __typename?: "AuthorizationMethodConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<AuthorizationMethodEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<AuthorizationMethod>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related AuthorizationMethod object and a cursor for pagination. */
export type AuthorizationMethodEdge = {
  __typename?: "AuthorizationMethodEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<AuthorizationMethod>;
};

export type BulkDisableInstancesUsingConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ScopedConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type BulkDisableInstancesUsingConnectionPayload = {
  __typename?: "BulkDisableInstancesUsingConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
};

export type BulkDisableInstancesUsingCustomerConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type BulkDisableInstancesUsingCustomerConnectionPayload = {
  __typename?: "BulkDisableInstancesUsingCustomerConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  errors: Array<ErrorType>;
};

export type BulkUpdateInstancesToLatestIntegrationVersionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type BulkUpdateInstancesToLatestIntegrationVersionPayload = {
  __typename?: "BulkUpdateInstancesToLatestIntegrationVersionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type ChangePasswordInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The current password. */
  currentPassword: Scalars["String"]["input"];
  /** The new password. */
  newPassword: Scalars["String"]["input"];
};

export type ChangePasswordPayload = {
  __typename?: "ChangePasswordPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

export type ClearAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertMonitor to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ClearAlertMonitorPayload = {
  __typename?: "ClearAlertMonitorPayload";
  alertMonitor?: Maybe<AlertMonitor>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
};

export type ClearAllFifoDataInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Flow config ID to clear all FIFO data for */
  flowConfigId: Scalars["ID"]["input"];
};

export type ClearAllFifoDataPayload = {
  __typename?: "ClearAllFifoDataPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type ClearFifoWorkingSetInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Flow config ID to clear working set for */
  flowConfigId: Scalars["ID"]["input"];
};

export type ClearFifoWorkingSetPayload = {
  __typename?: "ClearFifoWorkingSetPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type ClearRetryScheduleInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Number of retries to remove from the front of the schedule */
  count: Scalars["Int"]["input"];
};

export type ClearRetrySchedulePayload = {
  __typename?: "ClearRetrySchedulePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type Component = Node & {
  __typename?: "Component";
  /** The Component to which this Action is associated. */
  actions: ActionConnection;
  /** Specifies whether the signed-in User can manage Attachments related to this record. */
  allowManageAttachments?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether the signed-in User can remove the Component. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Component. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** A JSON list of objects where each object has a key for name and URL that together describe the Attachment. */
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  /** A string that specifies the category of the Component. */
  category?: Maybe<Scalars["String"]["output"]>;
  /** The Component to which this Connection is associated. */
  connections: ConnectionConnection;
  /** The Customer the Component belongs to, if any. If this is NULL then the Component belongs to the Organization. */
  customer?: Maybe<Customer>;
  /** Additional notes about the Component. */
  description: Scalars["String"]["output"];
  /** The URL associated with the documentation of a Component. */
  documentationUrl?: Maybe<Scalars["String"]["output"]>;
  /** Specifies whether the Component was created inline as part of a Code Native Integration. */
  forCodeNativeIntegration: Scalars["Boolean"]["output"];
  /** The URL that specifies where the Component icon exists. */
  iconUrl?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** A string that uniquely identifies the Component. */
  key: Scalars["String"]["output"];
  /** The name of the Component. */
  label: Scalars["String"]["output"];
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars["String"]["output"]>>;
  /** Specifies whether the Component is publicly available or whether it's private to the Organization. */
  public: Scalars["Boolean"]["output"];
  /** A combination of the Component label, Component description, and every Action label and Action description for the Component to be used for searching. */
  searchTerms?: Maybe<Scalars["String"]["output"]>;
  /** The hex-encoded SHA1 hash of the uploaded Component package. */
  signature: Scalars["String"]["output"];
  /** The URL that specifies where the Component source code bundle exists, if it is available. */
  sourceDownloadUrl?: Maybe<Scalars["String"]["output"]>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars["Boolean"]["output"]>;
  /** Object data at specified version */
  versionAt?: Maybe<Component>;
  /** Additional attributes that are specific to this version. */
  versionAttributes?: Maybe<Scalars["JSONString"]["output"]>;
  /** Additional comments about this version. */
  versionComment?: Maybe<Scalars["String"]["output"]>;
  /** Timestamp of the creation of this version. */
  versionCreatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User that created this version. */
  versionCreatedBy?: Maybe<User>;
  /** Indicates if the version is available for use. */
  versionIsAvailable: Scalars["Boolean"]["output"];
  /** Marked if this record is the latest version of this sequence. */
  versionIsLatest: Scalars["Boolean"]["output"];
  /** Sequential number identifying this version. */
  versionNumber: Scalars["Int"]["output"];
  /** Sequence of versions of this Component */
  versionSequence: ComponentConnection;
  /** Identifier for this version sequence. */
  versionSequenceId?: Maybe<Scalars["UUID"]["output"]>;
  /** The Versions of the Component that are available. */
  versions?: Maybe<VersionConnection>;
};

/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentActionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  canCallComponentFunctions?: InputMaybe<Scalars["Boolean"]["input"]>;
  component?: InputMaybe<Scalars["ID"]["input"]>;
  dataSourceType?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  filterQuery?: InputMaybe<Scalars["JSONString"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  hasOnInstanceDelete?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOnInstanceDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasWebhookCreateFunction?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasWebhookDeleteFunction?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeForCodeNativeIntegrations?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCommonTrigger?: InputMaybe<Scalars["Boolean"]["input"]>;
  isDataSource?: InputMaybe<Scalars["Boolean"]["input"]>;
  isDetailDataSource?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPollingTrigger?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTrigger?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ActionOrder>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ActionOrder>>>;
};

/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentConnectionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  component?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  hasTemplates?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeForCodeNativeIntegrations?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  oauth2Type?: InputMaybe<Scalars["String"]["input"]>;
  oauth2Type_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  oauth2Type_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ConnectionOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ConnectionOrder>>>;
};

/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentIconUrlArgs = {
  withCache?: InputMaybe<Scalars["Boolean"]["input"]>;
  withRedirect?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentVersionAtArgs = {
  id?: InputMaybe<Scalars["ID"]["input"]>;
  latestAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentVersionSequenceArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  searchTerms_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionCreatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionCreatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/**
 * Represents a package of related functions, or Actions, that can be added to
 * an Integration.
 */
export type ComponentVersionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<VersionOrder>;
};

/** Represents search results for a Component or Action. */
export type ComponentActionSearchResult = Action | Component;

/** Represents a component category. */
export type ComponentCategory = Node & {
  __typename?: "ComponentCategory";
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The name of the Component category. */
  name: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of Component objects. */
export type ComponentConnection = {
  __typename?: "ComponentConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ComponentEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Component>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
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

/** A Relay edge to a related Component object and a cursor for pagination. */
export type ComponentEdge = {
  __typename?: "ComponentEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Component>;
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

/** Represents a Connection that is available on a Component. */
export type Connection = Node & {
  __typename?: "Connection";
  /** Specifies whether the signed-in User can remove the Connection. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Connection. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The URL to the avatar icon for the Connection. */
  avatarIconUrl?: Maybe<Scalars["String"]["output"]>;
  /** Additional notes about the Connection. */
  comments?: Maybe<Scalars["String"]["output"]>;
  /** The Component to which this Connection is associated. */
  component: Component;
  /** Specifies this Connection is the default for the Component. */
  default: Scalars["Boolean"]["output"];
  /** The URL to the Connection's connect icon. */
  iconUrl?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Connection to which this InputField is associated, if any. */
  inputs: InputFieldConnection;
  /** A string which uniquely identifies the Connection in the context of the Action. */
  key: Scalars["String"]["output"];
  /** The name of the Connection. */
  label: Scalars["String"]["output"];
  /** The OAuth2 flow type, if any, for this Connection. */
  oauth2Type?: Maybe<ConnectionOauth2Type>;
  /** If true, this connection can be used with an On-Prem Resource. */
  onPremiseAvailable: Scalars["Boolean"]["output"];
  /** Ordering of the Connection. */
  order?: Maybe<Scalars["Int"]["output"]>;
  /** The Connection from which this template is structured. */
  templates: ConnectionTemplateConnection;
};

/** Represents a Connection that is available on a Component. */
export type ConnectionIconUrlArgs = {
  withCache?: InputMaybe<Scalars["Boolean"]["input"]>;
  withRedirect?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Represents a Connection that is available on a Component. */
export type ConnectionInputsArgs = {
  action?: InputMaybe<Scalars["ID"]["input"]>;
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  shown?: InputMaybe<Scalars["Boolean"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  type_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/** Represents a Connection that is available on a Component. */
export type ConnectionTemplatesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connectionId?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ConnectionTemplateOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ConnectionTemplateOrder>>>;
};

/** Represents a Relay Connection to a collection of Connection objects. */
export type ConnectionConnection = {
  __typename?: "ConnectionConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ConnectionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Connection>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
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

/** A Relay edge to a related Connection object and a cursor for pagination. */
export type ConnectionEdge = {
  __typename?: "ConnectionEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Connection>;
};

export type ConnectionIconUploadUrl = {
  __typename?: "ConnectionIconUploadUrl";
  connectionKey?: Maybe<Scalars["String"]["output"]>;
  iconUploadUrl?: Maybe<Scalars["String"]["output"]>;
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

export type ConnectionTemplate = Node & {
  __typename?: "ConnectionTemplate";
  /** Specifies whether the signed-in User can remove the ConnectionTemplate. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the ConnectionTemplate. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Connection from which this template is structured. */
  connection: Connection;
  /** Indicates template is in use on an Instance. */
  hasDeployedInstances: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The template that this input is associated with. */
  inputFieldTemplates: InputFieldTemplateConnection;
  /** Returns a list of deployed customer instances that are leveraging this template. */
  instances: InstanceConnection;
  /** The name of this template. */
  name: Scalars["String"]["output"];
  /** Returns a list of the keys that are preset by this template. */
  templatedInputKeys?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
};

export type ConnectionTemplateInputFieldTemplatesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ConnectionTemplateInstancesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_ExternalId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  designedBy?: InputMaybe<InstanceDesignedBy>;
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  globalDebug?: InputMaybe<Scalars["Boolean"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  needsDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/** Represents a Relay Connection to a collection of ConnectionTemplate objects. */
export type ConnectionTemplateConnection = {
  __typename?: "ConnectionTemplateConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ConnectionTemplateEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ConnectionTemplate>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related ConnectionTemplate object and a cursor for pagination. */
export type ConnectionTemplateEdge = {
  __typename?: "ConnectionTemplateEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<ConnectionTemplate>;
};

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

export type ConvertLowCodeIntegrationFormResult = {
  __typename?: "ConvertLowCodeIntegrationFormResult";
  conversionErrors?: Maybe<Array<Maybe<LowCodeConversionError>>>;
  headUrl?: Maybe<Scalars["String"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

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

export type ConvertLowCodeIntegrationPayload = {
  __typename?: "ConvertLowCodeIntegrationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  convertLowCodeIntegrationFormResult?: Maybe<ConvertLowCodeIntegrationFormResult>;
  errors: Array<ErrorType>;
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

export type CreateAlertGroupPayload = {
  __typename?: "CreateAlertGroupPayload";
  alertGroup?: Maybe<AlertGroup>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
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

export type CreateAlertMonitorPayload = {
  __typename?: "CreateAlertMonitorPayload";
  alertMonitor?: Maybe<AlertMonitor>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
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

export type CreateAlertWebhookPayload = {
  __typename?: "CreateAlertWebhookPayload";
  alertWebhook?: Maybe<AlertWebhook>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
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

export type CreateConnectionTemplatePayload = {
  __typename?: "CreateConnectionTemplatePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  connectionTemplate?: Maybe<ConnectionTemplate>;
  errors: Array<ErrorType>;
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

export type CreateCustomerConfigVariablePayload = {
  __typename?: "CreateCustomerConfigVariablePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  errors: Array<ErrorType>;
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

export type CreateCustomerCredentialPayload = {
  __typename?: "CreateCustomerCredentialPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

export type CreateCustomerInput = {
  /** Specifies whether this Customer can use the Embedded Designer. */
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Customer. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  /** The labels that are associated with the object. */
  labels?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** The name of the Customer, which must be unique within the scope of its Organization. */
  name: Scalars["String"]["input"];
};

export type CreateCustomerPayload = {
  __typename?: "CreateCustomerPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customer?: Maybe<Customer>;
  errors: Array<ErrorType>;
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

export type CreateCustomerUserPayload = {
  __typename?: "CreateCustomerUserPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
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

export type CreateExternalLogStreamPayload = {
  __typename?: "CreateExternalLogStreamPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  externalLogStream?: Maybe<ExternalLogStream>;
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
  /** This field is deprecated. */
  logsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The name of the Instance. */
  name: Scalars["String"]["input"];
  /** This field is deprecated. */
  stepResultsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CreateInstancePayload = {
  __typename?: "CreateInstancePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export type CreateInstanceProfileInput = {
  /** The amount of memory allocated to the Instance Runner Lambda function. */
  allocatedMemoryMb: Scalars["Int"]["input"];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Additional notes about the Instance Profile. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** The billing type for the Instances that use this Instance Profile. */
  instanceBillingType: Scalars["String"]["input"];
  /** Specifies whether this Instance Profile is the default used when no Instance Profile is explicitly specified during Instance creation. */
  isDefaultProfile?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to disable the creation of logs during Instance execution. */
  logsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The name of the Instance Profile, which must be unique within the scope of its Organization. */
  name: Scalars["String"]["input"];
  /** DEPRECATED: Use quick_start_instances instead. Whether instances using this profile will startup faster when triggered. */
  quickStart?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The number of QuickStart runners reserved for instances using this profile. */
  quickStartInstances?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies whether to disable the creation of step results during Instance execution. */
  stepResultsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CreateInstanceProfilePayload = {
  __typename?: "CreateInstanceProfilePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instanceProfile?: Maybe<InstanceProfile>;
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

export type CreateIntegrationPayload = {
  __typename?: "CreateIntegrationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
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

export type CreateOnPremiseResourceJwtPayload = {
  __typename?: "CreateOnPremiseResourceJWTPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<CreateOnPremiseResourceJwtResult>;
};

export type CreateOnPremiseResourceJwtResult = {
  __typename?: "CreateOnPremiseResourceJWTResult";
  jwt?: Maybe<Scalars["String"]["output"]>;
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

export type CreateOrganizationCredentialPayload = {
  __typename?: "CreateOrganizationCredentialPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

export type CreateOrganizationNewStackInput = {
  /** Email of the user that should be the owner of the new organization. */
  adminEmail: Scalars["String"]["input"];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the organization to create. */
  organizationName: Scalars["String"]["input"];
  /** Name of the Plan Template to use for the Organization's new Plan. */
  planTemplate?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID that is used to link one or more Organization(s) to an account in Salesforce. */
  salesforceId?: InputMaybe<Scalars["String"]["input"]>;
  /** The name of the user we are creating. There is no access to the main production DB to pull this information. */
  userName?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateOrganizationNewStackPayload = {
  __typename?: "CreateOrganizationNewStackPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type CreateOrganizationPlanInput = {
  /** Specifies whether to allow per-Instance configuration of the memory allocated to the Runner Lambda functions for the specified Organization's plan. */
  allowConfiguringInstanceMemory?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows configuration of a Custom Theme for the Organization. */
  allowCustomTheme?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to enable or disable per-Instance configuration of persisting log and step results for the specified Organization's plan. */
  allowDisablingInstanceOutputs?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows for Customers of the Organization to use the Embedded Designer. */
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows for Customers of the Organization to use the Embedded Workflow Builder. */
  allowEmbeddedWorkflowBuilder?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows configuration for automatic retry of Instance executions. */
  allowExecutionRetry?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows for Long Running Executions. */
  allowLongRunningExecutions?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows for using the On Prem Agent system. */
  allowOnPremAgent?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows for creating User Level Configured Instances. */
  allowUserLevelConfig?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Billing Metric to use for billing the Organization under the Plan. */
  billedBy?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Force Organization to use the new Enterprise Plan even if one already exists. */
  force?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies the available choices to use for Instance billing. */
  instanceBillingTypes?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** Global ID of Organization for which to create a Plan. */
  orgId: Scalars["ID"]["input"];
  /** Name of the Plan Template to use for the Organization's new Plan. */
  planTemplate: Scalars["String"]["input"];
  /** The ID that is used to link one or more Organization(s) to an account in Salesforce. */
  salesforceId?: InputMaybe<Scalars["String"]["input"]>;
  /** Number of days to allow the Organization to use the Plan before expiration. */
  trialPeriodDays?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CreateOrganizationPlanPayload = {
  __typename?: "CreateOrganizationPlanPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type CreateOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateOrganizationSigningKeyPayload = {
  __typename?: "CreateOrganizationSigningKeyPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<CreateOrganizationSigningKeyResult>;
};

export type CreateOrganizationSigningKeyResult = {
  __typename?: "CreateOrganizationSigningKeyResult";
  privateKey?: Maybe<Scalars["String"]["output"]>;
  signingKey?: Maybe<OrganizationSigningKey>;
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

export type CreateOrganizationUserPayload = {
  __typename?: "CreateOrganizationUserPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

export type CreateScopedConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Connection to which this variable is associated. */
  connection: Scalars["ID"]["input"];
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
  /** The stable key for referencing this variable from Integrations. Cannot change after setting. */
  stableKey: Scalars["String"]["input"];
  /** Specifies the scope of the variable. */
  variableScope: Scalars["String"]["input"];
};

export type CreateScopedConfigVariablePayload = {
  __typename?: "CreateScopedConfigVariablePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
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

export type CreateTestCasePayload = {
  __typename?: "CreateTestCasePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  testCase?: Maybe<TestCase>;
};

export type CreateUserLevelConfigInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Instance with which the User Level Config is associated. */
  instance: Scalars["ID"]["input"];
};

export type CreateUserLevelConfigPayload = {
  __typename?: "CreateUserLevelConfigPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  userLevelConfig?: Maybe<UserLevelConfig>;
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

export type CreateWebhookEndpointPayload = {
  __typename?: "CreateWebhookEndpointPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  webhookEndpoint?: Maybe<WebhookEndpoint>;
};

/**
 * DEPRECATED. Represents a collection of fields and an AuthorizationMethod that together
 * specify a complete set of data necessary for interaction with an external
 * resource by a Component Action as part of an Integration.
 */
export type Credential = Node & {
  __typename?: "Credential";
  /** Specifies whether the signed-in User can remove the Credential. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Credential. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Contains any error message generated by the external authorizing system that occurred during authorization. */
  authorizationError: Scalars["String"]["output"];
  /** The specific AuthorizationMethod used by the Credential. */
  authorizationMethod: AuthorizationMethod;
  /** Contains OAuth2 context data if applicable. */
  context?: Maybe<Scalars["JSONString"]["output"]>;
  /** The Customer the Credential belongs to, if any. If NULL then Organization will be specified. */
  customer?: Maybe<Customer>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The name of the Credential. */
  label: Scalars["String"]["output"];
  /** The Organization the Credential belongs to, if any. If NULL then Customer will be specified. */
  org?: Maybe<Organization>;
  /** Specifies whether the Credential is ready for use by an Instance. */
  readyForUse: Scalars["Boolean"]["output"];
  /** Contains the OAuth2 Redirect URI if applicable. */
  redirectUri?: Maybe<Scalars["String"]["output"]>;
  /** The timestamp at which the OAuth2 token will automatically be refreshed, if necessary. Only applies to OAuth2 methods where refresh is necessary. */
  refreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Contains OAuth2 token data if applicable. */
  token?: Maybe<Scalars["JSONString"]["output"]>;
  /** A list of CredentialFieldValues that contain the values for the CredentialFields. */
  values?: Maybe<Array<Maybe<CredentialFieldValue>>>;
};

/** Represents a Relay Connection to a collection of Credential objects. */
export type CredentialConnection = {
  __typename?: "CredentialConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CredentialEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Credential>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related Credential object and a cursor for pagination. */
export type CredentialEdge = {
  __typename?: "CredentialEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Credential>;
};

/** Represents a specific field on a Credential. */
export type CredentialField = Node & {
  __typename?: "CredentialField";
  /** Specifies whether the signed-in User can remove the CredentialField. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the CredentialField. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The AuthorizationMethod that the CredentialField is associated to. */
  authorizationMethod: AuthorizationMethod;
  /** Additional notes about the CredentialField. */
  comments: Scalars["String"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** A string which uniquely identifies the CredentialField in the context of the AuthorizationMethod. */
  key: Scalars["String"]["output"];
  /** The name of the CredentialField. */
  label: Scalars["String"]["output"];
  /** Placeholder text that will appear in the CredentialField UI. */
  placeholder: Scalars["String"]["output"];
  /** Specifies whether the CredentialField requires a value to be valid. */
  required: Scalars["Boolean"]["output"];
  /** Specifies the data type of the value for the CredentialField. */
  type: CredentialFieldType;
};

/** Represents a Relay Connection to a collection of CredentialField objects. */
export type CredentialFieldConnection = {
  __typename?: "CredentialFieldConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CredentialFieldEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<CredentialField>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related CredentialField object and a cursor for pagination. */
export type CredentialFieldEdge = {
  __typename?: "CredentialFieldEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<CredentialField>;
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

/** Represents a specific value of a CredentialField. */
export type CredentialFieldValue = {
  __typename?: "CredentialFieldValue";
  /** The name associated with the CredentialField. */
  key: Scalars["String"]["output"];
  /** The value of the CredentialField. */
  value?: Maybe<Scalars["String"]["output"]>;
};

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

/** Represents a Relay Connection to a collection of User Level Config Variable objects. */
export type CustomUserLevelConfigVariableConnection = {
  __typename?: "CustomUserLevelConfigVariableConnection";
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<CustomUserLevelConfigVariableEdge>>;
  /** List of nodes in this connection */
  nodes: Array<Maybe<UserLevelConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of config variables */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge containing a `CustomUserLevelConfigVariable` and its cursor. */
export type CustomUserLevelConfigVariableEdge = {
  __typename?: "CustomUserLevelConfigVariableEdge";
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<UserLevelConfigVariable>;
};

/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type Customer = Node & {
  __typename?: "Customer";
  /** Specifies whether the signed-in User can add an Alert Monitor to the Customer. */
  allowAddAlertMonitor: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a Component to the Customer. */
  allowAddComponent: Scalars["Boolean"]["output"];
  /** DEPRECATED. Specifies whether the signed-in User can add a Credential to the Customer. */
  allowAddCredential: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a Customer Config Variable to the Customer. */
  allowAddCustomerConfigVariable: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add an Instance to the Customer. */
  allowAddInstance: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add an Integration to the Customer. */
  allowAddIntegration: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a User to the Customer. */
  allowAddUser: Scalars["Boolean"]["output"];
  /** DEPRECATED. Specifies whether the signed-in User's Customer has access to legacy Credentials. */
  allowConfigureCredentials: Scalars["Boolean"]["output"];
  /** Specifies whether this Customer can use the Embedded Designer. */
  allowEmbeddedDesigner: Scalars["Boolean"]["output"];
  /** Specifies whether this Customer can use the Embedded Workflow Builder. */
  allowEmbeddedWorkflowBuilder: Scalars["Boolean"]["output"];
  /** Specifies whether Instances may be enabled based on the utilization allowed by the current Plan. */
  allowEnableInstance: Scalars["Boolean"]["output"];
  /** Specifies whether Instances may be executed based on the utilization allowed by the current Plan. */
  allowExecuteInstance: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can manage Attachments related to this record. */
  allowManageAttachments?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether the signed-in User can remove the Customer. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Customer. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** A JSON list of objects where each object has a key for name and URL that together describe the Attachment. */
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  /** The URL for the avatar image. */
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  /** The Customer the Component belongs to, if any. If this is NULL then the Component belongs to the Organization. */
  components: ComponentConnection;
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The Customer the Credential belongs to, if any. If NULL then Organization will be specified. */
  credentials: CredentialConnection;
  /** Additional notes about the Customer. */
  description: Scalars["String"]["output"];
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Customer for which the Instance is deployed. */
  instances: InstanceConnection;
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  integrations: IntegrationConnection;
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars["String"]["output"]>>;
  /** The name of the Customer, which must be unique within the scope of its Organization. */
  name: Scalars["String"]["output"];
  /** The Organization to which the Customer belongs. */
  org: Organization;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars["Boolean"]["output"]>;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The Customer the user belongs to, if any. If this is NULL then Organization will be specified. */
  users: UserConnection;
};

/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerComponentsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  filterQuery?: InputMaybe<Scalars["JSONString"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  hasActions?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasCommonTriggers?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasConnectionTemplates?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasConnections?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasDataSources?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasDataSourcesOfType?: InputMaybe<Scalars["String"]["input"]>;
  hasOauth2Connections?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasSimpleConnections?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasTriggers?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeComponentsForCodeNativeIntegrations?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  searchTerms_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionCreatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionCreatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerCredentialsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  authorizationMethod_Key?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CredentialOrder>;
  readyForUse?: InputMaybe<Scalars["Boolean"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CredentialOrder>>>;
};

/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerInstancesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  compatibility?: InputMaybe<Scalars["Int"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_ExternalId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  designedBy?: InputMaybe<InstanceDesignedBy>;
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  globalDebug?: InputMaybe<Scalars["Boolean"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  needsDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerIntegrationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flows_IsAgentFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOutdatedComponents?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasUnpublishedChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCodeNative?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  marketplace?: InputMaybe<Scalars["Boolean"]["input"]>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/**
 * Represents a customer, which is an object that allows for logical
 * separation of Users, Instances, and other data that are specific to a
 * particular deployment of the Organization's product(s).
 */
export type CustomerUsersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  email_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  externalId_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  includeMarketplaceUsers?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type CustomerConfigVariable = Node & {
  __typename?: "CustomerConfigVariable";
  /** Specifies whether the signed-in User can remove the CustomerConfigVariable. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the CustomerConfigVariable. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Authorize URL of this Config Variable if associated with an OAuth 2.0 Connection. */
  authorizeUrl?: Maybe<Scalars["String"]["output"]>;
  /** The Customer with which this Config Variable is associated. */
  customer?: Maybe<Customer>;
  /** Indicates this config variable is in use on an Instance. */
  hasDeployedInstances: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The collection of Expressions that serve as inputs to this variable. */
  inputs?: Maybe<ExpressionConnection>;
  /** Returns a list of Instances using this config variable. */
  instances: InstanceConnection;
  /** Returns a list of Integrations using this config variable. */
  integrations: IntegrationConnection;
  /** Indicates that this config variable is currently in use by at least one Instance or Integration version. */
  isInUse: Scalars["Boolean"]["output"];
  /** Specifies whether this Config Variable is meant for testing. */
  isTest: Scalars["Boolean"]["output"];
  /** The display name of this variable. */
  key?: Maybe<Scalars["String"]["output"]>;
  /** The timestamp of the most recent inputs reconfiguration. */
  lastConfiguredAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The timestamp of the last successful OAuth2 token refresh. */
  lastSuccessfulRefreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The CustomerConfigVariable which relates to the Log entry. */
  logs: LogConnection;
  /** Contains arbitrary metadata about this variable. */
  meta?: Maybe<Scalars["JSONString"]["output"]>;
  /** The timestamp at which the OAuth2 token will automatically be refreshed, if necessary. Only applies to OAuth2 methods where refresh is necessary. */
  refreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The Scoped Config Variable with which this Config Variable is associated. */
  scopedConfigVariable: ScopedConfigVariable;
  /** Status indicating if this Connection is working as expected or encountering issues. */
  status?: Maybe<CustomerConfigVariableStatus>;
  /** Returns a list of Workflows using this config variable. */
  workflows: WorkflowConnection;
};

export type CustomerConfigVariableAuthorizeUrlArgs = {
  newSession?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CustomerConfigVariableInputsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CustomerConfigVariableInstancesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_ExternalId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  designedBy?: InputMaybe<InstanceDesignedBy>;
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  globalDebug?: InputMaybe<Scalars["Boolean"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  needsDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type CustomerConfigVariableIntegrationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flows_IsAgentFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOutdatedComponents?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasUnpublishedChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCodeNative?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  marketplace?: InputMaybe<Scalars["Boolean"]["input"]>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type CustomerConfigVariableLogsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  configVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customerConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult_IsTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integrationVersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  logType?: InputMaybe<Scalars["String"]["input"]>;
  logType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  message_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<LogOrder>;
  requiredConfigVariableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  severity?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CustomerConfigVariableWorkflowsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  draft?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkflowOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<WorkflowOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/** Represents a Relay Connection to a collection of CustomerConfigVariable objects. */
export type CustomerConfigVariableConnection = {
  __typename?: "CustomerConfigVariableConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CustomerConfigVariableEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<CustomerConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related CustomerConfigVariable object and a cursor for pagination. */
export type CustomerConfigVariableEdge = {
  __typename?: "CustomerConfigVariableEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<CustomerConfigVariable>;
};

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

/** Represents a Relay Connection to a collection of Customer objects. */
export type CustomerConnection = {
  __typename?: "CustomerConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CustomerEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Customer>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related Customer object and a cursor for pagination. */
export type CustomerEdge = {
  __typename?: "CustomerEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Customer>;
};

/** Allows specifying which field and direction to order by. */
export type CustomerOrder = {
  /** The direction to order by. */
  direction: OrderDirection;
  /** The field to order by. */
  field: CustomerOrderField;
};

/** Represents the fields by which collections of the related type may be ordered. */
export enum CustomerOrderField {
  CreatedAt = "CREATED_AT",
  Description = "DESCRIPTION",
  Name = "NAME",
  UpdatedAt = "UPDATED_AT",
}

/** Represents snapshots of total utilization metrics for a Customer. */
export type CustomerTotalUsageMetrics = Node & {
  __typename?: "CustomerTotalUsageMetrics";
  /** Specifies whether the signed-in User can remove the CustomerTotalUsageMetrics. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the CustomerTotalUsageMetrics. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The total number of Workflows that have been created. */
  createdWorkflowCount: Scalars["Int"]["output"];
  /** The Customer for which utilization metrics are being collected. */
  customer: Customer;
  /** The total number of Instances that are deployed. */
  deployedInstanceCount: Scalars["Int"]["output"];
  /** The total number of unique Integrations that are deployed. */
  deployedUniqueIntegrationCount: Scalars["Int"]["output"];
  /** The total number of Workflows that are enabled. */
  enabledWorkflowCount: Scalars["Int"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The time the utilization metrics snapshot was created. */
  snapshotTime: Scalars["DateTime"]["output"];
  /** The total number of Users that currently exist. */
  userCount: Scalars["Int"]["output"];
};

/** Represents a Relay Connection to a collection of CustomerTotalUsageMetrics objects. */
export type CustomerTotalUsageMetricsConnection = {
  __typename?: "CustomerTotalUsageMetricsConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<CustomerTotalUsageMetricsEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<CustomerTotalUsageMetrics>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related CustomerTotalUsageMetrics object and a cursor for pagination. */
export type CustomerTotalUsageMetricsEdge = {
  __typename?: "CustomerTotalUsageMetricsEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<CustomerTotalUsageMetrics>;
};

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

export type DeleteAlertGroupPayload = {
  __typename?: "DeleteAlertGroupPayload";
  alertGroup?: Maybe<AlertGroup>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
};

export type DeleteAlertMonitorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertMonitor to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteAlertMonitorPayload = {
  __typename?: "DeleteAlertMonitorPayload";
  alertMonitor?: Maybe<AlertMonitor>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
};

export type DeleteAlertWebhookInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the AlertWebhook to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteAlertWebhookPayload = {
  __typename?: "DeleteAlertWebhookPayload";
  alertWebhook?: Maybe<AlertWebhook>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
};

export type DeleteComponentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Component to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteComponentPayload = {
  __typename?: "DeleteComponentPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  component?: Maybe<Component>;
  errors: Array<ErrorType>;
};

export type DeleteConnectionTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ConnectionTemplate to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteConnectionTemplatePayload = {
  __typename?: "DeleteConnectionTemplatePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  connectionTemplate?: Maybe<ConnectionTemplate>;
  errors: Array<ErrorType>;
};

export type DeleteCredentialInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Credential to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteCredentialPayload = {
  __typename?: "DeleteCredentialPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

export type DeleteCustomerConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteCustomerConfigVariablePayload = {
  __typename?: "DeleteCustomerConfigVariablePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  errors: Array<ErrorType>;
};

export type DeleteCustomerInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Customer to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteCustomerPayload = {
  __typename?: "DeleteCustomerPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customer?: Maybe<Customer>;
  errors: Array<ErrorType>;
};

export type DeleteExternalLogStreamInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ExternalLogStream to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteExternalLogStreamPayload = {
  __typename?: "DeleteExternalLogStreamPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  externalLogStream?: Maybe<ExternalLogStream>;
};

export type DeleteInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteInstancePayload = {
  __typename?: "DeleteInstancePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export type DeleteInstanceProfileInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceProfile to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteInstanceProfilePayload = {
  __typename?: "DeleteInstanceProfilePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instanceProfile?: Maybe<InstanceProfile>;
};

export type DeleteIntegrationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteIntegrationPayload = {
  __typename?: "DeleteIntegrationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type DeleteIntegrationTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WorkflowTemplate to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteIntegrationTemplatePayload = {
  __typename?: "DeleteIntegrationTemplatePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integrationTemplate?: Maybe<WorkflowTemplate>;
};

export type DeleteOnPremiseResourceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the OnPremiseResource to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteOnPremiseResourcePayload = {
  __typename?: "DeleteOnPremiseResourcePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  onPremiseResource?: Maybe<OnPremiseResource>;
};

export type DeleteOrganizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Organization to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteOrganizationPayload = {
  __typename?: "DeleteOrganizationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  organization?: Maybe<Organization>;
};

export type DeleteOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the OrganizationSigningKey to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteOrganizationSigningKeyPayload = {
  __typename?: "DeleteOrganizationSigningKeyPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  organizationSigningKey?: Maybe<OrganizationSigningKey>;
};

export type DeleteScopedConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ScopedConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteScopedConfigVariablePayload = {
  __typename?: "DeleteScopedConfigVariablePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
};

export type DeleteTestCaseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the TestCase to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteTestCasePayload = {
  __typename?: "DeleteTestCasePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  testCase?: Maybe<TestCase>;
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

export type DeleteUserLevelConfigPayload = {
  __typename?: "DeleteUserLevelConfigPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  userLevelConfig?: Maybe<UserLevelConfig>;
};

export type DeleteUserPayload = {
  __typename?: "DeleteUserPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
};

export type DeleteWebhookEndpointInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WebhookEndpoint to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteWebhookEndpointPayload = {
  __typename?: "DeleteWebhookEndpointPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  webhookEndpoint?: Maybe<WebhookEndpoint>;
};

export type DeleteWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteWorkflowPayload = {
  __typename?: "DeleteWorkflowPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type DeleteWorkflowTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WorkflowTemplate to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeleteWorkflowTemplatePayload = {
  __typename?: "DeleteWorkflowTemplatePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integrationTemplate?: Maybe<WorkflowTemplate>;
};

export type DeployInstanceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** When true, will deploy the instance, ignoring certain validation rules that would normally prevent deployment. */
  force?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The ID of the Instance to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DeployInstancePayload = {
  __typename?: "DeployInstancePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export enum DeployedInstancesQuantity {
  Multiple = "MULTIPLE",
  One = "ONE",
  Zero = "ZERO",
}

export type DisableOrganizationAccessInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Organization that the User belongs to, if any. If this is NULL then Customer will be specified. */
  orgId: Scalars["ID"]["input"];
};

export type DisableOrganizationAccessPayload = {
  __typename?: "DisableOrganizationAccessPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type DisableOrganizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Global ID of Organization to switch to (case insensitive) */
  orgId: Scalars["ID"]["input"];
};

export type DisableOrganizationPayload = {
  __typename?: "DisableOrganizationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type DisableWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisableWorkflowPayload = {
  __typename?: "DisableWorkflowPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

export type DisconnectConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisconnectConnectionPayload = {
  __typename?: "DisconnectConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instanceConfigVariable?: Maybe<InstanceConfigVariable>;
};

export type DisconnectCustomerConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisconnectCustomerConnectionPayload = {
  __typename?: "DisconnectCustomerConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  errors: Array<ErrorType>;
};

export type DisconnectScopedConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the ScopedConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisconnectScopedConnectionPayload = {
  __typename?: "DisconnectScopedConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
};

export type DisconnectUserLevelConnectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the UserLevelConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DisconnectUserLevelConnectionPayload = {
  __typename?: "DisconnectUserLevelConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  userLevelConfigVariable?: Maybe<UserLevelConfigVariable>;
};

export type Embedded = {
  __typename?: "Embedded";
  /** Customized names for branded elements. */
  brandedElements: Scalars["JSONString"]["output"];
  /** Set of Components required to be used in Embedded built Integrations. */
  requiredComponents: ComponentConnection;
};

export type EmbeddedRequiredComponentsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  searchTerms_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionCreatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionCreatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type EnableOrganizationAccessInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Organization that the User belongs to, if any. If this is NULL then Customer will be specified. */
  orgId: Scalars["ID"]["input"];
};

export type EnableOrganizationAccessPayload = {
  __typename?: "EnableOrganizationAccessPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type EnableOrganizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Global ID of Organization to switch to (case insensitive) */
  orgId: Scalars["ID"]["input"];
};

export type EnableOrganizationPayload = {
  __typename?: "EnableOrganizationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type EnableWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type EnableWorkflowPayload = {
  __typename?: "EnableWorkflowPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
};

/** Enum representing reasons why an integration cannot be enabled. */
export enum EnablementBlocker {
  ReferencesDeletedConnection = "REFERENCES_DELETED_CONNECTION",
}

export type ErrorType = {
  __typename?: "ErrorType";
  field: Scalars["String"]["output"];
  messages: Array<Scalars["String"]["output"]>;
};

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

/** Represents an expression that is used to reference Configuration Variables and results from previous steps. */
export type Expression = Node & {
  __typename?: "Expression";
  /** Specifies whether the signed-in User can remove the Expression. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Expression. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Indicates presence of a non-empty value. */
  hasValue: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** An object that contains arbitrary meta data about an Expression. */
  meta?: Maybe<Scalars["JSONString"]["output"]>;
  /** The name of the Expression. */
  name: Scalars["String"]["output"];
  /** The type of the Expression. */
  type: ExpressionType;
  /** The value of the Expression unless the input is configured as write-only. */
  value: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of Expression objects. */
export type ExpressionConnection = {
  __typename?: "ExpressionConnection";
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ExpressionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Expression>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge containing a `Expression` and its cursor. */
export type ExpressionEdge = {
  __typename?: "ExpressionEdge";
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<Expression>;
};

export enum ExpressionType {
  Complex = "COMPLEX",
  Configvar = "CONFIGVAR",
  Reference = "REFERENCE",
  Template = "TEMPLATE",
  Value = "VALUE",
}

/**
 * Represents a configuration that specifies the details of an external system
 * that is used to ingest log messages generated by Instance Executions.
 */
export type ExternalLogStream = Node & {
  __typename?: "ExternalLogStream";
  /** Specifies whether the signed-in User can remove the ExternalLogStream. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the ExternalLogStream. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** A JSON string of key/value pairs that will be sent as headers in the ExternalLogStream request. */
  headers?: Maybe<Scalars["JSONString"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Name of the ExternalLogStream. */
  name: Scalars["String"]["output"];
  /** The template that is hydrated and then used as the body of the ExternalLogStream request. */
  payloadTemplate: Scalars["String"]["output"];
  /** The Log severity levels for which Logs should be sent to the ExternalLogStream. */
  severityLevels: Array<Maybe<LogSeverity>>;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The URL of the ExternalLogStream. */
  url: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of ExternalLogStream objects. */
export type ExternalLogStreamConnection = {
  __typename?: "ExternalLogStreamConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ExternalLogStreamEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ExternalLogStream>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related ExternalLogStream object and a cursor for pagination. */
export type ExternalLogStreamEdge = {
  __typename?: "ExternalLogStreamEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<ExternalLogStream>;
};

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

export type FetchConfigWizardPageContentPayload = {
  __typename?: "FetchConfigWizardPageContentPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  fetchConfigWizardPageContentResult?: Maybe<FetchConfigWizardPageContentResult>;
};

/** Result of fetching Config Wizard Page content. */
export type FetchConfigWizardPageContentResult = {
  __typename?: "FetchConfigWizardPageContentResult";
  /** The JSON string that contains a map of Config Var key to content for the widget for the associated Config Var. */
  content?: Maybe<Scalars["JSONString"]["output"]>;
  /** The Instance for which Config Page content was fetched. */
  instance?: Maybe<Instance>;
  /** The name of the Configuration Page for which content was fetched. */
  pageName?: Maybe<Scalars["String"]["output"]>;
  /** Scoped Config Variables referenced by config variables on this page. */
  scopedConfigVariables?: Maybe<ScopedConfigVariableConnection>;
};

/** Result of fetching Config Wizard Page content. */
export type FetchConfigWizardPageContentResultScopedConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  includeCustomer?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  managedBy?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ScopedConfigVariableOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ScopedConfigVariableOrder>>>;
  stableKey?: InputMaybe<Scalars["String"]["input"]>;
  stableKey_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  variableScope?: InputMaybe<Scalars["String"]["input"]>;
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

export type FetchDataSourceContentPayload = {
  __typename?: "FetchDataSourceContentPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  fetchDataSourceContentResult?: Maybe<FetchDataSourceContentResult>;
};

/** Result of fetching content for a single Data Source in the context of an Instance. */
export type FetchDataSourceContentResult = {
  __typename?: "FetchDataSourceContentResult";
  /** The JSON string that contains the content for the specified Data Source. */
  content?: Maybe<Scalars["JSONString"]["output"]>;
  /** The Data Source for which to fetch content. */
  dataSource?: Maybe<Action>;
  /** The Instance that is used as the context when fetching content for the specified Data Source. */
  instance?: Maybe<Instance>;
};

export type FifoQueueStats = {
  __typename?: "FifoQueueStats";
  /** The flow config global ID */
  flowConfigId?: Maybe<Scalars["ID"]["output"]>;
  /** Number of items in the queue */
  queueLength?: Maybe<Scalars["Int"]["output"]>;
  /** Execution global IDs currently in the working set */
  workingSetItems?: Maybe<Array<Maybe<Scalars["ID"]["output"]>>>;
  /** Number of items in the working set */
  workingSetSize?: Maybe<Scalars["Int"]["output"]>;
};

export type FindPaidOrganizationsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
};

export type FindPaidOrganizationsPayload = {
  __typename?: "FindPaidOrganizationsPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<OrgSearchResult>;
};

export type FindUserByEmailInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The email of the user. */
  userEmail: Scalars["String"]["input"];
};

export type FindUserByEmailPayload = {
  __typename?: "FindUserByEmailPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<FindUserResult>;
};

export type FindUserResult = {
  __typename?: "FindUserResult";
  orgId?: Maybe<Scalars["String"]["output"]>;
  userId?: Maybe<Scalars["String"]["output"]>;
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

export type ForkIntegrationPayload = {
  __typename?: "ForkIntegrationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type HotRequestIdsResult = {
  __typename?: "HotRequestIdsResult";
  count?: Maybe<Scalars["Int"]["output"]>;
  /** UUID of the IntegrationFlow involved in this request, if we have enough info to know it */
  flowId?: Maybe<Scalars["String"]["output"]>;
  /** Name of the IntegrationFlow involved in this request, if we have enough info to know it */
  flowName?: Maybe<Scalars["String"]["output"]>;
  /** UUID of the Instance involved in this request */
  instanceId?: Maybe<Scalars["String"]["output"]>;
  /** Name of the Instance involved in this request */
  instanceName?: Maybe<Scalars["String"]["output"]>;
  /** UUID of the Integration involved in this request */
  integrationId?: Maybe<Scalars["String"]["output"]>;
  /** Name of the Integration involved in this request */
  integrationName?: Maybe<Scalars["String"]["output"]>;
  /** Name of the Organization associated with this request */
  orgName?: Maybe<Scalars["String"]["output"]>;
  /** UUID of the record associated with the request */
  recordId?: Maybe<Scalars["UUID"]["output"]>;
  /** The type of request id */
  recordType?: Maybe<Scalars["String"]["output"]>;
  requestId: Scalars["String"]["output"];
  /** UUID of the Tenant associated with this request id */
  tenantId?: Maybe<Scalars["UUID"]["output"]>;
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

export type ImportIntegrationPayload = {
  __typename?: "ImportIntegrationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type ImportIntegrationTemplateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The YAML serialized definition of the IntegrationTemplate. */
  definition: Scalars["String"]["input"];
};

export type ImportIntegrationTemplatePayload = {
  __typename?: "ImportIntegrationTemplatePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  importResult?: Maybe<ImportIntegrationTemplateResult>;
};

export type ImportIntegrationTemplateResult = {
  __typename?: "ImportIntegrationTemplateResult";
  iconUploadUrl?: Maybe<Scalars["String"]["output"]>;
  integrationTemplate?: Maybe<IntegrationTemplate>;
};

export type ImportOrganizationSigningKeyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Public key of the Signing Keypair. */
  publicKey: Scalars["String"]["input"];
};

export type ImportOrganizationSigningKeyPayload = {
  __typename?: "ImportOrganizationSigningKeyPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  organizationSigningKey?: Maybe<OrganizationSigningKey>;
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

export type ImportWorkflowPayload = {
  __typename?: "ImportWorkflowPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  workflow?: Maybe<Workflow>;
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

/**
 * Represents an input field for a Component Action. Defines the basic
 * properties that must be satisfied by the input data.
 */
export type InputField = Node & {
  __typename?: "InputField";
  /** The Action to which this InputField is associated, if any. */
  action?: Maybe<Action>;
  /** Specifies whether the signed-in User can remove the InputField. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the InputField. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Specifies the type of collection to use for storing input values, if applicable. */
  collection?: Maybe<InputFieldCollection>;
  /** Additional notes about the InputField. */
  comments?: Maybe<Scalars["String"]["output"]>;
  /** The Connection to which this InputField is associated, if any. */
  connection?: Maybe<Connection>;
  /** The Data Source from which the value of this InputField can be supplied. */
  dataSource?: Maybe<Action>;
  /** The default value for the InputField. */
  default?: Maybe<Scalars["JSONOrString"]["output"]>;
  /** Example valid input for the InputField. */
  example?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** A string which uniquely identifies the InputField in the context of the Action. */
  key: Scalars["String"]["output"];
  /** Label used for the Keys of a 'keyvaluelist' collection. */
  keyLabel?: Maybe<Scalars["String"]["output"]>;
  /** The name of the InputField. */
  label: Scalars["String"]["output"];
  /** Language to use for the Code Field. */
  language?: Maybe<Scalars["String"]["output"]>;
  /** Dictates how possible choices are provided for this InputField. */
  model?: Maybe<Scalars["JSONString"]["output"]>;
  /** If true, this input is controlled by the On-Prem Resource. */
  onPremiseControlled: Scalars["Boolean"]["output"];
  /** Placeholder text that will appear in the InputField UI. */
  placeholder?: Maybe<Scalars["String"]["output"]>;
  /** Specifies whether the InputField is required by the Action. */
  required: Scalars["Boolean"]["output"];
  /** Specifies whether the InputField is shown in the Designer. */
  shown: Scalars["Boolean"]["output"];
  /** Specifies the type of data the InputField handles. */
  type: InputFieldType;
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

/** Represents a Relay Connection to a collection of InputField objects. */
export type InputFieldConnection = {
  __typename?: "InputFieldConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InputFieldEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InputField>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

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

/** A Relay edge to a related InputField object and a cursor for pagination. */
export type InputFieldEdge = {
  __typename?: "InputFieldEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<InputField>;
};

export type InputFieldTemplate = Node & {
  __typename?: "InputFieldTemplate";
  /** Specifies whether the signed-in User can remove the InputFieldTemplate. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the InputFieldTemplate. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The template that this input is associated with. */
  connectionTemplate: ConnectionTemplate;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The InputField that this template is associated with. */
  inputField: InputField;
  /** The preset value for this input. */
  value?: Maybe<Scalars["String"]["output"]>;
};

/** Represents a Relay Connection to a collection of InputFieldTemplate objects. */
export type InputFieldTemplateConnection = {
  __typename?: "InputFieldTemplateConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InputFieldTemplateEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InputFieldTemplate>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related InputFieldTemplate object and a cursor for pagination. */
export type InputFieldTemplateEdge = {
  __typename?: "InputFieldTemplateEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<InputFieldTemplate>;
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

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type Instance = Node & {
  __typename?: "Instance";
  /** Specifies whether the signed-in User can deploy the Instance. */
  allowDeploy?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether the signed-in User can remove the Instance. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Instance. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update config variables for the Instance. */
  allowUpdateConfigVariables?: Maybe<Scalars["Boolean"]["output"]>;
  /** Describes the state of configuration of this Instance. */
  configState?: Maybe<InstanceConfigState>;
  /** The Instance with which the Config Variable is associated. */
  configVariables: InstanceConfigVariableConnection;
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The Customer for which the Instance is deployed. */
  customer: Customer;
  /** Returns a list of Customer Config Variables associated with this Instance. */
  customerConfigVariables: CustomerConfigVariableConnection;
  /** The specific version of the Instance that is deployed. */
  deployedVersion: Scalars["Int"]["output"];
  /** Additional notes about the Instance. */
  description: Scalars["String"]["output"];
  /** Indicates whether the Instance was deployed by a 'customer' or 'org'. */
  designedBy: InstanceDesignedBy;
  /** Specifies whether the Instance is currently enabled and in an executable state. */
  enabled: Scalars["Boolean"]["output"];
  /** The Instance for which a specific InstanceFlowConfig is being executed. */
  executionResults: InstanceExecutionResultConnection;
  /** The configuration for the IntegrationFlow associated with the Instance. */
  flowConfigs: InstanceFlowConfigConnection;
  /** Specifies whether Instance executions should run in debug mode. */
  globalDebug: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Specifies whether any of the Instance's Flow Configs are currently in a failed state. */
  inFailedState?: Maybe<Scalars["Boolean"]["output"]>;
  instanceType?: Maybe<InstanceType>;
  /** The Integration that has been deployed for the Instance. */
  integration: Integration;
  /** Specifies whether the Instance can be deployed through the Marketplace. */
  isCustomerDeployable?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether the Instance can be upgraded through the Marketplace. */
  isCustomerUpgradeable?: Maybe<Scalars["Boolean"]["output"]>;
  isSystem: Scalars["Boolean"]["output"];
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars["String"]["output"]>>;
  /** The timestamp at which the Instance was most recently deployed. */
  lastDeployedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The timestamp at which the Instance was most recently executed. */
  lastExecutedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Specifies whether the Instance is in listening mode for webhook snapshot executions. */
  listeningMode: Scalars["Boolean"]["output"];
  /** The Instance which created the Log entry. */
  logs: LogConnection;
  /** This field has been deprecated. */
  logsDisabled: Scalars["Boolean"]["output"];
  /** The Instance that is being monitored by the AlertMonitor. */
  monitors: AlertMonitorConnection;
  /** The name of the Instance. */
  name: Scalars["String"]["output"];
  /** Specifies whether a deploy is needed to reflect the newest configuration for this Instance. */
  needsDeploy: Scalars["Boolean"]["output"];
  /** The Instance Profile used by this Instance. */
  profile?: Maybe<InstanceProfile>;
  /** Returns a list of Scoped Config Variables associated with this Instance. */
  scopedConfigVariables: ScopedConfigVariableConnection;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars["Boolean"]["output"]>;
  /** This field has been deprecated. */
  stepResultsDisabled: Scalars["Boolean"]["output"];
  /** Specifies whether the Instance has been suspended by Prismatic. */
  systemSuspended: Scalars["Boolean"]["output"];
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The User Level Config variables for the requesting User on this Instance. */
  userLevelConfigVariables?: Maybe<CustomUserLevelConfigVariableConnection>;
  /** The Instance with which the User Level Config is associated. */
  userLevelConfigs: UserLevelConfigConnection;
  /** The Workflow that has been deployed by the Instance. */
  workflow?: Maybe<Workflow>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceCustomerConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  isTest?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CustomerConfigVariableOrder>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  scopedConfigVariable_Key?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_Key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_ManagedBy?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_VariableScope?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerConfigVariableOrder>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceExecutionResultsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  error_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  flow_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  invokeType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  invokedBy?: InputMaybe<ExecutionInvokedByInput>;
  isLre?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  queuedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  queuedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  queuedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  replayForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resultType?: InputMaybe<Scalars["String"]["input"]>;
  resultType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  resumedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  resumedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resumedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryCount?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  retryForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryNextAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryUniqueRequestId?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  status?: InputMaybe<ExecutionStatus>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceFlowConfigsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow_Name?: InputMaybe<Scalars["String"]["input"]>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceFlowConfigOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceFlowConfigOrder>>>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceIntegrationArgs = {
  compatibility?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceLogsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  configVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customerConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult_IsTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integrationVersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  logType?: InputMaybe<Scalars["String"]["input"]>;
  logType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  message_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<LogOrder>;
  requiredConfigVariableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  severity?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceMonitorsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  triggers_IsGlobal?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceScopedConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  includeCustomer?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  managedBy?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ScopedConfigVariableOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ScopedConfigVariableOrder>>>;
  stableKey?: InputMaybe<Scalars["String"]["input"]>;
  stableKey_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  variableScope?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceUserLevelConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents an instance of an Integration which has been deployed in the
 * context of a Customer, to include Config Variable values, Credentials, and
 * a specific version of an Integration.
 */
export type InstanceUserLevelConfigsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<UserLevelConfigOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserLevelConfigOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  user?: InputMaybe<Scalars["ID"]["input"]>;
  user_Email_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  user_Email_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  user_ExternalId?: InputMaybe<Scalars["String"]["input"]>;
  user_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  user_Name_Iexact?: InputMaybe<Scalars["String"]["input"]>;
};

export enum InstanceConfigState {
  FullyConfigured = "FULLY_CONFIGURED",
  NeedsInstanceConfiguration = "NEEDS_INSTANCE_CONFIGURATION",
  NeedsUserLevelConfiguration = "NEEDS_USER_LEVEL_CONFIGURATION",
}

/**
 * Associates specific values to the Required Config Variables specified by an
 * Integration when creating an Instance.
 */
export type InstanceConfigVariable = Node & {
  __typename?: "InstanceConfigVariable";
  /** Specifies whether the signed-in User can remove the InstanceConfigVariable. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the InstanceConfigVariable. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Authorize URL of this Config Variable if associated with an OAuth 2.0 Connection. */
  authorizeUrl?: Maybe<Scalars["String"]["output"]>;
  /** The presigned URL to fetch metadata of the content used to populate the widget, when applicable. */
  contentMetadataUrl?: Maybe<Scalars["String"]["output"]>;
  /** The presigned URL to download the content used to populate the widget, when applicable. */
  contentUrl?: Maybe<Scalars["String"]["output"]>;
  /** The specific Customer Config Variable that defines the inputs for the Instance Config Variable. */
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The collection of Expressions that serve as inputs to the InstanceConfigVariable. */
  inputs?: Maybe<ExpressionConnection>;
  /** The Instance with which the Config Variable is associated. */
  instance: Instance;
  /** The timestamp of the last successful OAuth2 token refresh. */
  lastSuccessfulRefreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The InstanceConfigVariable which relates to the Log entry. */
  logs: LogConnection;
  /** Contains arbitrary metadata about this Config Var. */
  meta?: Maybe<Scalars["JSONString"]["output"]>;
  /** The On-Prem Resource that is associated with the Config Variable. */
  onPremiseResource?: Maybe<OnPremiseResource>;
  /** The timestamp at which the OAuth2 token will automatically be refreshed, if necessary. Only applies to OAuth2 methods where refresh is necessary. */
  refreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The Required Config Variable that is satisfied with the assignment of a Config Variable. */
  requiredConfigVariable: RequiredConfigVariable;
  /** The schedule type to show in the UI when the Config Var uses the 'schedule' dataType. */
  scheduleType?: Maybe<InstanceConfigVariableScheduleType>;
  /** Status indicating if this Connection is working as expected or encountering issues. */
  status?: Maybe<InstanceConfigVariableStatus>;
  /** The presigned URL to fetch metadata of the supplemental data that may have been fetched as part of populating the content, when applicable. */
  supplementalDataMetadataUrl?: Maybe<Scalars["String"]["output"]>;
  /** The presigned URL to download supplemental data that may have been fetched as part of populating the content, when applicable. */
  supplementalDataUrl?: Maybe<Scalars["String"]["output"]>;
  /** An optional timezone property for when the Config Var uses the 'schedule' dataType. */
  timeZone?: Maybe<Scalars["String"]["output"]>;
  /** The value for the Required Config Variable that becomes part of the Instance definition. */
  value?: Maybe<Scalars["String"]["output"]>;
};

/**
 * Associates specific values to the Required Config Variables specified by an
 * Integration when creating an Instance.
 */
export type InstanceConfigVariableAuthorizeUrlArgs = {
  newSession?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/**
 * Associates specific values to the Required Config Variables specified by an
 * Integration when creating an Instance.
 */
export type InstanceConfigVariableInputsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  visibleToCustomerDeployer?: InputMaybe<Scalars["Boolean"]["input"]>;
  visibleToOrgDeployer?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/**
 * Associates specific values to the Required Config Variables specified by an
 * Integration when creating an Instance.
 */
export type InstanceConfigVariableLogsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  configVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customerConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult_IsTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integrationVersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  logType?: InputMaybe<Scalars["String"]["input"]>;
  logType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  message_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<LogOrder>;
  requiredConfigVariableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  severity?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Represents a Relay Connection to a collection of InstanceConfigVariable objects. */
export type InstanceConfigVariableConnection = {
  __typename?: "InstanceConfigVariableConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceConfigVariableEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related InstanceConfigVariable object and a cursor for pagination. */
export type InstanceConfigVariableEdge = {
  __typename?: "InstanceConfigVariableEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceConfigVariable>;
};

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

/** Represents a Relay Connection to a collection of Instance objects. */
export type InstanceConnection = {
  __typename?: "InstanceConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Instance>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** Represents snapshots of daily utilization metrics for an Instance. */
export type InstanceDailyUsageMetrics = Node & {
  __typename?: "InstanceDailyUsageMetrics";
  /** Specifies whether the signed-in User can remove the InstanceDailyUsageMetrics. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the InstanceDailyUsageMetrics. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The number of failed executions of this Instance on the snapshot date. */
  failedExecutionCount: Scalars["BigInt"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Instance for which utilization metrics are being collected. */
  instance: Instance;
  /** The date the utilization metrics snapshot was created. */
  snapshotDate: Scalars["Date"]["output"];
  /** The execution spend for this Instance on the snapshot date in MB-secs. */
  spendMbSecs: Scalars["BigInt"]["output"];
  /** The number of steps executed for this Instance on the snapshot date. */
  stepCount: Scalars["BigInt"]["output"];
  /** The number of successful executions of this Instance on the snapshot date. */
  successfulExecutionCount: Scalars["BigInt"]["output"];
};

/** Represents a Relay Connection to a collection of InstanceDailyUsageMetrics objects. */
export type InstanceDailyUsageMetricsConnection = {
  __typename?: "InstanceDailyUsageMetricsConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceDailyUsageMetricsEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceDailyUsageMetrics>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related InstanceDailyUsageMetrics object and a cursor for pagination. */
export type InstanceDailyUsageMetricsEdge = {
  __typename?: "InstanceDailyUsageMetricsEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceDailyUsageMetrics>;
};

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

/** A Relay edge to a related Instance object and a cursor for pagination. */
export type InstanceEdge = {
  __typename?: "InstanceEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Instance>;
};

export type InstanceExecutionFrame = {
  __typename?: "InstanceExecutionFrame";
  /** A JSON value that contains attributes which uniquely identify the Component Action which invoked this execution. */
  componentActionKey?: Maybe<Scalars["String"]["output"]>;
  /** Represents a custom-defined origin for this execution. */
  customSource?: Maybe<Scalars["String"]["output"]>;
  /** The execution that invoked this execution. */
  execution?: Maybe<InstanceExecutionResult>;
  /** A string containing a sequence of space-separated 'loopStepName:iterationNumber' tokens that detail at what point in a loop this execution was invoked. */
  loopPath?: Maybe<Scalars["String"]["output"]>;
  /** The name of the step that invoked this execution. */
  stepName?: Maybe<Scalars["String"]["output"]>;
};

export type InstanceExecutionLineage = {
  __typename?: "InstanceExecutionLineage";
  /** Returns true if this execution invoked other executions. */
  hasChildren?: Maybe<Scalars["Boolean"]["output"]>;
  /** Metadata referencing what invoked this execution and when. */
  invokedBy?: Maybe<InstanceExecutionFrame>;
};

/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResult = Node & {
  __typename?: "InstanceExecutionResult";
  /** The number of MB of memory allocated by the runtime to execute this Execution. */
  allocatedMemoryMb?: Maybe<Scalars["Int"]["output"]>;
  /** Specifies whether the signed-in User can remove the InstanceExecutionResult. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the InstanceExecutionResult. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Execution with a matching Unique Request ID that caused this Execution to be canceled. */
  canceledByExecution?: Maybe<InstanceExecutionResult>;
  /** The timestamp at which execution ended. */
  endedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Any error message that occurred as part of Instance execution. */
  error?: Maybe<Scalars["String"]["output"]>;
  /** The specific IntegrationFlow that is associated with this Execution. */
  flow?: Maybe<IntegrationFlow>;
  /** The specific InstanceFlowConfig for the Instance being executed. */
  flowConfig?: Maybe<InstanceFlowConfig>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Instance for which a specific InstanceFlowConfig is being executed. */
  instance?: Maybe<Instance>;
  instanceType?: Maybe<InstanceType>;
  /** The specific Integration that is associated with this Execution. */
  integration?: Maybe<Integration>;
  /** The type of origin that this execution was triggered from. */
  invokeType?: Maybe<InstanceExecutionResultInvokeType>;
  /** Specifies whether this is a Long Running Execution. */
  isLre: Scalars["Boolean"]["output"];
  /** Specifies whether Execution was created as part of testing. */
  isTestExecution: Scalars["Boolean"]["output"];
  /** A metadata object representing this Instance execution's relationship to other executions. */
  lineage: InstanceExecutionLineage;
  /** The specific InstanceExecutionResult that is associated with the Log entry. */
  logs: LogConnection;
  /** The maximum number of times that this Execution may be retried before failing. */
  maxRetryCount?: Maybe<Scalars["Int"]["output"]>;
  /** Timestamp when this execution was queued for processing. */
  queuedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The Execution for which this Execution is a replay. */
  replayForExecution?: Maybe<InstanceExecutionResult>;
  /** The Execution for which this Execution is a replay. */
  replays: InstanceExecutionResultConnection;
  /** The presigned URL to fetch metadata of the request payload that was sent to invoke Instance execution. */
  requestPayloadMetadataUrl: Scalars["String"]["output"];
  /** The presigned URL to download the request payload that was sent to invoke Instance execution. */
  requestPayloadUrl: Scalars["String"]["output"];
  /** The presigned URL to fetch metadata of the response payload that was received from the Instance execution. */
  responsePayloadMetadataUrl: Scalars["String"]["output"];
  /** The presigned URL to download the response payload that was received from the Instance execution. */
  responsePayloadUrl: Scalars["String"]["output"];
  /** The type of outcome from the Instance execution. */
  resultType?: Maybe<InstanceExecutionResultResultType>;
  /** Timestamp when this queued execution was resumed for processing. */
  resumedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The Execution for which this Execution is a retry attempt. */
  retryAttempts: InstanceExecutionResultConnection;
  /** The number of times that this Execution has been retried. */
  retryCount?: Maybe<Scalars["Int"]["output"]>;
  /** The Execution for which this Execution is a retry attempt. */
  retryForExecution?: Maybe<InstanceExecutionResult>;
  /** The timestamp at which the next scheduled retry will occur. */
  retryNextAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** A Unique Request ID to use for retry request cancellation. */
  retryUniqueRequestId?: Maybe<Scalars["String"]["output"]>;
  /** The spend for this Execution in MB-secs. */
  spendMbSecs?: Maybe<Scalars["Int"]["output"]>;
  /** The timestamp at which execution started. */
  startedAt: Scalars["DateTime"]["output"];
  /** The status of the Instance execution. */
  status: ExecutionStatus;
  /** The number of steps in this Execution. */
  stepCount?: Maybe<Scalars["Int"]["output"]>;
  /** The InstanceExecutionResult to which the InstanceStepResult is associated. */
  stepResults: InstanceStepResultConnection;
};

/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResultLogsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  configVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customerConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult_IsTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integrationVersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  logType?: InputMaybe<Scalars["String"]["input"]>;
  logType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  message_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<LogOrder>;
  requiredConfigVariableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  severity?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResultReplaysArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  error_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  flow_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  invokeType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  invokedBy?: InputMaybe<ExecutionInvokedByInput>;
  isLre?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  queuedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  queuedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  queuedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  replayForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resultType?: InputMaybe<Scalars["String"]["input"]>;
  resultType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  resumedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  resumedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resumedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryCount?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  retryForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryNextAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryUniqueRequestId?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  status?: InputMaybe<ExecutionStatus>;
};

/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResultRetryAttemptsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  error_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  flow_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  invokeType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  invokedBy?: InputMaybe<ExecutionInvokedByInput>;
  isLre?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  queuedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  queuedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  queuedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  replayForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resultType?: InputMaybe<Scalars["String"]["input"]>;
  resultType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  resumedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  resumedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resumedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryCount?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  retryForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryNextAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryUniqueRequestId?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  status?: InputMaybe<ExecutionStatus>;
};

/** Represents the set of results of each step of execution for an Instance. */
export type InstanceExecutionResultStepResultsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  branchName?: InputMaybe<Scalars["String"]["input"]>;
  displayStepName?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  fromPreprocessFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasError?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  isLoopStep?: InputMaybe<Scalars["Boolean"]["input"]>;
  isRootResult?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  loopStepIndex?: InputMaybe<Scalars["Int"]["input"]>;
  loopStepName?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceStepResultOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceStepResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  stepName?: InputMaybe<Scalars["String"]["input"]>;
};

/** Represents a Relay Connection to a collection of InstanceExecutionResult objects. */
export type InstanceExecutionResultConnection = {
  __typename?: "InstanceExecutionResultConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceExecutionResultEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceExecutionResult>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related InstanceExecutionResult object and a cursor for pagination. */
export type InstanceExecutionResultEdge = {
  __typename?: "InstanceExecutionResultEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceExecutionResult>;
};

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

/**
 * Represents the configuration options for a particular IntegrationFlow as it
 * relates to an Instance.
 */
export type InstanceFlowConfig = Node & {
  __typename?: "InstanceFlowConfig";
  /** Specifies whether the signed-in User can remove the InstanceFlowConfig. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the InstanceFlowConfig. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** An optional collection of API Keys any of which, when specified, will be required as a header value in all requests to trigger execution of this IntegrationFlow for the associated Instance. */
  apiKeys?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  /** The specific InstanceFlowConfig for the Instance being executed. */
  executionResults: InstanceExecutionResultConnection;
  /** The IntegrationFlow for which configuration is being specified for the associated Instance. */
  flow: IntegrationFlow;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Specifies whether the latest execution of this InstanceFlowConfig resulted in a failure. */
  inFailedState: Scalars["Boolean"]["output"];
  /** The configuration for the IntegrationFlow associated with the Instance. */
  instance: Instance;
  /** The timestamp at which the InstanceFlowConfig was most recently executed. */
  lastExecutedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The IntegrationFlow which created the Log entry. */
  logs: LogConnection;
  /** The IntegrationFlow that is being monitored by the AlertMonitor. */
  monitors: AlertMonitorConnection;
  /** Content type of the payload for testing the IntegrationFlow associated with the Instance. */
  testContentType?: Maybe<Scalars["String"]["output"]>;
  /** Headers for testing this IntegrationFlow associated with the Instance. */
  testHeaders?: Maybe<Scalars["JSONString"]["output"]>;
  /** Data payload for testing this IntegrationFlow associated with the Instance. */
  testPayload?: Maybe<Scalars["String"]["output"]>;
  /** Specifies whether executions of this InstanceFlowConfig will use Long Running Executions. */
  usesLre: Scalars["Boolean"]["output"];
  /** The URL of the endpoint that triggers execution of the InstanceFlowConfig. */
  webhookUrl: Scalars["String"]["output"];
};

/**
 * Represents the configuration options for a particular IntegrationFlow as it
 * relates to an Instance.
 */
export type InstanceFlowConfigExecutionResultsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  error_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  flow_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  invokeType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  invokedBy?: InputMaybe<ExecutionInvokedByInput>;
  isLre?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  queuedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  queuedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  queuedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  replayForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resultType?: InputMaybe<Scalars["String"]["input"]>;
  resultType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  resumedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  resumedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resumedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryCount?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  retryForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryNextAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryUniqueRequestId?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  status?: InputMaybe<ExecutionStatus>;
};

/**
 * Represents the configuration options for a particular IntegrationFlow as it
 * relates to an Instance.
 */
export type InstanceFlowConfigLogsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  configVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customerConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult_IsTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integrationVersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  logType?: InputMaybe<Scalars["String"]["input"]>;
  logType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  message_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<LogOrder>;
  requiredConfigVariableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  severity?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/**
 * Represents the configuration options for a particular IntegrationFlow as it
 * relates to an Instance.
 */
export type InstanceFlowConfigMonitorsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  triggers_IsGlobal?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/** Represents a Relay Connection to a collection of InstanceFlowConfig objects. */
export type InstanceFlowConfigConnection = {
  __typename?: "InstanceFlowConfigConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceFlowConfigEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceFlowConfig>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related InstanceFlowConfig object and a cursor for pagination. */
export type InstanceFlowConfigEdge = {
  __typename?: "InstanceFlowConfigEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceFlowConfig>;
};

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

/**
 * Specifies a profile that consists of attributes that determine the behavior
 * and billing properties of an Instance.
 */
export type InstanceProfile = Node & {
  __typename?: "InstanceProfile";
  /** The amount of memory allocated to the Instance Runner Lambda function. */
  allocatedMemoryMb: Scalars["Int"]["output"];
  /** Specifies whether the signed-in User can remove the InstanceProfile. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the InstanceProfile. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Additional notes about the Instance Profile. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The billing type for the Instances that use this Instance Profile. */
  instanceBillingType: Scalars["String"]["output"];
  /** The Instance Profile used by this Instance. */
  instances: InstanceConnection;
  /** Specifies whether this Instance Profile is the default used when no Instance Profile is explicitly specified during Instance creation. */
  isDefaultProfile: Scalars["Boolean"]["output"];
  /** Specifies whether to disable the creation of logs during Instance execution. */
  logsDisabled: Scalars["Boolean"]["output"];
  /** The name of the Instance Profile, which must be unique within the scope of its Organization. */
  name: Scalars["String"]["output"];
  /** Specifies whether instances using this profile will startup faster when triggered. */
  quickStart?: Maybe<Scalars["Boolean"]["output"]>;
  /** The number of QuickStart Lambda runners reserved for Instances using this profile. */
  quickStartInstances?: Maybe<Scalars["Int"]["output"]>;
  /** Specifies whether to disable the creation of step results during Instance execution. */
  stepResultsDisabled: Scalars["Boolean"]["output"];
};

/**
 * Specifies a profile that consists of attributes that determine the behavior
 * and billing properties of an Instance.
 */
export type InstanceProfileInstancesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  compatibility?: InputMaybe<Scalars["Int"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_ExternalId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  designedBy?: InputMaybe<InstanceDesignedBy>;
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  globalDebug?: InputMaybe<Scalars["Boolean"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  needsDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/** Represents a Relay Connection to a collection of InstanceProfile objects. */
export type InstanceProfileConnection = {
  __typename?: "InstanceProfileConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceProfileEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceProfile>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related InstanceProfile object and a cursor for pagination. */
export type InstanceProfileEdge = {
  __typename?: "InstanceProfileEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceProfile>;
};

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

/** Aggregated statistics about Instances deployed for an Integration. */
export type InstanceStats = {
  __typename?: "InstanceStats";
  /** The total number of Instances deployed for this Integration. */
  totalInstanceCount: Scalars["Int"]["output"];
  /** Distribution of Instances across Integration versions. */
  versionDistribution: VersionDistributionConnection;
};

/**
 * Represents the result of executing a specific step of an Integration as
 * part of an Instance execution.
 */
export type InstanceStepResult = Node & {
  __typename?: "InstanceStepResult";
  /** Specifies whether the signed-in User can remove the InstanceStepResult. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the InstanceStepResult. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The name of the branch containing the IntegrationAction that generated this result, if any. */
  branchName?: Maybe<Scalars["String"]["output"]>;
  /** A JSON value that contains attributes which uniquely identify the Component Action which generated this result. */
  componentActionKey?: Maybe<Scalars["String"]["output"]>;
  /** The display name of the IntegrationAction that generated this result. */
  displayStepName?: Maybe<Scalars["String"]["output"]>;
  /** The timestamp at which execution of the step ended. */
  endedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The InstanceExecutionResult to which the InstanceStepResult is associated. */
  executionResult: InstanceExecutionResult;
  /** Specifies whether the result was generated as part of the associated Integration's Preprocess Flow. */
  fromPreprocessFlow: Scalars["Boolean"]["output"];
  /** Specifies whether this step result had an error during execution. */
  hasError: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Instance to which the InstanceStepResult is associated. */
  instance?: Maybe<Instance>;
  /** Specifies whether the result was generated by a Loop IntegrationAction. */
  isLoopStep: Scalars["Boolean"]["output"];
  /** Identifies whether this is a 'root level' result or whether this is contained in a loop. */
  isRootResult: Scalars["Boolean"]["output"];
  /** The presigned URL to fetch metadata of the inputs for this specific step if it is a Loop step. */
  loopInputsMetadataUrl?: Maybe<Scalars["String"]["output"]>;
  /** The presigned URL to download the inputs for this specific step if it is a Loop step. */
  loopInputsUrl?: Maybe<Scalars["String"]["output"]>;
  /** A string containing a sequence of space-separated 'loopStepName:iterationNumber' tokens that allow this result to be requested based solely on loop positions and iteration numbers */
  loopPath?: Maybe<Scalars["String"]["output"]>;
  /** The iteration index of the containing Loop IntegrationAction at the time this result was generated, if any. */
  loopStepIndex?: Maybe<Scalars["Int"]["output"]>;
  /** The name of the IntegrationAction that is the Loop containing the IntegrationAction that generated this result, if any. */
  loopStepName?: Maybe<Scalars["String"]["output"]>;
  /** The presigned URL to fetch metadata of the result of this specific step of the Instance execution. */
  resultsMetadataUrl: Scalars["String"]["output"];
  /** The presigned URL to download the result of this specific step of the Instance execution. */
  resultsUrl: Scalars["String"]["output"];
  /** The timestamp at which execution of the step started. */
  startedAt: Scalars["DateTime"]["output"];
  /** The name of the IntegrationAction that generated this result. */
  stepName?: Maybe<Scalars["String"]["output"]>;
  /** The stable key of the IntegrationAction that generated this result. */
  stepStableKey?: Maybe<Scalars["String"]["output"]>;
};

/** Represents a Relay Connection to a collection of InstanceStepResult objects. */
export type InstanceStepResultConnection = {
  __typename?: "InstanceStepResultConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<InstanceStepResultEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<InstanceStepResult>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related InstanceStepResult object and a cursor for pagination. */
export type InstanceStepResultEdge = {
  __typename?: "InstanceStepResultEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<InstanceStepResult>;
};

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

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type Integration = Node & {
  __typename?: "Integration";
  /** The Integration to which the IntegrationAction is associated via the IntegrationFlow. */
  actions: IntegrationActionConnection;
  /** The URL for agent flows of this Integration. */
  agentFlowsUrl: Scalars["String"]["output"];
  /** Specifies whether the signed-in User can fork the Integration. */
  allowFork: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can manage Attachments related to this record. */
  allowManageAttachments?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether multiple Instances of this Integration may be created from the Marketplace. */
  allowMultipleMarketplaceInstances: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can publish the Integration. */
  allowPublish: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can remove the Integration. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Integration. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** A JSON list of objects where each object has a key for name and URL that together describe the Attachment. */
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  /** The URL for the avatar image. */
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  /** Specifies the category of the Integration. */
  category?: Maybe<Scalars["String"]["output"]>;
  /** Components associated with this Integration */
  components: ComponentConnection;
  /** A JSON string that represents deployment configuration pages. */
  configPages: Scalars["JSONString"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The Customer the Integration belongs to, if any. If this is NULL then the Integration belongs to the Organization. */
  customer?: Maybe<Customer>;
  /** Returns a list of Customer Config Variables associated with this Integration. */
  customerConfigVariables: CustomerConfigVariableConnection;
  /** The Instance Profile to use as a default when Instances of this Integration are created. */
  defaultInstanceProfile?: Maybe<InstanceProfile>;
  /** The YAML that is the declarative definition for the Integration. Suitable for using to re-import the Integration. */
  definition?: Maybe<Scalars["String"]["output"]>;
  /** Indicates how many Instances of this Integration are deployed. */
  deployedInstances: DeployedInstancesQuantity;
  /** Indicates the lowest instance-level configuration status among all Instances. */
  deploymentStatus?: Maybe<AggregateDeploymentStatus>;
  /** Additional notes about the Integration. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Rich text documentation to accompany the Integration. */
  documentation?: Maybe<Scalars["String"]["output"]>;
  /** Content type of the payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestContentType?: Maybe<Scalars["String"]["output"]>;
  /** A JSON string of key/value pairs that will be sent as headers when testing the endpoint configuration for this Integration. */
  endpointConfigTestHeaders?: Maybe<Scalars["JSONString"]["output"]>;
  /** Data payload for testing the endpoint configuration for this Integration. */
  endpointConfigTestPayload?: Maybe<Scalars["String"]["output"]>;
  /** The URL of the endpoint that allows testing the endpoint configuration of the Integration. */
  endpointConfigTestUrl: Scalars["String"]["output"];
  /** Specifies whether endpoint URLs for Instances of this Integration are unique to the flow, unique to the Instance, or if all Instances share a URL. */
  endpointType?: Maybe<IntegrationEndpointType>;
  /** Specifies the external version of this Integration, which can be used to provide semantic versioning. */
  externalVersion?: Maybe<Scalars["String"]["output"]>;
  /** The first instance using this Integration. */
  firstDeployedInstance?: Maybe<Instance>;
  /** The Integration of which the IntegrationFlow is a part. */
  flows: IntegrationFlowConnection;
  /** Specifies whether the Integration uses outdated Components */
  hasOutdatedComponents: Scalars["Boolean"]["output"];
  /** Specifies whether the Integration definition has changes that have not yet been published. */
  hasUnpublishedChanges: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Aggregated statistics about Instances deployed for this Integration. */
  instanceStats: InstanceStats;
  /** The Integration that has been deployed for the Instance. */
  instances: InstanceConnection;
  /** Specifies whether this Integration is a Code Native Integration. */
  isCodeNative: Scalars["Boolean"]["output"];
  /** Specifies whether the Integration can be deployed by the signed-in User. */
  isCustomerDeployable?: Maybe<Scalars["Boolean"]["output"]>;
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars["String"]["output"]>>;
  /** The timestamp at which this Integration was most recently executed as part of an Instance. */
  lastExecutedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Specifies whether an Integration will be available in the Integration Marketplace and if the Integration is deployable by a Customer User. */
  marketplaceConfiguration: MarketplaceConfiguration;
  /** The Marketplace Tabs available to Customer Users for configuring this Integration. */
  marketplaceTabConfiguration?: Maybe<Array<Scalars["String"]["output"]>>;
  /** A JSON string that represents metadata for the Integration. */
  metadata?: Maybe<Scalars["JSONString"]["output"]>;
  /** The name of the Integration. */
  name: Scalars["String"]["output"];
  /** Specifies an Overview of the Integration to describe its functionality for use in the Integration Marketplace. */
  overview?: Maybe<Scalars["String"]["output"]>;
  /** Parent Integration this Integration was forked from, if any */
  parent?: Maybe<Integration>;
  /** The name of a Flow in the Integration that will be executed as a preprocessing step prior to any other Flow executions. */
  preprocessFlowName?: Maybe<Scalars["String"]["output"]>;
  requiredConfigVariables: RequiredConfigVariableConnection;
  /** Returns a list of Scoped Config Variables associated with this Integration. */
  scopedConfigVariables: ScopedConfigVariableConnection;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies whether an Integration will be available in the Integration Store and if the Integration is deployable by a Customer User. */
  storeConfiguration?: Maybe<IntegrationStoreConfiguration>;
  /** System Instance backing this Integration. */
  systemInstance: Instance;
  /** Specifies whether the latest published version of this Integration may be used as a template to create new Integrations. */
  templateConfiguration: IntegrationTemplateConfiguration;
  /** Config Variables that are used for testing during Integration design. */
  testConfigVariables: InstanceConfigVariableConnection;
  /** Indicates the lowest user-level configuration status among all Instances. */
  ulcDeploymentStatus?: Maybe<AggregateDeploymentStatus>;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** Specifies whether the latest published version of this Integration may be used as a template to create new Integrations. */
  useAsTemplate: Scalars["Boolean"]["output"];
  /** Specifies whether this Integration uses User Level Configs. */
  userLevelConfigured: Scalars["Boolean"]["output"];
  /** Validation Rules applied to this Integration. */
  validationRules: IntegrationValidationRules;
  /** Object data at specified version */
  versionAt?: Maybe<Integration>;
  /** Additional attributes that are specific to this version. */
  versionAttributes?: Maybe<Scalars["JSONString"]["output"]>;
  /** Additional comments about this version. */
  versionComment?: Maybe<Scalars["String"]["output"]>;
  /** Timestamp of the creation of this version. */
  versionCreatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User that created this version. */
  versionCreatedBy?: Maybe<User>;
  /** Indicates if the version is available for use. */
  versionIsAvailable: Scalars["Boolean"]["output"];
  /** Marked if this record is the latest version of this sequence. */
  versionIsLatest: Scalars["Boolean"]["output"];
  /** Sequential number identifying this version. */
  versionNumber: Scalars["Int"]["output"];
  /** Sequence of versions of this Integration */
  versionSequence: IntegrationConnection;
  /** Identifier for this version sequence. */
  versionSequenceId?: Maybe<Scalars["UUID"]["output"]>;
  /** The Versions of the Integration that are available. */
  versions: VersionConnection;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationActionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationComponentsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ComponentOrder>;
  outdated?: InputMaybe<Scalars["Boolean"]["input"]>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  searchTerms_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionCreatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionCreatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationCustomerConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  isTest?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CustomerConfigVariableOrder>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  scopedConfigVariable_Key?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_Key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_ManagedBy?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_VariableScope?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerConfigVariableOrder>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationDefinitionArgs = {
  useLatestComponentVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  version?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationFlowsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationInstancesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  compatibility?: InputMaybe<Scalars["Int"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_ExternalId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  designedBy?: InputMaybe<InstanceDesignedBy>;
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  globalDebug?: InputMaybe<Scalars["Boolean"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  needsDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationRequiredConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  dataSource?: InputMaybe<Scalars["ID"]["input"]>;
  dataType?: InputMaybe<Scalars["String"]["input"]>;
  dataType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  hasDivider?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<RequiredConfigVariableOrder>;
  orgOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<RequiredConfigVariableOrder>>>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationScopedConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  includeCustomer?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  managedBy?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ScopedConfigVariableOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ScopedConfigVariableOrder>>>;
  stableKey?: InputMaybe<Scalars["String"]["input"]>;
  stableKey_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  variableScope?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationTestConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationVersionAtArgs = {
  id?: InputMaybe<Scalars["ID"]["input"]>;
  latestAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationVersionSequenceArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flows_IsAgentFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOutdatedComponents?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasUnpublishedChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCodeNative?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  marketplace?: InputMaybe<Scalars["Boolean"]["input"]>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/**
 * Represents the collection of information that defines an integration, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type IntegrationVersionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<VersionOrder>;
};

/** Represents an association of a Component Action to an Integration. */
export type IntegrationAction = Node & {
  __typename?: "IntegrationAction";
  /** The specific Component Action that is being associated to the IntegrationFlow. */
  action: Action;
  /** Specifies whether the signed-in User can remove the IntegrationAction. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the IntegrationAction. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** A brief description of the IntegrationAction. */
  description: Scalars["String"]["output"];
  /** The type of error handling to use when failures occur for this IntegrationAction. */
  errorHandlerType?: Maybe<IntegrationActionErrorHandlerType>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The collection of Expressions that serve as inputs to the IntegrationAction. */
  inputs: ExpressionConnection;
  /** The Integration to which the IntegrationAction is associated via the IntegrationFlow. */
  integration: Integration;
  /** The displayed name of the IntegrationAction. */
  name: Scalars["String"]["output"];
  /** Specifies the delay in seconds between retry attempts for failures of this IntegrationAction. */
  retryDelaySeconds?: Maybe<Scalars["Int"]["output"]>;
  /** Specifies whether to fail the Execution when the final retry attempt fails for this IntegrationAction, or whether to ignore and continue. */
  retryIgnoreFinalError?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies the maximum number of retry attempts that will be performed for failures of this IntegrationAction. */
  retryMaxAttempts?: Maybe<Scalars["Int"]["output"]>;
  /** Specifies whether to use exponential backoff in scheduling retries for failures of this IntegrationAction. */
  retryUsesExponentialBackoff?: Maybe<Scalars["Boolean"]["output"]>;
  /** A user-provided value that represents identity across multiple integration versions and across step renames. */
  stableKey?: Maybe<Scalars["String"]["output"]>;
};

/** Represents an association of a Component Action to an Integration. */
export type IntegrationActionInputsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents a Relay Connection to a collection of IntegrationAction objects. */
export type IntegrationActionConnection = {
  __typename?: "IntegrationActionConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<IntegrationActionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<IntegrationAction>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related IntegrationAction object and a cursor for pagination. */
export type IntegrationActionEdge = {
  __typename?: "IntegrationActionEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<IntegrationAction>;
};

export enum IntegrationActionErrorHandlerType {
  /** Fail */
  Fail = "FAIL",
  /** Ignore */
  Ignore = "IGNORE",
  /** Retry */
  Retry = "RETRY",
}

/** Represents an integration category. */
export type IntegrationCategory = Node & {
  __typename?: "IntegrationCategory";
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The name of the Integration category. */
  name: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of Integration objects. */
export type IntegrationConnection = {
  __typename?: "IntegrationConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<IntegrationEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Integration>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related Integration object and a cursor for pagination. */
export type IntegrationEdge = {
  __typename?: "IntegrationEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Integration>;
};

export enum IntegrationEndpointType {
  /** Flow Specific */
  FlowSpecific = "FLOW_SPECIFIC",
  /** Instance Specific */
  InstanceSpecific = "INSTANCE_SPECIFIC",
  /** Shared Instance */
  SharedInstance = "SHARED_INSTANCE",
}

/**
 * Relates an Integration to a hierarchical structure of Component Actions
 * that define the behavior of one of potentially several workflows that
 * comprise the Integration.
 */
export type IntegrationFlow = Node & {
  __typename?: "IntegrationFlow";
  /** Specifies whether the signed-in User can remove the IntegrationFlow. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the IntegrationFlow. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Additional notes about the IntegrationFlow. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Specifies the security configuration to use for the endpoint of this IntegrationFlow. */
  endpointSecurityType: IntegrationFlowEndpointSecurityType;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Specifies whether this flow is designated as an agent flow for the MCP Server. */
  isAgentFlow: Scalars["Boolean"]["output"];
  /** Specifies whether responses to Executions of this IntegrationFlow are synchronous. Responses are asynchronous by default. */
  isSynchronous: Scalars["Boolean"]["output"];
  /** The timestamp at which this IntegrationFlow was most recently executed as part of an Instance. */
  lastExecutedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The displayed name of the IntegrationFlow. */
  name: Scalars["String"]["output"];
  /** The API key(s) to use for the endpoint of this IntegrationFlow when the endpoint security type is 'organization'. */
  organizationApiKeys?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  /** Specifies a reference to the data to use as a deduplication ID for queue processing. */
  queueDedupeIdField?: Maybe<Expression>;
  /** Specifies the delay in minutes between retry attempts of Executions of this IntegrationFlow. */
  retryDelayMinutes: Scalars["Int"]["output"];
  /** Specifies the maximum number of retry attempts that will be performed for Executions of this IntegrationFlow. */
  retryMaxAttempts: Scalars["Int"]["output"];
  /** Specifies a reference to the data to use as a Unique Request ID for retry request cancellation. */
  retryUniqueRequestIdField?: Maybe<Expression>;
  /** Specifies whether to use exponential backoff in scheduling retries of Executions of this IntegrationFlow. */
  retryUsesExponentialBackoff: Scalars["Boolean"]["output"];
  /** Defines schemas to apply to executions of this flow */
  schemas?: Maybe<Scalars["JSONString"]["output"]>;
  /** Specifies whether only a single execution of this flow can run at a time. */
  singletonExecutions: Scalars["Boolean"]["output"];
  /** The order in which the IntegrationFlow will appear in the UI. */
  sortOrder: Scalars["Int"]["output"];
  /** Represents identity across different integration versions. Not intended to be used directly by end users, as the implementation may change at any time. */
  stableId?: Maybe<Scalars["UUID"]["output"]>;
  /** A user-provided value that represents identity across multiple integration versions and across flow renames. */
  stableKey?: Maybe<Scalars["String"]["output"]>;
  /** Content type of the payload for testing this Integration Flow. */
  testContentType?: Maybe<Scalars["String"]["output"]>;
  /** The Execution Results that were generated during testing. */
  testExecutionResults: InstanceExecutionResultConnection;
  /** Headers of the request for testing this Integration Flow. */
  testHeaders?: Maybe<Scalars["JSONString"]["output"]>;
  /** Data payload for testing this Integration Flow. */
  testPayload?: Maybe<Scalars["String"]["output"]>;
  /** The URL of the endpoint that triggers execution of the Integration Flow in the Test Runner. */
  testUrl: Scalars["String"]["output"];
  /** The IntegrationAction that is the trigger for the Integration Flow. */
  trigger: IntegrationAction;
  /** Specifies whether FIFO queue processing is enabled for this IntegrationFlow. */
  usesFifoQueue: Scalars["Boolean"]["output"];
};

/**
 * Relates an Integration to a hierarchical structure of Component Actions
 * that define the behavior of one of potentially several workflows that
 * comprise the Integration.
 */
export type IntegrationFlowTestExecutionResultsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  error_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  flow_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  invokeType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  isLre?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  queuedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  queuedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  queuedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  replayForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resultType?: InputMaybe<Scalars["String"]["input"]>;
  resultType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  resumedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  resumedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resumedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryCount?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  retryForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryNextAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryUniqueRequestId?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/** Represents a Relay Connection to a collection of IntegrationFlow objects. */
export type IntegrationFlowConnection = {
  __typename?: "IntegrationFlowConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<IntegrationFlowEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<IntegrationFlow>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related IntegrationFlow object and a cursor for pagination. */
export type IntegrationFlowEdge = {
  __typename?: "IntegrationFlowEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<IntegrationFlow>;
};

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

/** Represents a standard IntegrationTemplate. */
export type IntegrationTemplate = Node & {
  __typename?: "IntegrationTemplate";
  /** Specifies whether the signed-in User can remove the IntegrationTemplate. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the IntegrationTemplate. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Specifies the category of the Integration Template. */
  category: Scalars["String"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The YAML representation of the Integration Template. */
  definition: Scalars["String"]["output"];
  /** Additional notes about the Integration Template. */
  description: Scalars["String"]["output"];
  /** The URL to the icon for the IntegrationTemplate. */
  iconUrl?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The name of the Integration Template. Must be unique. */
  name: Scalars["String"]["output"];
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
};

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

/** Represents a Relay Connection to a collection of IntegrationTemplate objects. */
export type IntegrationTemplateConnection = {
  __typename?: "IntegrationTemplateConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<IntegrationTemplateEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<IntegrationTemplate>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related IntegrationTemplate object and a cursor for pagination. */
export type IntegrationTemplateEdge = {
  __typename?: "IntegrationTemplateEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<IntegrationTemplate>;
};

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

export type IntegrationValidationRules = {
  __typename?: "IntegrationValidationRules";
  /** Set of Components required to be used in this Integration. */
  requiredComponents: ComponentConnection;
};

export type IntegrationValidationRulesRequiredComponentsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  searchTerms_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionCreatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionCreatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type IntegrationVariant = Integration | Workflow;

/** Represents a Relay Connection to a collection of IntegrationVariant objects. */
export type IntegrationVariantConnection = {
  __typename?: "IntegrationVariantConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<IntegrationVariantEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<IntegrationVariant>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related IntegrationVariant object and a cursor for pagination. */
export type IntegrationVariantEdge = {
  __typename?: "IntegrationVariantEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<IntegrationVariant>;
};

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

/** Represents a label. */
export type Label = Node & {
  __typename?: "Label";
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The value of the label. */
  name: Scalars["String"]["output"];
};

/**
 * Represents a log entry that was created during a specific Execution of an
 * Instance.
 */
export type Log = Node & {
  __typename?: "Log";
  /** Specifies whether the signed-in User can remove the Log. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Log. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The InstanceConfigVariable which relates to the Log entry. */
  configVariable?: Maybe<InstanceConfigVariable>;
  /** The specific Customer that is associated with the Log entry. */
  customer?: Maybe<Customer>;
  /** The CustomerConfigVariable which relates to the Log entry. */
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  /** The name of the Customer that is associated with the Log entry. */
  customerName?: Maybe<Scalars["String"]["output"]>;
  /** The specific InstanceExecutionResult that is associated with the Log entry. */
  executionResult?: Maybe<InstanceExecutionResult>;
  /** The ID of the Execution Result which created the Log entry. */
  executionResultId?: Maybe<Scalars["ID"]["output"]>;
  /** The specific IntegrationFlow that is associated with the Log entry. */
  flow?: Maybe<IntegrationFlow>;
  /** The IntegrationFlow which created the Log entry. */
  flowConfig?: Maybe<InstanceFlowConfig>;
  /** The name of the IntegrationFlow that is associated with the Log entry. */
  flowName?: Maybe<Scalars["String"]["output"]>;
  /** Specifies whether the Log was generated as part of the associated Integration's Preprocess Flow. */
  fromPreprocessFlow?: Maybe<Scalars["Boolean"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Instance which created the Log entry. */
  instance?: Maybe<Instance>;
  /** The ID of the Instance which created the Log entry. */
  instanceId?: Maybe<Scalars["ID"]["output"]>;
  /** The name of the Instance which created the Log entry. */
  instanceName?: Maybe<Scalars["String"]["output"]>;
  instanceType?: Maybe<InstanceType>;
  /** The specific Integration that is associated with the Log entry. */
  integration?: Maybe<Integration>;
  /** The name of the Integration that is associated with the Log entry. */
  integrationName?: Maybe<Scalars["String"]["output"]>;
  /** The identifier for the version sequence of the Integration that is associated with the Log entry. */
  integrationVersionSequenceId?: Maybe<Scalars["UUID"]["output"]>;
  /** Specifies whether the associated Execution was created as part of testing. */
  isTestExecution?: Maybe<Scalars["Boolean"]["output"]>;
  /** The type of Log entry. */
  logType?: Maybe<LogType>;
  /** A string containing a sequence of space-separated 'loopStepName:iterationNumber' tokens that allow this Log to be requested based solely on loop positions and iteration numbers */
  loopPath?: Maybe<Scalars["String"]["output"]>;
  /** The iteration index of the containing Loop IntegrationAction at the time this Log entry was generated, if any. */
  loopStepIndex?: Maybe<Scalars["Int"]["output"]>;
  /** The name of the IntegrationAction that is the Loop containing the IntegrationAction that generated this Log entry, if any. */
  loopStepName?: Maybe<Scalars["String"]["output"]>;
  /** The message body of the Log entry. */
  message: Scalars["String"]["output"];
  /** The key of the Required Config Variable which relates to the Log entry. */
  requiredConfigVariableKey?: Maybe<Scalars["String"]["output"]>;
  /** The ScopedConfigVariable which relates to the Log entry. */
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
  /** The severity level of the Log entry. */
  severity: LogSeverityLevel;
  /** The name of the IntegrationAction that generated this Log entry. */
  stepName?: Maybe<Scalars["String"]["output"]>;
  /** The timestamp at which the Log was created. */
  timestamp: Scalars["DateTime"]["output"];
  /** The UserLevelConfigVariable which relates to the Log entry. */
  userLevelConfigVariable?: Maybe<UserLevelConfigVariable>;
};

/** Represents a Relay Connection to a collection of Log objects. */
export type LogConnection = {
  __typename?: "LogConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<LogEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Log>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related Log object and a cursor for pagination. */
export type LogEdge = {
  __typename?: "LogEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Log>;
};

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

export type LogSeverity = {
  __typename?: "LogSeverity";
  id?: Maybe<Scalars["Int"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

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
}

export type LowCodeConversionError = {
  __typename?: "LowCodeConversionError";
  error: Scalars["String"]["output"];
  errorType: Scalars["String"]["output"];
  path?: Maybe<Scalars["String"]["output"]>;
};

export enum MarketplaceConfiguration {
  AvailableAndDeployable = "AVAILABLE_AND_DEPLOYABLE",
  AvailableNotDeployable = "AVAILABLE_NOT_DEPLOYABLE",
  NotAvailableInMarketplace = "NOT_AVAILABLE_IN_MARKETPLACE",
}

export enum MediaType {
  Attachment = "ATTACHMENT",
  Avatar = "AVATAR",
}

/** An object with an ID */
export type Node = {
  /** The ID of the object */
  id: Scalars["ID"]["output"];
};

export type OAuthRedirectConfig = {
  __typename?: "OAuthRedirectConfig";
  /** The custom URI to redirect to when the OAuth flow fails. */
  oAuthFailureRedirectUri?: Maybe<Scalars["String"]["output"]>;
  /** The custom URI to redirect to when the OAuth flow is successful. */
  oAuthSuccessRedirectUri?: Maybe<Scalars["String"]["output"]>;
};

export type OAuthRedirectConfigInput = {
  oAuthFailureRedirectUri?: InputMaybe<Scalars["String"]["input"]>;
  oAuthSuccessRedirectUri?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * Represents a permission that has been granted to a specified object, either
 * directly or via a Role.
 */
export type ObjectPermissionGrant = Node & {
  __typename?: "ObjectPermissionGrant";
  /** Specifies whether the signed-in User can remove the ObjectPermissionGrant. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the ObjectPermissionGrant. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Role through which the Permission is granted, if applicable. */
  grantedByRole?: Maybe<Role>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** A reference to the object for which the Permission is granted. */
  obj: Scalars["UUID"]["output"];
  /** The Permission being granted. */
  permission: Permission;
  /** The User for which the Permission is granted. */
  user: User;
};

/** Represents a Relay Connection to a collection of ObjectPermissionGrant objects. */
export type ObjectPermissionGrantConnection = {
  __typename?: "ObjectPermissionGrantConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ObjectPermissionGrantEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ObjectPermissionGrant>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related ObjectPermissionGrant object and a cursor for pagination. */
export type ObjectPermissionGrantEdge = {
  __typename?: "ObjectPermissionGrantEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<ObjectPermissionGrant>;
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

/** Represents configuration for an On-Prem Resource. */
export type OnPremiseResource = Node & {
  __typename?: "OnPremiseResource";
  /** Specifies whether the signed-in User can remove the OnPremiseResource. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the OnPremiseResource. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Customer associated with this resource. */
  customer?: Maybe<Customer>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The name of this resource. */
  name: Scalars["String"]["output"];
  /** The local port on the proxy service assigned to this resource. */
  port: Scalars["Int"]["output"];
  /** The current status of this On-Prem Resource. */
  status: OnPremiseResourceStatus;
};

/** Represents a Relay Connection to a collection of OnPremiseResource objects. */
export type OnPremiseResourceConnection = {
  __typename?: "OnPremiseResourceConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<OnPremiseResourceEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<OnPremiseResource>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related OnPremiseResource object and a cursor for pagination. */
export type OnPremiseResourceEdge = {
  __typename?: "OnPremiseResourceEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<OnPremiseResource>;
};

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

/** Represents snapshots of daily utilization metrics for an Organization. */
export type OrgDailyUsageMetrics = Node & {
  __typename?: "OrgDailyUsageMetrics";
  /** Specifies whether the signed-in User can remove the OrgDailyUsageMetrics. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the OrgDailyUsageMetrics. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The total number of failed Instance executions on the snapshot date. */
  failedExecutionCount: Scalars["BigInt"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The date the utilization metrics snapshot was created. */
  snapshotDate: Scalars["Date"]["output"];
  /** The total execution spend on the snapshot date in MB-secs. */
  spendMbSecs: Scalars["BigInt"]["output"];
  /** The total number of steps executed on the snapshot date. */
  stepCount: Scalars["BigInt"]["output"];
  /** The total number of successful Instance executions on the snapshot date. */
  successfulExecutionCount: Scalars["BigInt"]["output"];
};

/** Represents a Relay Connection to a collection of OrgDailyUsageMetrics objects. */
export type OrgDailyUsageMetricsConnection = {
  __typename?: "OrgDailyUsageMetricsConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<OrgDailyUsageMetricsEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<OrgDailyUsageMetrics>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related OrgDailyUsageMetrics object and a cursor for pagination. */
export type OrgDailyUsageMetricsEdge = {
  __typename?: "OrgDailyUsageMetricsEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<OrgDailyUsageMetrics>;
};

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

export type OrgSearchResult = {
  __typename?: "OrgSearchResult";
  orgs?: Maybe<Array<Maybe<OrganizationReturnObject>>>;
};

/** Represents snapshots of total utilization metrics for the Organization. */
export type OrgTotalUsageMetrics = Node & {
  __typename?: "OrgTotalUsageMetrics";
  /** Specifies whether the signed-in User can remove the OrgTotalUsageMetrics. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the OrgTotalUsageMetrics. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The total number of bytes of blob storage currently used. */
  blobBytesStored: Scalars["BigInt"]["output"];
  /** The total number of Customers that currently exist. */
  customerCount: Scalars["Int"]["output"];
  /** The total number of Instances that are deployed. */
  deployedInstanceCount: Scalars["Int"]["output"];
  /** The total number of unique Integrations that are deployed. */
  deployedUniqueIntegrationCount: Scalars["Int"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The total number of Integrations that currently exist. */
  integrationCount: Scalars["Int"]["output"];
  /** The time the utilization metrics snapshot was created. */
  snapshotTime: Scalars["DateTime"]["output"];
  /** The total number of Users that currently exist. */
  userCount: Scalars["Int"]["output"];
};

/** Represents a Relay Connection to a collection of OrgTotalUsageMetrics objects. */
export type OrgTotalUsageMetricsConnection = {
  __typename?: "OrgTotalUsageMetricsConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<OrgTotalUsageMetricsEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<OrgTotalUsageMetrics>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related OrgTotalUsageMetrics object and a cursor for pagination. */
export type OrgTotalUsageMetricsEdge = {
  __typename?: "OrgTotalUsageMetricsEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<OrgTotalUsageMetrics>;
};

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

/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type Organization = Node & {
  __typename?: "Organization";
  /** Specifies whether the signed-in User can add an AlertGroup to the Organization. */
  allowAddAlertGroup: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add an AlertWebhook to the Organization. */
  allowAddAlertWebhook: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a Connection Template to the Organization. */
  allowAddConnectionTemplate: Scalars["Boolean"]["output"];
  /** DEPRECATED. Specifies whether the signed-in User can add a Credential to the Organization. */
  allowAddCredential: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a Customer to the Organization. */
  allowAddCustomer: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add an External Log stream to the Organization. */
  allowAddExternalLogStream: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add an Integration to the Organization. */
  allowAddIntegration: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a Scoped Config Variable to the Organization. */
  allowAddScopedConfigVariable: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a Signing Key to the Organization. */
  allowAddSigningKey: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a User to the Organization. */
  allowAddUser: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a WebhookEndpoint to the Organization. */
  allowAddWebhookEndpoint: Scalars["Boolean"]["output"];
  /** DEPRECATED. Specifies whether the signed-in User's Organization has access to legacy Credentials. */
  allowConfigureCredentials: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows configuration of Embedded for the Organization. */
  allowConfigureEmbedded: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows configuration of External Log Streams for the Organization. */
  allowConfigureExternalLogStreams: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can configure Themes for the Organization. */
  allowConfigureThemes: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows for configuring the memory allocated to the Runner Lambda functions. */
  allowConfiguringInstanceMemory: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows configuration of a Custom Theme for the Organization. */
  allowCustomTheme: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows for disabling Instance logs and step results. */
  allowDisablingInstanceOutputs: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows using the Embedded Designer the Organization. */
  allowEmbeddedDesigner: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows using the Embedded Workflow Builder the Organization. */
  allowEmbeddedWorkflowBuilder: Scalars["Boolean"]["output"];
  /** Specifies whether Instances may be enabled based on the utilization allowed by the current Plan. */
  allowEnableInstance: Scalars["Boolean"]["output"];
  /** Specifies whether Instances may be executed based on the utilization allowed by the current Plan. */
  allowExecuteInstance: Scalars["Boolean"]["output"];
  /** Specifies whether the current Plan allows configuration for automatic retry of Instance executions. */
  allowExecutionRetryConfig: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows for Long Running Executions. */
  allowLongRunningExecutions: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows for using the On Prem Agent system. */
  allowOnPremAgent: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can add a Component to the Organization. */
  allowPublishComponent: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can remove the Organization. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Organization. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Specifies whether this Plan allows for creating User Level Configured Instances. */
  allowUserLevelConfig: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can view Billing information for the Organization. */
  allowViewBilling: Scalars["Boolean"]["output"];
  /** The URL for the avatar image. */
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  /** Specifies custom names for branded elements. */
  brandedElements?: Maybe<Scalars["JSONString"]["output"]>;
  /** The Components that belong to the Organization. */
  components: ComponentConnection;
  /** The maximum number of concurrent executions allowed for this Organization. */
  concurrentExecutionLimit: Scalars["Int"]["output"];
  /** Maximum number of concurrent long running executions allowed for this Organization. */
  concurrentLreLimit: Scalars["Int"]["output"];
  /** The Organization the Credential belongs to, if any. If NULL then Customer will be specified. */
  credentials: CredentialConnection;
  /** Plan the Organization is subscribed to; set once payment is confirmed. */
  currentPlan: Scalars["String"]["output"];
  /** The Organization to which the Customer belongs. */
  customers: CustomerConnection;
  featureFlags?: Maybe<Scalars["JSONString"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The available billing types for Instances in the Organization. */
  instanceBillingTypes: Array<Maybe<Scalars["String"]["output"]>>;
  /** The Integrations that belong to the Organization. */
  integrations: IntegrationConnection;
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars["String"]["output"]>>;
  /** DEPRECATED. Display name of the Organization's Marketplace. */
  marketplaceName?: Maybe<Scalars["String"]["output"]>;
  /** The unique name of the Organization. */
  name: Scalars["String"]["output"];
  /** Specifies whether the Organization execution utilization has exceeded the Plan's limits. */
  overExecutionLimit: Scalars["Boolean"]["output"];
  /** This field has been deprecated. */
  overdue: Scalars["Boolean"]["output"];
  /** Date and time the Organization's current Plan expires */
  planExpiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  signingKeys: OrganizationSigningKeyConnection;
  /** Specifies whether the Organization's account has been suspended by Prismatic. */
  systemSuspended: Scalars["Boolean"]["output"];
  /** The Theme associated with an Organization */
  theme?: Maybe<Theme>;
  /** The Organization that the User belongs to, if any. If this is NULL then Customer will be specified. */
  users: UserConnection;
  /** This field has been deprecated. */
  usesBillingPortal: Scalars["Boolean"]["output"];
};

/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationComponentsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  searchTerms_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionCreatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionCreatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationCredentialsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  authorizationMethod_Key?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CredentialOrder>;
  readyForUse?: InputMaybe<Scalars["Boolean"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CredentialOrder>>>;
};

/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationCustomersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  externalId_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  isSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  name_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CustomerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationIntegrationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flows_IsAgentFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOutdatedComponents?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasUnpublishedChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCodeNative?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  marketplace?: InputMaybe<Scalars["Boolean"]["input"]>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationSigningKeysArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<OrganizationSigningKeyOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<OrganizationSigningKeyOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

/**
 * Represents an organization, which is the top-level object under which all
 * other objects, such as Users, Customers, Integrations, etc., exist.
 */
export type OrganizationUsersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  email_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  externalId_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  includeMarketplaceUsers?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type OrganizationReturnObject = {
  __typename?: "OrganizationReturnObject";
  allowConfiguringInstanceMemory?: Maybe<Scalars["Boolean"]["output"]>;
  allowCustomTheme?: Maybe<Scalars["Boolean"]["output"]>;
  allowDisablingInstanceOutputs?: Maybe<Scalars["Boolean"]["output"]>;
  allowEmbeddedDesigner?: Maybe<Scalars["Boolean"]["output"]>;
  allowEmbeddedWorkflowBuilder?: Maybe<Scalars["Boolean"]["output"]>;
  allowExecutionRetry?: Maybe<Scalars["Boolean"]["output"]>;
  allowExternalLogStreams?: Maybe<Scalars["Boolean"]["output"]>;
  allowLongRunningExecutions?: Maybe<Scalars["Boolean"]["output"]>;
  allowOnPremAgent?: Maybe<Scalars["Boolean"]["output"]>;
  allowUserLevelConfig?: Maybe<Scalars["Boolean"]["output"]>;
  concurrentExecutionLimit?: Maybe<Scalars["Int"]["output"]>;
  concurrentLreLimit?: Maybe<Scalars["Int"]["output"]>;
  orgId?: Maybe<Scalars["String"]["output"]>;
  orgName?: Maybe<Scalars["String"]["output"]>;
  orgTenantId?: Maybe<Scalars["String"]["output"]>;
  planExpiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  planName?: Maybe<Scalars["String"]["output"]>;
  salesforceId?: Maybe<Scalars["String"]["output"]>;
  systemSuspended?: Maybe<Scalars["Boolean"]["output"]>;
};

/**
 * Represents an Organization's Signing Keys which are used to allow verification
 * of sessions from external systems.
 */
export type OrganizationSigningKey = Node & {
  __typename?: "OrganizationSigningKey";
  /** Specifies whether the signed-in User can remove the OrganizationSigningKey. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the OrganizationSigningKey. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Indicates if the public key was imported (as opposed to generated in Prismatic) */
  imported: Scalars["Boolean"]["output"];
  /** The timestamp at which the Signing Key was issued. */
  issuedAt: Scalars["DateTime"]["output"];
  /** Preview of Private Key of the Signing Keypair. */
  privateKeyPreview: Scalars["String"]["output"];
  /** Public key of the Signing Keypair. */
  publicKey: Scalars["String"]["output"];
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
};

/** Represents a Relay Connection to a collection of OrganizationSigningKey objects. */
export type OrganizationSigningKeyConnection = {
  __typename?: "OrganizationSigningKeyConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<OrganizationSigningKeyEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<OrganizationSigningKey>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related OrganizationSigningKey object and a cursor for pagination. */
export type OrganizationSigningKeyEdge = {
  __typename?: "OrganizationSigningKeyEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<OrganizationSigningKey>;
};

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

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: "PageInfo";
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars["String"]["output"]>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars["Boolean"]["output"];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars["Boolean"]["output"];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars["String"]["output"]>;
};

/**
 * Represents an object permission, which grants some access to a specific
 * user relative to a specific object.
 */
export type Permission = Node & {
  __typename?: "Permission";
  /** Specifies whether the signed-in User can remove the Permission. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Permission. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Description of the Permission. */
  description: Scalars["String"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Name of the Permission. */
  name: Scalars["String"]["output"];
  /** The type of object that the Permission is associated with. */
  objType: AuthObjectType;
  /** A unique string identity value. */
  tag: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of Permission objects. */
export type PermissionConnection = {
  __typename?: "PermissionConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<PermissionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Permission>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related Permission object and a cursor for pagination. */
export type PermissionEdge = {
  __typename?: "PermissionEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Permission>;
};

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

export type PromoteOrganizationOwnerInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The Organization that the User belongs to, if any. If this is NULL then Customer will be specified. */
  orgId: Scalars["ID"]["input"];
  /** Email of Organization User to promote (case insensitive) */
  user: Scalars["String"]["input"];
};

export type PromoteOrganizationOwnerPayload = {
  __typename?: "PromoteOrganizationOwnerPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

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

export type PublishComponentPayload = {
  __typename?: "PublishComponentPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  publishResult?: Maybe<PublishComponentResult>;
};

export type PublishComponentResult = {
  __typename?: "PublishComponentResult";
  component?: Maybe<Component>;
  connectionAvatarIconUploadUrls?: Maybe<Array<Maybe<ConnectionIconUploadUrl>>>;
  connectionIconUploadUrls?: Maybe<Array<Maybe<ConnectionIconUploadUrl>>>;
  iconUploadUrl?: Maybe<Scalars["String"]["output"]>;
  packageUploadUrl?: Maybe<Scalars["String"]["output"]>;
  sourceUploadUrl?: Maybe<Scalars["String"]["output"]>;
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

export type PublishIntegrationPayload = {
  __typename?: "PublishIntegrationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type PublishWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Comment about changes in this published Workflow version. */
  comment?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type PublishWorkflowPayload = {
  __typename?: "PublishWorkflowPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  workflow?: Maybe<Workflow>;
};

export type RegisterEndToEndTestingOrganizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
};

export type RegisterEndToEndTestingOrganizationPayload = {
  __typename?: "RegisterEndToEndTestingOrganizationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<RegisterEndToEndTestingOrganizationResult>;
};

export type RegisterEndToEndTestingOrganizationResult = {
  __typename?: "RegisterEndToEndTestingOrganizationResult";
  result: Scalars["JSONString"]["output"];
};

export type RegisterInternalOrganizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Name of the Organization. */
  orgName: Scalars["String"]["input"];
  /** Email of the Owner user. */
  ownerEmail: Scalars["String"]["input"];
  /** Name of the Owner user. */
  ownerName: Scalars["String"]["input"];
  /** Password of the Owner user. */
  ownerPassword: Scalars["String"]["input"];
};

export type RegisterInternalOrganizationPayload = {
  __typename?: "RegisterInternalOrganizationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<RegisterInternalOrganizationResult>;
};

export type RegisterInternalOrganizationResult = {
  __typename?: "RegisterInternalOrganizationResult";
  orgId?: Maybe<Scalars["ID"]["output"]>;
};

export type RegisterOrganizationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Name of the Organization. */
  orgName: Scalars["String"]["input"];
  /** Email of the Owner user. */
  ownerEmail: Scalars["String"]["input"];
  /** Name of the Owner user. */
  ownerName: Scalars["String"]["input"];
};

export type RegisterOrganizationPayload = {
  __typename?: "RegisterOrganizationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<RegisterOrganizationResult>;
};

export type RegisterOrganizationResult = {
  __typename?: "RegisterOrganizationResult";
  orgId?: Maybe<Scalars["ID"]["output"]>;
  orgName?: Maybe<Scalars["String"]["output"]>;
};

export type RemoveBlockedRequestIdsInput = {
  /** The requestId to unblock. */
  blockedId: Scalars["ID"]["input"];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
};

export type RemoveBlockedRequestIdsPayload = {
  __typename?: "RemoveBlockedRequestIdsPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<UpdateBlockedIdsResult>;
};

export type RemoveFifoQueueItemsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Flow config ID to remove items from */
  flowConfigId: Scalars["ID"]["input"];
  /** Number of items to remove from front of queue (1-100) */
  itemCount: Scalars["Int"]["input"];
};

export type RemoveFifoQueueItemsPayload = {
  __typename?: "RemoveFifoQueueItemsPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type RemoveSingletonExecutionLockInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The flow config ID for the singleton lock to remove */
  flowConfigId: Scalars["String"]["input"];
  /** The tenant ID for the singleton lock to remove */
  tenantId: Scalars["String"]["input"];
};

export type RemoveSingletonExecutionLockPayload = {
  __typename?: "RemoveSingletonExecutionLockPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type ReplayExecutionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the InstanceExecutionResult to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ReplayExecutionPayload = {
  __typename?: "ReplayExecutionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instanceExecutionResult?: Maybe<InstanceExecutionResult>;
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

export type RequestOAuth2CredentialAuthorizationPayload = {
  __typename?: "RequestOAuth2CredentialAuthorizationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
};

export type RequiredComponentInput = {
  key: Scalars["String"]["input"];
  public: Scalars["Boolean"]["input"];
};

/** Represents a Required Config Variable (with optional default value) associated with an Integration. */
export type RequiredConfigVariable = Node & {
  __typename?: "RequiredConfigVariable";
  /** Specifies whether the signed-in User can remove the RequiredConfigVariable. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the RequiredConfigVariable. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The language to use in the code editor UI when the Required Config Var uses the 'code' dataType. */
  codeLanguage?: Maybe<RequiredConfigVariableCodeLanguage>;
  /** The type of collection, if the value is meant to represent a collection of values for this RequiredConfigVariable. */
  collectionType?: Maybe<RequiredConfigVariableCollectionType>;
  /** The Connection type used by this Required Config Variable. */
  connection?: Maybe<Connection>;
  /** The Connection Template from which this config var was derived. */
  connectionTemplate?: Maybe<ConnectionTemplate>;
  /** The Required Config Var for which the Authorization Method is a valid type of Credential. */
  credentialTypes: RequiredConfigVariableCredentialTypeConnection;
  /** The Component Data Source used by this Required Config Variable. */
  dataSource?: Maybe<Action>;
  /** The intended datatype of the Required Config Var, used to choose an appropriate UI. */
  dataType: RequiredConfigVariableDataType;
  /** The default value for the Required Config Variable if none is specified on the Instance. */
  defaultValue?: Maybe<Scalars["String"]["output"]>;
  /** Additional notes about the Required Config Var. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** This field has been deprecated. */
  hasDivider: Scalars["Boolean"]["output"];
  /** The header text that will appear in the UI above the Required Config Variable fields. */
  header?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The collection of Expressions that serve as inputs to the RequiredConfigVariable. */
  inputs?: Maybe<ExpressionConnection>;
  integration: Integration;
  /** The Key for the Required Config Variable. Referred to as 'Name' in the UI. */
  key: Scalars["String"]["output"];
  /** Contains arbitrary metadata about this Required Config Var. */
  meta?: Maybe<Scalars["JSONString"]["output"]>;
  /** Specifies the configuration for this Required Config Variable with respect to using an On-Prem Resource connection. */
  onPremiseConnectionConfig: RequiredConfigVariableOnPremiseConnectionConfig;
  /** Specifies whether the Required Config Variable is only viewable by Organization Users. */
  orgOnly?: Maybe<Scalars["Boolean"]["output"]>;
  /** The valid choices when the Required Config Var uses the 'picklist' dataType. */
  pickList?: Maybe<Array<Scalars["String"]["output"]>>;
  /** The schedule type to show in the UI when the Required Config Var uses the 'schedule' dataType. */
  scheduleType?: Maybe<RequiredConfigVariableScheduleType>;
  /** Scoped Config Variable providing configuration for this Required Config Variable. */
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
  /** The UI location in which this Required Config Var will appear relative to the other Required Config Vars for the Integration. */
  sortOrder?: Maybe<Scalars["Int"]["output"]>;
  /** Represents identity across different Required Config Variable versions. Not intended to be used directly by end users, as the implementation may change at any time. */
  stableId?: Maybe<Scalars["UUID"]["output"]>;
  /** A user-provided value that represents identity across config var key renames. */
  stableKey?: Maybe<Scalars["String"]["output"]>;
  /** An optional timezone property for when the Required Config Var uses the 'schedule' dataType. */
  timeZone?: Maybe<Scalars["String"]["output"]>;
  /** Specifies whether this Required Config Variable uses values from User Level Configs. */
  userLevelConfigured: Scalars["Boolean"]["output"];
};

/** Represents a Required Config Variable (with optional default value) associated with an Integration. */
export type RequiredConfigVariableCredentialTypesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents a Required Config Variable (with optional default value) associated with an Integration. */
export type RequiredConfigVariableInputsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  visibleToCustomerDeployer?: InputMaybe<Scalars["Boolean"]["input"]>;
  visibleToOrgDeployer?: InputMaybe<Scalars["Boolean"]["input"]>;
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

/** Represents a Relay Connection to a collection of RequiredConfigVariable objects. */
export type RequiredConfigVariableConnection = {
  __typename?: "RequiredConfigVariableConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<RequiredConfigVariableEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<RequiredConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** Represents a valid Credential Type for a Required Config Variable. */
export type RequiredConfigVariableCredentialType = Node & {
  __typename?: "RequiredConfigVariableCredentialType";
  /** Specifies whether the signed-in User can remove the RequiredConfigVariableCredentialType. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the RequiredConfigVariableCredentialType. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Authorization Method that represents a valid Credential type for the Required Config Var. */
  authorizationMethod: AuthorizationMethod;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Required Config Var for which the Authorization Method is a valid type of Credential. */
  requiredConfigVariable: RequiredConfigVariable;
};

/** Represents a Relay Connection to a collection of RequiredConfigVariableCredentialType objects. */
export type RequiredConfigVariableCredentialTypeConnection = {
  __typename?: "RequiredConfigVariableCredentialTypeConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<RequiredConfigVariableCredentialTypeEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<RequiredConfigVariableCredentialType>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related RequiredConfigVariableCredentialType object and a cursor for pagination. */
export type RequiredConfigVariableCredentialTypeEdge = {
  __typename?: "RequiredConfigVariableCredentialTypeEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<RequiredConfigVariableCredentialType>;
};

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

/** A Relay edge to a related RequiredConfigVariable object and a cursor for pagination. */
export type RequiredConfigVariableEdge = {
  __typename?: "RequiredConfigVariableEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<RequiredConfigVariable>;
};

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

export type RetryScheduleStatsResult = {
  __typename?: "RetryScheduleStatsResult";
  /** Number of retries ready to execute now */
  readyCount?: Maybe<Scalars["Int"]["output"]>;
  /** Total number of scheduled retries */
  totalCount?: Maybe<Scalars["Int"]["output"]>;
};

export type ReusableConnection = CustomerConfigVariable | ScopedConfigVariable;

/** Represents a Relay Connection to a collection of ReusableConnection objects. */
export type ReusableConnectionConnection = {
  __typename?: "ReusableConnectionConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ReusableConnectionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ReusableConnection>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related ReusableConnection object and a cursor for pagination. */
export type ReusableConnectionEdge = {
  __typename?: "ReusableConnectionEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<ReusableConnection>;
};

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

/**
 * Represents an object role, which is just a collection of object permissions
 * that pertain to a specific object for a specific user.
 */
export type Role = Node & {
  __typename?: "Role";
  /** Specifies whether the signed-in User can remove the Role. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Role. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Description of the Role. */
  description: Scalars["String"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** An integer that specifies the level of privilege with respect to other Roles. */
  level: Scalars["Int"]["output"];
  /** The name of the Role. Must be unique within the context of the AuthObjectType. */
  name: Scalars["String"]["output"];
  /** The type of object that the Role is associated with. */
  objType: AuthObjectType;
  /** List of Permissions that the Role provides. */
  permissions: PermissionConnection;
};

/**
 * Represents an object role, which is just a collection of object permissions
 * that pertain to a specific object for a specific user.
 */
export type RolePermissionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  objType?: InputMaybe<Scalars["ID"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<PermissionOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<PermissionOrder>>>;
};

export type RootMutation = {
  __typename?: "RootMutation";
  /**
   *
   * Add a requestId to the list of blocked requestIds.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  addBlockedRequestIds?: Maybe<AddBlockedRequestIdsPayload>;
  /**
   *
   * Adds all users from an organization to the control plane.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  addOrgUsersToControlPlane?: Maybe<AddOrgUsersToControlPlanePayload>;
  /**
   *
   * Administers a Permission to an object for the specified User.
   *
   *
   * Access is not permitted.
   */
  administerObjectPermission?: Maybe<AdministerObjectPermissionPayload>;
  /**
   *
   * Disables all Instances that reference the specified Scoped Config Variable
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  bulkDisableInstancesUsingConnection?: Maybe<BulkDisableInstancesUsingConnectionPayload>;
  /**
   *
   * Disables all Instances that reference the specified Customer Config Variable
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  bulkDisableInstancesUsingCustomerConnection?: Maybe<BulkDisableInstancesUsingCustomerConnectionPayload>;
  /**
   *
   * Updates all Instances that reference the specified Integration to the
   * latest published version of the specified Integration. If the Instances
   * are deployed, it will re-deploy them as necessary.
   * Returns an instance of the latest version of the specified Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  bulkUpdateInstancesToLatestIntegrationVersion?: Maybe<BulkUpdateInstancesToLatestIntegrationVersionPayload>;
  /**
   *
   * Allows the signed-in User to change their password.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when a value for 'customer' does not exist on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users] when a value for 'customer' exists on the object.
   *     4. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when a value for 'customer' exists on the object.
   */
  changePassword?: Maybe<ChangePasswordPayload>;
  /**
   *
   * Allows clearing a triggered AlertMonitor.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances].
   */
  clearAlertMonitor?: Maybe<ClearAlertMonitorPayload>;
  /**
   *     Mutation to clear all FIFO queue data for a flow config.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  clearAllFifoData?: Maybe<ClearAllFifoDataPayload>;
  /**
   *     Mutation to clear FIFO working set.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  clearFifoWorkingSet?: Maybe<ClearFifoWorkingSetPayload>;
  /**
   *     Mutation to manage retry schedule.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  clearRetrySchedule?: Maybe<ClearRetrySchedulePayload>;
  /**
   *     None
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  convertLowCodeIntegration?: Maybe<ConvertLowCodeIntegrationPayload>;
  /**
   *     Creates a new AlertGroup object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  createAlertGroup?: Maybe<CreateAlertGroupPayload>;
  /**
   *     Creates a new AlertMonitor object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  createAlertMonitor?: Maybe<CreateAlertMonitorPayload>;
  /**
   *     Creates a new AlertWebhook object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  createAlertWebhook?: Maybe<CreateAlertWebhookPayload>;
  /**
   *     Creates a new ConnectionTemplate object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   */
  createConnectionTemplate?: Maybe<CreateConnectionTemplatePayload>;
  /**
   *     Creates a new Customer object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   */
  createCustomer?: Maybe<CreateCustomerPayload>;
  /**
   *     Creates a new CustomerConfigVariable object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when 'customer' is provided in the access function context.
   */
  createCustomerConfigVariable?: Maybe<CreateCustomerConfigVariablePayload>;
  /**
   *     DEPRECATED.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_edit] when 'customer' is provided in the access function context.
   */
  createCustomerCredential?: Maybe<CreateCustomerCredentialPayload>;
  /**
   *
   * Creates a User for the specified Customer.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_admin_users] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when 'customer' is provided in the access function context.
   */
  createCustomerUser?: Maybe<CreateCustomerUserPayload>;
  /**
   *     Creates a new ExternalLogStream object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  createExternalLogStream?: Maybe<CreateExternalLogStreamPayload>;
  /**
   *     Creates a new Instance object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_admin_manage_instances, customer_manage_marketplace_integrations] when 'customer' is provided in the access function context.
   */
  createInstance?: Maybe<CreateInstancePayload>;
  /**
   *     Creates a new InstanceProfile object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  createInstanceProfile?: Maybe<CreateInstanceProfilePayload>;
  /**
   *     Creates a new Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when a value for 'customer.allow_embedded_designer' is provided in the access function context and equals 'True'.
   */
  createIntegration?: Maybe<CreateIntegrationPayload>;
  /**
   *
   * Creates a JWT that is used to perform registration of an
   * On-Prem Resource. Rather than being short-lived, it is valid until
   * the identity_key is changed.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_edit, customer_admin_manage_instances, customer_manage_marketplace_integrations] when 'customer' is provided in the access function context.
   */
  createOnPremiseResourceJWT?: Maybe<CreateOnPremiseResourceJwtPayload>;
  /**
   *     DEPRECATED.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_edit] when 'customer' is provided in the access function context.
   */
  createOrganizationCredential?: Maybe<CreateOrganizationCredentialPayload>;
  /**
   *
   * Creates a new organization in a stack and attach a plan to that organization. If no plan template is specified, uses the existing "Enterprise Trial" plan. Passed in user must already exist.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  createOrganizationNewStack?: Maybe<CreateOrganizationNewStackPayload>;
  /**
   *
   * Create a custom Plan and Utilization Limits for an existing Organization.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  createOrganizationPlan?: Maybe<CreateOrganizationPlanPayload>;
  /**
   *
   * Creates a Signing Key for the Organization of the signed-in User.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  createOrganizationSigningKey?: Maybe<CreateOrganizationSigningKeyPayload>;
  /**
   *
   * Creates a User for the Organization of the signed-in User.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_admin_users] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when 'customer' is provided in the access function context.
   */
  createOrganizationUser?: Maybe<CreateOrganizationUserPayload>;
  /**
   *     Creates a new ScopedConfigVariable object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when 'customer' is provided in the access function context.
   */
  createScopedConfigVariable?: Maybe<CreateScopedConfigVariablePayload>;
  /**
   *
   * Create a new TestCase.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the access function context object 'integration_Customer': [customer_admin_integration_permissions, customer_manage_integrations].
   */
  createTestCase?: Maybe<CreateTestCasePayload>;
  /**
   *     Creates a new UserLevelConfig object.
   *
   * Access is not permitted.
   */
  createUserLevelConfig?: Maybe<CreateUserLevelConfigPayload>;
  /**
   *     Creates a new WebhookEndpoint object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  createWebhookEndpoint?: Maybe<CreateWebhookEndpointPayload>;
  /**
   *     Removes the specified AlertGroup object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  deleteAlertGroup?: Maybe<DeleteAlertGroupPayload>;
  /**
   *     Removes the specified AlertMonitor object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   */
  deleteAlertMonitor?: Maybe<DeleteAlertMonitorPayload>;
  /**
   *     Removes the specified AlertWebhook object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  deleteAlertWebhook?: Maybe<DeleteAlertWebhookPayload>;
  /**
   *     Removes the specified Component object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_components].
   *     2. The signed-in User has any of the following permissions for any version of the object: [component_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_component_permissions, customer_manage_components, customer_view_components].
   */
  deleteComponent?: Maybe<DeleteComponentPayload>;
  /**
   *     Removes the specified ConnectionTemplate object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   */
  deleteConnectionTemplate?: Maybe<DeleteConnectionTemplatePayload>;
  /**
   *     DEPRECATED.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_edit] when a value for 'customer' exists on the object.
   */
  deleteCredential?: Maybe<DeleteCredentialPayload>;
  /**
   *     Removes the specified Customer object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_remove].
   */
  deleteCustomer?: Maybe<DeleteCustomerPayload>;
  /**
   *     Removes the specified CustomerConfigVariable object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  deleteCustomerConfigVariable?: Maybe<DeleteCustomerConfigVariablePayload>;
  /**
   *     Removes the specified ExternalLogStream object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  deleteExternalLogStream?: Maybe<DeleteExternalLogStreamPayload>;
  /**
   *     Removes the specified Instance object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   */
  deleteInstance?: Maybe<DeleteInstancePayload>;
  /**
   *     Removes the specified InstanceProfile object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  deleteInstanceProfile?: Maybe<DeleteInstanceProfilePayload>;
  /**
   *     Removes the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  deleteIntegration?: Maybe<DeleteIntegrationPayload>;
  /**
   *
   * Delete a standard IntegrationTemplate.
   *
   * This mutation pertains to standard IntegrationTemplates, not the case of
   * marking an Integration as a template. If you have an Integration marked
   * as a template that you wish to remove, use UpdateIntegration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'variant' exists on the object and equals 'workflow' and a value for 'public' exists on the object and equals 'False'.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'variant' is provided in the access function context and equals 'workflow' and a value for 'public' is provided in the access function context and equals 'False'.
   */
  deleteIntegrationTemplate?: Maybe<DeleteIntegrationTemplatePayload>;
  /**
   *     Removes the specified OnPremiseResource object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_remove, customer_admin_manage_instances, customer_manage_marketplace_integrations].
   */
  deleteOnPremiseResource?: Maybe<DeleteOnPremiseResourcePayload>;
  /**
   *     Removes the specified Organization object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_superuser].
   */
  deleteOrganization?: Maybe<DeleteOrganizationPayload>;
  /**
   *
   * Deletes the specified Signing Key.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  deleteOrganizationSigningKey?: Maybe<DeleteOrganizationSigningKeyPayload>;
  /**
   *     Removes the specified ScopedConfigVariable object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  deleteScopedConfigVariable?: Maybe<DeleteScopedConfigVariablePayload>;
  /**
   *
   * Delete a TestCase.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations].
   */
  deleteTestCase?: Maybe<DeleteTestCasePayload>;
  /**
   *     Removes the specified User object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when the specified object is not the signed-in User and a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users] when the specified object is not the signed-in User and a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when the specified object is not the signed-in User and a value for 'customer' exists on the object.
   */
  deleteUser?: Maybe<DeleteUserPayload>;
  /**
   *     Removes the specified UserLevelConfig object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     3. The specified object is the signed-in User.
   */
  deleteUserLevelConfig?: Maybe<DeleteUserLevelConfigPayload>;
  /**
   *     Removes the specified WebhookEndpoint object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  deleteWebhookEndpoint?: Maybe<DeleteWebhookEndpointPayload>;
  /**
   *     Removes the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  deleteWorkflow?: Maybe<DeleteWorkflowPayload>;
  /**
   *     Removes the specified WorkflowTemplate object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'variant' exists on the object and equals 'workflow' and a value for 'public' exists on the object and equals 'False'.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'variant' is provided in the access function context and equals 'workflow' and a value for 'public' is provided in the access function context and equals 'False'.
   */
  deleteWorkflowTemplate?: Maybe<DeleteWorkflowTemplatePayload>;
  /**
   *
   * Deploys an Instance.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   */
  deployInstance?: Maybe<DeployInstancePayload>;
  /**
   *
   * Disable an organization by org ID
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  disableOrganization?: Maybe<DisableOrganizationPayload>;
  /**
   *
   * Disable access to an organization that was enabled for support.
   * Soft-deletes the User record and removes from control plane.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when the specified object is not the signed-in User and a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users] when the specified object is not the signed-in User and a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when the specified object is not the signed-in User and a value for 'customer' exists on the object.
   */
  disableOrganizationAccess?: Maybe<DisableOrganizationAccessPayload>;
  /**
   *     None
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  disableWorkflow?: Maybe<DisableWorkflowPayload>;
  /**
   *
   * Disconnect the specified Connection.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   */
  disconnectConnection?: Maybe<DisconnectConnectionPayload>;
  /**
   *
   * Disconnect the specified Customer Connection.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  disconnectCustomerConnection?: Maybe<DisconnectCustomerConnectionPayload>;
  /**
   *
   * Disconnect the specified Scoped Connection.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  disconnectScopedConnection?: Maybe<DisconnectScopedConnectionPayload>;
  /**
   *
   * Disconnect the specified User Level Connection.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The specified object is the signed-in User.
   */
  disconnectUserLevelConnection?: Maybe<DisconnectUserLevelConnectionPayload>;
  /**
   *
   * Enable an organization by org ID
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  enableOrganization?: Maybe<EnableOrganizationPayload>;
  /**
   *
   * Enable access to a target organization for support/impersonation.
   * Creates a new User record in the target organization with the current user's email.
   * Does not send an Auth0 invite as the user already has an Auth0 account.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when 'customer' is not provided in the access function context.
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_admin_users] when 'customer' is provided in the access function context.
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when 'customer' is provided in the access function context.
   */
  enableOrganizationAccess?: Maybe<EnableOrganizationAccessPayload>;
  /**
   *     None
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  enableWorkflow?: Maybe<EnableWorkflowPayload>;
  /**
   *
   * Populates content for relevant widgets on the specified configuration
   * wizard page of the Integration that is associated with the specified
   * Instance.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   *     6. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_access_marketplace_integrations] when a value for 'integration.user_level_configured' exists on the object and equals 'True'.
   */
  fetchConfigWizardPageContent?: Maybe<FetchConfigWizardPageContentPayload>;
  /**
   *
   * Populates content for a single Data Source in the context of the specified
   * Instance.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  fetchDataSourceContent?: Maybe<FetchDataSourceContentPayload>;
  /**
   *
   * Return all organizations with enterprise or professional plans.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_view].
   */
  findPaidOrganizations?: Maybe<FindPaidOrganizationsPayload>;
  /**
   *
   * Finds a user's ID from their email address.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users, org_view_users].
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users, customer_view_users].
   */
  findUserByEmail?: Maybe<FindUserByEmailPayload>;
  /**
   *
   * Forks an Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when a value for 'customer.allow_embedded_designer' is provided in the access function context and equals 'True'.
   */
  forkIntegration?: Maybe<ForkIntegrationPayload>;
  /**
   *
   * Import an Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  importIntegration?: Maybe<ImportIntegrationPayload>;
  /**
   *
   * Import a standard IntegrationTemplate from a YAML definition.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'variant' exists on the object and equals 'workflow' and a value for 'public' exists on the object and equals 'False'.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'variant' is provided in the access function context and equals 'workflow' and a value for 'public' is provided in the access function context and equals 'False'.
   */
  importIntegrationTemplate?: Maybe<ImportIntegrationTemplatePayload>;
  /**
   *     Creates a new OrganizationSigningKey object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  importOrganizationSigningKey?: Maybe<ImportOrganizationSigningKeyPayload>;
  /**
   *     None
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  importWorkflow?: Maybe<ImportWorkflowPayload>;
  /**
   *
   * Promote a user to be an Organization Owner.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when a value for 'customer' does not exist on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users] when a value for 'customer' exists on the object.
   *     4. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when a value for 'customer' exists on the object.
   */
  promoteOrganizationOwner?: Maybe<PromoteOrganizationOwnerPayload>;
  /**
   *
   * Publishes a Component.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_components].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_components] when 'customer' is provided in the access function context.
   */
  publishComponent?: Maybe<PublishComponentPayload>;
  /**
   *
   * Publishes an Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when 'customer' is provided in the access function context.
   */
  publishIntegration?: Maybe<PublishIntegrationPayload>;
  /**
   *
   * Publishes a Workflow.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_manage_integrations] when 'customer' is provided in the access function context.
   */
  publishWorkflow?: Maybe<PublishWorkflowPayload>;
  /**
   *
   * Register a new end-to-end testing Organization. This deals with all details of an e2e
   * tenant including feature flags, required user creation, and so on.
   *
   *
   * Access is not permitted.
   */
  registerEndToEndTestingOrganization?: Maybe<RegisterEndToEndTestingOrganizationPayload>;
  /**
   *
   * Register a new Internal Organization. This allows scripting creation and ensuring that our internal tenant emails
   * end up in a valid state (verified).
   *
   *
   * Access is not permitted.
   */
  registerInternalOrganization?: Maybe<RegisterInternalOrganizationPayload>;
  /**
   *
   * Register a new Organization. This serves as the new website's method of registering.
   *
   *
   * Access is not permitted.
   */
  registerOrganization?: Maybe<RegisterOrganizationPayload>;
  /**
   *
   * Remove a requestId from the list of blocked requestIds.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  removeBlockedRequestIds?: Maybe<RemoveBlockedRequestIdsPayload>;
  /**
   *     Mutation to remove items from the front of a FIFO queue.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  removeFifoQueueItems?: Maybe<RemoveFifoQueueItemsPayload>;
  /**
   *     Force unlock singleton executions.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  removeSingletonExecutionLock?: Maybe<RemoveSingletonExecutionLockPayload>;
  /**
   *
   * Replays an existing instance execution.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_edit, integration_admin_permissions].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  replayExecution?: Maybe<ReplayExecutionPayload>;
  /**
   *     DEPRECATED.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_edit] when a value for 'customer' exists on the object.
   */
  requestOAuth2CredentialAuthorization?: Maybe<RequestOAuth2CredentialAuthorizationPayload>;
  /**
   *
   * Rotates the identity_key of an On-Prem Resource and returns a new JWT.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   *     2. The signed-in User has any of the following permissions for the access function context object 'customer': [customer_edit, customer_admin_manage_instances, customer_manage_marketplace_integrations] when 'customer' is provided in the access function context.
   */
  rotateOnPremiseResourceJWT?: Maybe<RotateOnPremiseResourceJwtPayload>;
  /**
   *     None
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'variant' exists on the object and equals 'workflow' and a value for 'public' exists on the object and equals 'False'.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'variant' is provided in the access function context and equals 'workflow' and a value for 'public' is provided in the access function context and equals 'False'.
   */
  saveWorkflowTemplate?: Maybe<SaveWorkflowTemplatePayload>;
  /**
   *
   * Searches for organizations by name, Salesforce ID, or organization ID.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_view].
   */
  searchOrganizations?: Maybe<SearchOrganizationsPayload>;
  /**
   *
   * Set the Plan for an existing Organization and recreate utilization status limit records.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  setOrganizationPlan?: Maybe<SetOrganizationPlanPayload>;
  /**
   *
   * Set the expiration time for the Organization's current Plan.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  setOrganizationPlanExpiresAt?: Maybe<SetOrganizationPlanExpiresAtPayload>;
  /**
   *
   * Set the Salesforce ID for an existing Organization.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  setOrganizationSalesforceId?: Maybe<SetOrganizationSalesforceIdPayload>;
  /**
   *
   * Enable or disable features for a specified Organization's plan.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  setPlanEnabledFeatures?: Maybe<SetPlanEnabledFeaturesPayload>;
  /**
   *
   * Tests an IntegrationFlow's trigger event function for the specified event type.
   *
   *
   * Access is not permitted.
   */
  testFlowTriggerEvent?: Maybe<TestFlowTriggerEventPayload>;
  /**
   *
   * Initiates execution of an InstanceFlowConfig for the purposes of testing.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'instance_Integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  testInstanceFlowConfig?: Maybe<TestInstanceFlowConfigPayload>;
  /**
   *
   * Initiates an execution for testing the endpoint configuration of the specified Integration.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  testIntegrationEndpointConfig?: Maybe<TestIntegrationEndpointConfigPayload>;
  /**
   *
   * Initiates execution of an IntegrationFlow for the purposes of testing.
   *
   *
   * Access is not permitted.
   */
  testIntegrationFlow?: Maybe<TestIntegrationFlowPayload>;
  /**
   *
   * Send a test event to a webhook endpoint to verify it's working correctly.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  testWebhookEndpoint?: Maybe<TestWebhookEndpointPayload>;
  /**
   *
   * Toggle whether the show the G2 Review Banner for the specified user
   * given their email address.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users, org_view_users].
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users, customer_view_users].
   */
  toggleShowG2ReviewBanner?: Maybe<ToggleShowG2ReviewBannerPayload>;
  /**
   *     Updates the specified AlertGroup object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  updateAlertGroup?: Maybe<UpdateAlertGroupPayload>;
  /**
   *     Updates the specified AlertMonitor object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances].
   */
  updateAlertMonitor?: Maybe<UpdateAlertMonitorPayload>;
  /**
   *     Updates the specified AlertWebhook object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  updateAlertWebhook?: Maybe<UpdateAlertWebhookPayload>;
  /**
   *
   * Users should not be able to actually update a component,
   * but will use this mutation to update the "starred" status
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object has attributes public with value True..
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_component_permissions, org_manage_components, org_view_components].
   *     3. The signed-in User has any of the following permissions for any version of the object: [component_view, component_edit, component_remove, component_admin_permissions, component_publish_new_version].
   *     4. The signed-in User has any of the following permissions for the associated Customer: [customer_view_org_components].
   */
  updateComponent?: Maybe<UpdateComponentPayload>;
  /**
   *     Updates the specified ConnectionTemplate object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   */
  updateConnectionTemplate?: Maybe<UpdateConnectionTemplatePayload>;
  /**
   *     DEPRECATED.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations] when a value for 'customer' does not exist on the object.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_manage_integrations] when a value for 'customer' exists on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_edit] when a value for 'customer' exists on the object.
   */
  updateCredential?: Maybe<UpdateCredentialPayload>;
  /**
   *     Updates the specified Customer object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_crud_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_edit].
   */
  updateCustomer?: Maybe<UpdateCustomerPayload>;
  /**
   *     Updates the specified CustomerConfigVariable object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  updateCustomerConfigVariable?: Maybe<UpdateCustomerConfigVariablePayload>;
  /**
   *
   * Update OAuth2 Connection properties for a given Customer Config Variable.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  updateCustomerOAuth2Connection?: Maybe<UpdateCustomerOAuth2ConnectionPayload>;
  /**
   *     None
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  updateEmbedded?: Maybe<UpdateEmbeddedPayload>;
  /**
   *     Updates the specified ExternalLogStream object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  updateExternalLogStream?: Maybe<UpdateExternalLogStreamPayload>;
  /**
   *     Updates the specified Instance object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  updateInstance?: Maybe<UpdateInstancePayload>;
  /**
   *
   * Update one or more Instance config variables.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   *     6. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_access_marketplace_integrations] when a value for 'integration.user_level_configured' exists on the object and equals 'True'.
   */
  updateInstanceConfigVariables?: Maybe<UpdateInstanceConfigVariablesPayload>;
  /**
   *     Updates the specified InstanceProfile object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   */
  updateInstanceProfile?: Maybe<UpdateInstanceProfilePayload>;
  /**
   *
   * Refresh all Instances that refer to the specified Customer Config Variable.
   * This re-computes the Instance's config variables and connection inputs.
   * If the Instances are deployed, it will redeploy them as necessary.
   * This mutation does not update the Instance to the latest Integration version.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  updateInstancesUsingCustomerConfigVariable?: Maybe<UpdateInstancesUsingCustomerConfigVariablePayload>;
  /**
   *     Updates the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  updateIntegration?: Maybe<UpdateIntegrationPayload>;
  /**
   *
   * Updates the configuration of an Integration Version for use in the Integration Marketplace.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  updateIntegrationMarketplaceConfiguration?: Maybe<UpdateIntegrationMarketplaceConfigurationPayload>;
  /**
   *     Updates the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  updateIntegrationTestConfiguration?: Maybe<UpdateIntegrationTestConfigurationPayload>;
  /**
   *
   * Updates the availability of an Integration version.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  updateIntegrationVersionAvailability?: Maybe<UpdateIntegrationVersionAvailabilityPayload>;
  /**
   *
   * Update OAuth2 Connection properties for a given Instance Config Variable.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_manage_marketplace_integrations].
   */
  updateOAuth2Connection?: Maybe<UpdateOAuth2ConnectionPayload>;
  /**
   *     Updates the specified Organization object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_admin_users].
   */
  updateOrganization?: Maybe<UpdateOrganizationPayload>;
  /**
   *     Updates the specified ScopedConfigVariable object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  updateScopedConfigVariable?: Maybe<UpdateScopedConfigVariablePayload>;
  /**
   *
   * Update OAuth2 Connection properties for a given Scoped Config Variable.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  updateScopedOAuth2Connection?: Maybe<UpdateScopedOAuth2ConnectionPayload>;
  /**
   *
   * Update an existing TestCase.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations].
   */
  updateTestCase?: Maybe<UpdateTestCasePayload>;
  /**
   *
   * Updates an Organizations Theme.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  updateTheme?: Maybe<UpdateThemePayload>;
  /**
   *     Updates the specified User object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users] when a value for 'customer' does not exist on the object.
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users] when a value for 'customer' exists on the object.
   *     4. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers] when a value for 'customer' exists on the object.
   */
  updateUser?: Maybe<UpdateUserPayload>;
  /**
   *
   * Update OAuth2 Connection properties for a given User Level Config Variable.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_instances].
   *     2. The specified object is the signed-in User.
   */
  updateUserLevelOAuth2Connection?: Maybe<UpdateUserLevelOAuth2ConnectionPayload>;
  /**
   *     Updates the specified WebhookEndpoint object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  updateWebhookEndpoint?: Maybe<UpdateWebhookEndpointPayload>;
  /**
   *
   * Updates test configuration for a Workflow.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_edit].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  updateWorkflowTestConfiguration?: Maybe<UpdateWorkflowTestConfigurationPayload>;
  /**
   *
   * Return utilization metrics for the specified org and reporting period.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_view].
   */
  utilizationReport?: Maybe<UtilizationReportPayload>;
  /**
   *
   * Validate an Integration schema.
   *
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  validateIntegrationSchema?: Maybe<ValidateIntegrationSchemaPayload>;
};

export type RootMutationAddBlockedRequestIdsArgs = {
  input: AddBlockedRequestIdsInput;
};

export type RootMutationAddOrgUsersToControlPlaneArgs = {
  input: AddOrgUsersToControlPlaneInput;
};

export type RootMutationAdministerObjectPermissionArgs = {
  input: AdministerObjectPermissionInput;
};

export type RootMutationBulkDisableInstancesUsingConnectionArgs = {
  input: BulkDisableInstancesUsingConnectionInput;
};

export type RootMutationBulkDisableInstancesUsingCustomerConnectionArgs = {
  input: BulkDisableInstancesUsingCustomerConnectionInput;
};

export type RootMutationBulkUpdateInstancesToLatestIntegrationVersionArgs = {
  input: BulkUpdateInstancesToLatestIntegrationVersionInput;
};

export type RootMutationChangePasswordArgs = {
  input: ChangePasswordInput;
};

export type RootMutationClearAlertMonitorArgs = {
  input: ClearAlertMonitorInput;
};

export type RootMutationClearAllFifoDataArgs = {
  input: ClearAllFifoDataInput;
};

export type RootMutationClearFifoWorkingSetArgs = {
  input: ClearFifoWorkingSetInput;
};

export type RootMutationClearRetryScheduleArgs = {
  input: ClearRetryScheduleInput;
};

export type RootMutationConvertLowCodeIntegrationArgs = {
  input: ConvertLowCodeIntegrationInput;
};

export type RootMutationCreateAlertGroupArgs = {
  input: CreateAlertGroupInput;
};

export type RootMutationCreateAlertMonitorArgs = {
  input: CreateAlertMonitorInput;
};

export type RootMutationCreateAlertWebhookArgs = {
  input: CreateAlertWebhookInput;
};

export type RootMutationCreateConnectionTemplateArgs = {
  input: CreateConnectionTemplateInput;
};

export type RootMutationCreateCustomerArgs = {
  input: CreateCustomerInput;
};

export type RootMutationCreateCustomerConfigVariableArgs = {
  input: CreateCustomerConfigVariableInput;
};

export type RootMutationCreateCustomerCredentialArgs = {
  input: CreateCustomerCredentialInput;
};

export type RootMutationCreateCustomerUserArgs = {
  input: CreateCustomerUserInput;
};

export type RootMutationCreateExternalLogStreamArgs = {
  input: CreateExternalLogStreamInput;
};

export type RootMutationCreateInstanceArgs = {
  input: CreateInstanceInput;
};

export type RootMutationCreateInstanceProfileArgs = {
  input: CreateInstanceProfileInput;
};

export type RootMutationCreateIntegrationArgs = {
  input: CreateIntegrationInput;
};

export type RootMutationCreateOnPremiseResourceJwtArgs = {
  input: CreateOnPremiseResourceJwtInput;
};

export type RootMutationCreateOrganizationCredentialArgs = {
  input: CreateOrganizationCredentialInput;
};

export type RootMutationCreateOrganizationNewStackArgs = {
  input: CreateOrganizationNewStackInput;
};

export type RootMutationCreateOrganizationPlanArgs = {
  input: CreateOrganizationPlanInput;
};

export type RootMutationCreateOrganizationSigningKeyArgs = {
  input: CreateOrganizationSigningKeyInput;
};

export type RootMutationCreateOrganizationUserArgs = {
  input: CreateOrganizationUserInput;
};

export type RootMutationCreateScopedConfigVariableArgs = {
  input: CreateScopedConfigVariableInput;
};

export type RootMutationCreateTestCaseArgs = {
  input: CreateTestCaseInput;
};

export type RootMutationCreateUserLevelConfigArgs = {
  input: CreateUserLevelConfigInput;
};

export type RootMutationCreateWebhookEndpointArgs = {
  input: CreateWebhookEndpointInput;
};

export type RootMutationDeleteAlertGroupArgs = {
  input: DeleteAlertGroupInput;
};

export type RootMutationDeleteAlertMonitorArgs = {
  input: DeleteAlertMonitorInput;
};

export type RootMutationDeleteAlertWebhookArgs = {
  input: DeleteAlertWebhookInput;
};

export type RootMutationDeleteComponentArgs = {
  input: DeleteComponentInput;
};

export type RootMutationDeleteConnectionTemplateArgs = {
  input: DeleteConnectionTemplateInput;
};

export type RootMutationDeleteCredentialArgs = {
  input: DeleteCredentialInput;
};

export type RootMutationDeleteCustomerArgs = {
  input: DeleteCustomerInput;
};

export type RootMutationDeleteCustomerConfigVariableArgs = {
  input: DeleteCustomerConfigVariableInput;
};

export type RootMutationDeleteExternalLogStreamArgs = {
  input: DeleteExternalLogStreamInput;
};

export type RootMutationDeleteInstanceArgs = {
  input: DeleteInstanceInput;
};

export type RootMutationDeleteInstanceProfileArgs = {
  input: DeleteInstanceProfileInput;
};

export type RootMutationDeleteIntegrationArgs = {
  input: DeleteIntegrationInput;
};

export type RootMutationDeleteIntegrationTemplateArgs = {
  input: DeleteIntegrationTemplateInput;
};

export type RootMutationDeleteOnPremiseResourceArgs = {
  input: DeleteOnPremiseResourceInput;
};

export type RootMutationDeleteOrganizationArgs = {
  input: DeleteOrganizationInput;
};

export type RootMutationDeleteOrganizationSigningKeyArgs = {
  input: DeleteOrganizationSigningKeyInput;
};

export type RootMutationDeleteScopedConfigVariableArgs = {
  input: DeleteScopedConfigVariableInput;
};

export type RootMutationDeleteTestCaseArgs = {
  input: DeleteTestCaseInput;
};

export type RootMutationDeleteUserArgs = {
  input: DeleteUserInput;
};

export type RootMutationDeleteUserLevelConfigArgs = {
  input: DeleteUserLevelConfigInput;
};

export type RootMutationDeleteWebhookEndpointArgs = {
  input: DeleteWebhookEndpointInput;
};

export type RootMutationDeleteWorkflowArgs = {
  input: DeleteWorkflowInput;
};

export type RootMutationDeleteWorkflowTemplateArgs = {
  input: DeleteWorkflowTemplateInput;
};

export type RootMutationDeployInstanceArgs = {
  input: DeployInstanceInput;
};

export type RootMutationDisableOrganizationArgs = {
  input: DisableOrganizationInput;
};

export type RootMutationDisableOrganizationAccessArgs = {
  input: DisableOrganizationAccessInput;
};

export type RootMutationDisableWorkflowArgs = {
  input: DisableWorkflowInput;
};

export type RootMutationDisconnectConnectionArgs = {
  input: DisconnectConnectionInput;
};

export type RootMutationDisconnectCustomerConnectionArgs = {
  input: DisconnectCustomerConnectionInput;
};

export type RootMutationDisconnectScopedConnectionArgs = {
  input: DisconnectScopedConnectionInput;
};

export type RootMutationDisconnectUserLevelConnectionArgs = {
  input: DisconnectUserLevelConnectionInput;
};

export type RootMutationEnableOrganizationArgs = {
  input: EnableOrganizationInput;
};

export type RootMutationEnableOrganizationAccessArgs = {
  input: EnableOrganizationAccessInput;
};

export type RootMutationEnableWorkflowArgs = {
  input: EnableWorkflowInput;
};

export type RootMutationFetchConfigWizardPageContentArgs = {
  input: FetchConfigWizardPageContentInput;
};

export type RootMutationFetchDataSourceContentArgs = {
  input: FetchDataSourceContentInput;
};

export type RootMutationFindPaidOrganizationsArgs = {
  input: FindPaidOrganizationsInput;
};

export type RootMutationFindUserByEmailArgs = {
  input: FindUserByEmailInput;
};

export type RootMutationForkIntegrationArgs = {
  input: ForkIntegrationInput;
};

export type RootMutationImportIntegrationArgs = {
  input: ImportIntegrationInput;
};

export type RootMutationImportIntegrationTemplateArgs = {
  input: ImportIntegrationTemplateInput;
};

export type RootMutationImportOrganizationSigningKeyArgs = {
  input: ImportOrganizationSigningKeyInput;
};

export type RootMutationImportWorkflowArgs = {
  input: ImportWorkflowInput;
};

export type RootMutationPromoteOrganizationOwnerArgs = {
  input: PromoteOrganizationOwnerInput;
};

export type RootMutationPublishComponentArgs = {
  input: PublishComponentInput;
};

export type RootMutationPublishIntegrationArgs = {
  input: PublishIntegrationInput;
};

export type RootMutationPublishWorkflowArgs = {
  input: PublishWorkflowInput;
};

export type RootMutationRegisterEndToEndTestingOrganizationArgs = {
  input: RegisterEndToEndTestingOrganizationInput;
};

export type RootMutationRegisterInternalOrganizationArgs = {
  input: RegisterInternalOrganizationInput;
};

export type RootMutationRegisterOrganizationArgs = {
  input: RegisterOrganizationInput;
};

export type RootMutationRemoveBlockedRequestIdsArgs = {
  input: RemoveBlockedRequestIdsInput;
};

export type RootMutationRemoveFifoQueueItemsArgs = {
  input: RemoveFifoQueueItemsInput;
};

export type RootMutationRemoveSingletonExecutionLockArgs = {
  input: RemoveSingletonExecutionLockInput;
};

export type RootMutationReplayExecutionArgs = {
  input: ReplayExecutionInput;
};

export type RootMutationRequestOAuth2CredentialAuthorizationArgs = {
  input: RequestOAuth2CredentialAuthorizationInput;
};

export type RootMutationRotateOnPremiseResourceJwtArgs = {
  input: RotateOnPremiseResourceJwtInput;
};

export type RootMutationSaveWorkflowTemplateArgs = {
  input: SaveWorkflowTemplateInput;
};

export type RootMutationSearchOrganizationsArgs = {
  input: SearchOrganizationsInput;
};

export type RootMutationSetOrganizationPlanArgs = {
  input: SetOrganizationPlanInput;
};

export type RootMutationSetOrganizationPlanExpiresAtArgs = {
  input: SetOrganizationPlanExpiresAtInput;
};

export type RootMutationSetOrganizationSalesforceIdArgs = {
  input: SetOrganizationSalesforceIdInput;
};

export type RootMutationSetPlanEnabledFeaturesArgs = {
  input: SetPlanEnabledFeaturesInput;
};

export type RootMutationTestFlowTriggerEventArgs = {
  input: TestFlowTriggerEventInput;
};

export type RootMutationTestInstanceFlowConfigArgs = {
  input: TestInstanceFlowConfigInput;
};

export type RootMutationTestIntegrationEndpointConfigArgs = {
  input: TestIntegrationEndpointConfigInput;
};

export type RootMutationTestIntegrationFlowArgs = {
  input: TestIntegrationFlowInput;
};

export type RootMutationTestWebhookEndpointArgs = {
  input: TestWebhookEndpointInput;
};

export type RootMutationToggleShowG2ReviewBannerArgs = {
  input: ToggleShowG2ReviewBannerInput;
};

export type RootMutationUpdateAlertGroupArgs = {
  input: UpdateAlertGroupInput;
};

export type RootMutationUpdateAlertMonitorArgs = {
  input: UpdateAlertMonitorInput;
};

export type RootMutationUpdateAlertWebhookArgs = {
  input: UpdateAlertWebhookInput;
};

export type RootMutationUpdateComponentArgs = {
  input: UpdateComponentInput;
};

export type RootMutationUpdateConnectionTemplateArgs = {
  input: UpdateConnectionTemplateInput;
};

export type RootMutationUpdateCredentialArgs = {
  input: UpdateCredentialInput;
};

export type RootMutationUpdateCustomerArgs = {
  input: UpdateCustomerInput;
};

export type RootMutationUpdateCustomerConfigVariableArgs = {
  input: UpdateCustomerConfigVariableInput;
};

export type RootMutationUpdateCustomerOAuth2ConnectionArgs = {
  input: UpdateCustomerOAuth2ConnectionInput;
};

export type RootMutationUpdateEmbeddedArgs = {
  input: UpdateEmbeddedInput;
};

export type RootMutationUpdateExternalLogStreamArgs = {
  input: UpdateExternalLogStreamInput;
};

export type RootMutationUpdateInstanceArgs = {
  input: UpdateInstanceInput;
};

export type RootMutationUpdateInstanceConfigVariablesArgs = {
  input: UpdateInstanceConfigVariablesInput;
};

export type RootMutationUpdateInstanceProfileArgs = {
  input: UpdateInstanceProfileInput;
};

export type RootMutationUpdateInstancesUsingCustomerConfigVariableArgs = {
  input: UpdateInstancesUsingCustomerConfigVariableInput;
};

export type RootMutationUpdateIntegrationArgs = {
  input: UpdateIntegrationInput;
};

export type RootMutationUpdateIntegrationMarketplaceConfigurationArgs = {
  input: UpdateIntegrationMarketplaceConfigurationInput;
};

export type RootMutationUpdateIntegrationTestConfigurationArgs = {
  input: UpdateIntegrationTestConfigurationInput;
};

export type RootMutationUpdateIntegrationVersionAvailabilityArgs = {
  input: UpdateIntegrationVersionAvailabilityInput;
};

export type RootMutationUpdateOAuth2ConnectionArgs = {
  input: UpdateOAuth2ConnectionInput;
};

export type RootMutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};

export type RootMutationUpdateScopedConfigVariableArgs = {
  input: UpdateScopedConfigVariableInput;
};

export type RootMutationUpdateScopedOAuth2ConnectionArgs = {
  input: UpdateScopedOAuth2ConnectionInput;
};

export type RootMutationUpdateTestCaseArgs = {
  input: UpdateTestCaseInput;
};

export type RootMutationUpdateThemeArgs = {
  input: UpdateThemeInput;
};

export type RootMutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type RootMutationUpdateUserLevelOAuth2ConnectionArgs = {
  input: UpdateUserLevelOAuth2ConnectionInput;
};

export type RootMutationUpdateWebhookEndpointArgs = {
  input: UpdateWebhookEndpointInput;
};

export type RootMutationUpdateWorkflowTestConfigurationArgs = {
  input: UpdateWorkflowTestConfigurationInput;
};

export type RootMutationUtilizationReportArgs = {
  input: UtilizationReportInput;
};

export type RootMutationValidateIntegrationSchemaArgs = {
  input: ValidateIntegrationSchemaInput;
};

export type RootQuery = {
  __typename?: "RootQuery";
  /**
   *
   *     Returns the specified Action object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  action?: Maybe<Action>;
  /**
   *
   *     Returns a Relay Connection to a collection of Action objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  actions: ActionConnection;
  /**
   *
   *     Returns a Relay Connection to a collection of Activity objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'user' attribute is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_view_activities].
   *     3. The signed-in User has any of the following permissions for the object's 'user_Customer' attribute: [customer_view_activities].
   */
  activities: ActivityConnection;
  /**
   *
   *     Returns the specified Activity object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'user' attribute is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_view_activities].
   *     3. The signed-in User has any of the following permissions for the object's 'user_Customer' attribute: [customer_view_activities].
   */
  activity?: Maybe<Activity>;
  /** Experimental AI features. */
  ai: Ai;
  /**
   *
   *     Returns the specified AlertEvent object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'monitor_Instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_admin_manage_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'monitor_Instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  alertEvent?: Maybe<AlertEvent>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertEvent objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'monitor_Instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_admin_manage_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'monitor_Instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  alertEvents: AlertEventConnection;
  /**
   *
   *     Returns the specified AlertGroup object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  alertGroup?: Maybe<AlertGroup>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertGroup objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  alertGroups: AlertGroupConnection;
  /**
   *
   *     Returns the specified AlertMonitor object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  alertMonitor?: Maybe<AlertMonitor>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertMonitor objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  alertMonitors: AlertMonitorConnection;
  /**
   *
   *     Returns the specified AlertTrigger object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  alertTrigger?: Maybe<AlertTrigger>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertTrigger objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  alertTriggers: AlertTriggerConnection;
  /**
   *
   *     Returns the specified AlertWebhook object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  alertWebhook?: Maybe<AlertWebhook>;
  /**
   *
   *     Returns a Relay Connection to a collection of AlertWebhook objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  alertWebhooks: AlertWebhookConnection;
  /**
   *
   *     Returns the specified AuthObjectType object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  authObjectType?: Maybe<AuthObjectType>;
  /**
   *
   *     Returns a Relay Connection to a collection of AuthObjectType objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  authObjectTypes: AuthObjectTypeConnection;
  /**
   *
   *     Returns the signed-in User.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users, org_view_users].
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users, customer_view_users].
   */
  authenticatedUser: User;
  /**
   *
   *     Returns the specified AuthorizationMethod object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  authorizationMethod?: Maybe<AuthorizationMethod>;
  /**
   *
   *     Returns a Relay Connection to a collection of AuthorizationMethod objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  authorizationMethods: AuthorizationMethodConnection;
  /** Returns a list of requestIds that are blocked. */
  blockedRequestIds: Array<Maybe<Scalars["String"]["output"]>>;
  /** DEPRECATED. Prefer using integrationCategories instead. */
  categories: Array<Maybe<IntegrationCategory>>;
  /**
   *
   *     Returns the specified Component object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object has attributes public with value True..
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_component_permissions, org_manage_components, org_view_components].
   *     3. The signed-in User has any of the following permissions for any version of the object: [component_view, component_edit, component_remove, component_admin_permissions, component_publish_new_version].
   *     4. The signed-in User has any of the following permissions for the associated Customer: [customer_view_org_components].
   */
  component?: Maybe<Component>;
  /** Returns a list of Components and Actions that match the search criteria. */
  componentActionSearchResults: Array<Maybe<ComponentActionSearchResult>>;
  /** Returns a list of Component categories. */
  componentCategories: Array<Maybe<ComponentCategory>>;
  /** Returns a list of unique Component labels. */
  componentLabels: Array<Maybe<Label>>;
  /**
   *
   *     Returns a Relay Connection to a collection of Component objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object has attributes public with value True..
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_component_permissions, org_manage_components, org_view_components].
   *     3. The signed-in User has any of the following permissions for any version of the object: [component_view, component_edit, component_remove, component_admin_permissions, component_publish_new_version].
   *     4. The signed-in User has any of the following permissions for the associated Customer: [customer_view_org_components].
   */
  components: ComponentConnection;
  /**
   *
   *     Returns the specified ConnectionTemplate object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view].
   *     2. The signed-in User has any of the following permissions for the associated Customer: [customer_manage_integrations].
   */
  connectionTemplate?: Maybe<ConnectionTemplate>;
  /**
   *
   *     Returns a Relay Connection to a collection of ConnectionTemplate objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view].
   *     2. The signed-in User has any of the following permissions for the associated Customer: [customer_manage_integrations].
   */
  connectionTemplates: ConnectionTemplateConnection;
  /**
   *
   *     Returns the specified Credential object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_view_customers, org_manage_integrations, org_view_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances].
   */
  credential?: Maybe<Credential>;
  /**
   *
   *     Returns a Relay Connection to a collection of Credential objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_manage_customers, org_view_customers, org_manage_integrations, org_view_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances].
   */
  credentials: CredentialConnection;
  /**
   *
   *     Returns the specified Customer object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_crud_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations, customer_access_marketplace_integrations].
   */
  customer?: Maybe<Customer>;
  /**
   *
   *     Returns the specified CustomerConfigVariable object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  /**
   *
   *     Returns a Relay Connection to a collection of CustomerConfigVariable objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   */
  customerConfigVariables: CustomerConfigVariableConnection;
  /** Returns a list of unique Customer labels. */
  customerLabels: Array<Maybe<Label>>;
  /**
   *
   *     Returns a list of Customer Role objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The Role level is less than that of the signed-in User's Role.
   */
  customerRoles: Array<Maybe<Role>>;
  /**
   *
   *     Returns the specified CustomerTotalUsageMetrics object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances].
   */
  customerTotalUsageMetric?: Maybe<CustomerTotalUsageMetrics>;
  /**
   *
   *     Returns a Relay Connection to a collection of CustomerTotalUsageMetrics objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances].
   */
  customerTotalUsageMetrics: CustomerTotalUsageMetricsConnection;
  /**
   *
   *     Returns a Relay Connection to a collection of Customer objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_crud_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations, customer_access_marketplace_integrations].
   */
  customers: CustomerConnection;
  /** Requirements and configuration for embedded designer. */
  embedded?: Maybe<Embedded>;
  /**
   *
   *     Returns the specified InstanceExecutionResult object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     4. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  executionResult?: Maybe<InstanceExecutionResult>;
  /**
   *
   *     Returns a Relay Connection to a collection of InstanceExecutionResult objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     4. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  executionResults: InstanceExecutionResultConnection;
  /**
   *
   *     Returns the specified ExternalLogStream object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  externalLogStream?: Maybe<ExternalLogStream>;
  /**
   *
   *     Returns a Relay Connection to a collection of ExternalLogStream objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  externalLogStreams: ExternalLogStreamConnection;
  /** Returns FIFO queue statistics for a single queue */
  fifoQueueStats: FifoQueueStats;
  /** Returns a list of the top 10 'hottest' requestIds this hour. Counts include requests that are prematurely terminated due to rate limiting. */
  hotRequestIdsThisHour?: Maybe<Array<Maybe<HotRequestIdsResult>>>;
  /** Returns a list of the top 10 'hottest' requestIds this minute. Counts include requests that are prematurely terminated due to rate limiting. */
  hotRequestIdsThisMinute?: Maybe<Array<Maybe<HotRequestIdsResult>>>;
  /**
   *
   *     Returns the specified Instance object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     6. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  instance?: Maybe<Instance>;
  /**
   *
   *     Returns the specified InstanceDailyUsageMetrics object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  instanceDailyUsageMetric?: Maybe<InstanceDailyUsageMetrics>;
  /**
   *
   *     Returns a Relay Connection to a collection of InstanceDailyUsageMetrics objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   */
  instanceDailyUsageMetrics: InstanceDailyUsageMetricsConnection;
  /**
   *
   *     Returns the specified InstanceFlowConfig object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     6. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  instanceFlowConfig?: Maybe<InstanceFlowConfig>;
  /**
   *
   *     Returns a Relay Connection to a collection of InstanceFlowConfig objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     6. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  instanceFlowConfigs: InstanceFlowConfigConnection;
  /** Returns a list of unique Instance labels. */
  instanceLabels: Array<Maybe<Label>>;
  /**
   *
   *     Returns the specified InstanceProfile object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  instanceProfile?: Maybe<InstanceProfile>;
  /**
   *
   *     Returns a Relay Connection to a collection of InstanceProfile objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   */
  instanceProfiles: InstanceProfileConnection;
  /**
   *
   *     Returns a Relay Connection to a collection of Instance objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     3. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'integration' attribute: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     6. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  instances: InstanceConnection;
  /**
   *
   *     Returns the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  integration?: Maybe<Integration>;
  /** Returns a list of Integration categories. */
  integrationCategories: Array<Maybe<IntegrationCategory>>;
  /** Returns a list of unique Integration labels. */
  integrationLabels: Array<Maybe<Label>>;
  integrationVariants?: Maybe<IntegrationVariantConnection>;
  /**
   *
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
  integrations: IntegrationConnection;
  /** Returns a list of tenants that the current user has access to. */
  listUserTenants: UserTenantsConnection;
  /**
   *
   *     Returns the specified Log object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     6. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   */
  log?: Maybe<Log>;
  /** Returns a list of LogSeverity objects. */
  logSeverityLevels: Array<Maybe<LogSeverity>>;
  /**
   *
   *     Returns a Relay Connection to a collection of Log objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     6. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   */
  logs: LogConnection;
  /**
   *
   *     Returns the specified Integration object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  marketplaceIntegration?: Maybe<Integration>;
  /**
   *
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
  marketplaceIntegrations: IntegrationConnection;
  /** Returns the next N scheduled retries with full payload details */
  nextRetries: Array<Maybe<ScheduledRetry>>;
  /**
   *
   *     Returns the specified ObjectPermissionGrant object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  objectPermissionGrant?: Maybe<ObjectPermissionGrant>;
  /**
   *
   *     Returns a Relay Connection to a collection of ObjectPermissionGrant objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  objectPermissionGrants: ObjectPermissionGrantConnection;
  /**
   *
   *     Returns the specified OnPremiseResource object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_crud_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations, customer_access_marketplace_integrations].
   */
  onPremiseResource?: Maybe<OnPremiseResource>;
  /**
   *
   *     Returns a Relay Connection to a collection of OnPremiseResource objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_crud_customers, org_view_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_view, customer_edit, customer_remove, customer_admin_users, customer_view_users, customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations, customer_access_marketplace_integrations].
   */
  onPremiseResources: OnPremiseResourceConnection;
  /**
   *
   *     Returns the specified OrgDailyUsageMetrics object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view_utilization].
   */
  orgDailyUsageMetric?: Maybe<OrgDailyUsageMetrics>;
  /**
   *
   *     Returns a Relay Connection to a collection of OrgDailyUsageMetrics objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view_utilization].
   */
  orgDailyUsageMetrics: OrgDailyUsageMetricsConnection;
  /**
   *
   *     Returns the specified OrgTotalUsageMetrics object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view_utilization].
   */
  orgTotalUsageMetric?: Maybe<OrgTotalUsageMetrics>;
  /**
   *
   *     Returns a Relay Connection to a collection of OrgTotalUsageMetrics objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_view_utilization].
   */
  orgTotalUsageMetrics: OrgTotalUsageMetricsConnection;
  orgUsers?: Maybe<Array<Maybe<User>>>;
  /**
   *
   *     Returns the Organization of the signed-in User if the User is an Organization User.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the object: [org_view].
   */
  organization?: Maybe<Organization>;
  /**
   *
   *     Returns a list of Organization Role objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The Role level is less than that of the signed-in User's Role.
   */
  organizationRoles: Array<Maybe<Role>>;
  /**
   *
   *     Returns the specified Permission object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  permission?: Maybe<Permission>;
  /**
   *
   *     Returns a Relay Connection to a collection of Permission objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  permissions: PermissionConnection;
  /** Returns retry schedule statistics */
  retryScheduleStats: RetryScheduleStatsResult;
  reusableConnections?: Maybe<ReusableConnectionConnection>;
  /**
   *
   *     Returns the specified ScopedConfigVariable object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   *     3. The signed-in User has any of the following permissions for their Customer: [customer_manage_integrations].
   *     4. The object has attributes variable_scope with value customer and managed_by with value customer and customer with value None..
   *     5. The object has attributes default_for_component with value True..
   */
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
  /**
   *
   *     Returns a Relay Connection to a collection of ScopedConfigVariable objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_manage_customers].
   *     2. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_manage_integrations].
   *     3. The signed-in User has any of the following permissions for their Customer: [customer_manage_integrations].
   *     4. The object has attributes variable_scope with value customer and managed_by with value customer and customer with value None..
   *     5. The object has attributes default_for_component with value True..
   */
  scopedConfigVariables: ScopedConfigVariableConnection;
  /** Returns details about the current stack. */
  stackDetails: StackDetailsResult;
  /**
   *
   *     Returns the specified IntegrationTemplate object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_view_integrations].
   *     2. The Customer User has any of the following permissions for the Customer and the Objects Attribute variant is workflow: [customer_manage_integrations].
   */
  standardIntegrationTemplate?: Maybe<IntegrationTemplate>;
  /**
   *
   *     Returns a Relay Connection to a collection of IntegrationTemplate objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_view_integrations].
   *     2. The Customer User has any of the following permissions for the Customer and the Objects Attribute variant is workflow: [customer_manage_integrations].
   */
  standardIntegrationTemplates: IntegrationTemplateConnection;
  /**
   *
   *     Returns the specified StarredRecord object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'user' attribute is the signed-in User.
   */
  starredRecord?: Maybe<StarredRecord>;
  /**
   *
   *     Returns a Relay Connection to a collection of StarredRecord objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The object's 'user' attribute is the signed-in User.
   */
  starredRecords: StarredRecordConnection;
  /**
   *
   *     Returns the specified InstanceStepResult object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     4. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  stepResult?: Maybe<InstanceStepResult>;
  /**
   *
   *     Returns a Relay Connection to a collection of InstanceStepResult objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_instance_permissions, org_manage_instances, org_view_instances].
   *     2. The signed-in User has any of the following permissions for the object's 'instance_Customer' attribute: [customer_admin_instance_permissions, customer_view_instances, customer_manage_marketplace_integrations].
   *     3. The signed-in User has any of the following permissions for the object's 'instance' attribute: [instance_admin_permissions, instance_view, instance_edit, instance_remove].
   *     4. The signed-in User has any of the following permissions for any version of the related integration where the object is related to a 'system' instance: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     5. The signed-in User has any of the following permissions for the object's 'instance_Integration_Customer' attribute: [customer_admin_manage_instances, customer_admin_integration_permissions, customer_manage_integrations].
   */
  stepResults: InstanceStepResultConnection;
  /**
   *
   *     Returns the specified TestCase object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  testCase?: Maybe<TestCase>;
  /**
   *
   *     Returns a Relay Connection to a collection of TestCase objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for the object's 'integration_Customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  testCases: TestCaseConnection;
  /** Specifies the current value of the 'test_flag' feature flag in LaunchDarkly. */
  testFlagEnabled: Scalars["Boolean"]["output"];
  /**
   *
   *     Returns the Organization Theme of the signed-in User.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. Always allowed.
   */
  theme?: Maybe<Theme>;
  /** Returns a pre-signed URL for uploading the specified media file. */
  uploadMedia: UploadMedia;
  /**
   *
   *     Returns the specified User object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users, org_view_users].
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users, customer_view_users].
   */
  user?: Maybe<User>;
  /** Returns whether a User exists with the specified email address. */
  userExists: Scalars["Boolean"]["output"];
  userFlows?: Maybe<UserFlowConnection>;
  /**
   *
   *     Returns a Relay Connection to a collection of User objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The specified object is the signed-in User.
   *     2. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users, org_view_users].
   *     3. The signed-in User has any of the following permissions for the associated Organization: [org_admin_customer_permissions, org_manage_customers, org_view_customers].
   *     4. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_users, customer_view_users].
   */
  users: UserConnection;
  /**
   *
   *     Returns the specified WebhookEndpoint object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  webhookEndpoint?: Maybe<WebhookEndpoint>;
  /**
   *
   *     Returns a Relay Connection to a collection of WebhookEndpoint objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_users].
   */
  webhookEndpoints: WebhookEndpointConnection;
  /** List of all available webhook event types with id and name pairs. */
  webhookEventTypes: Array<Maybe<WebhookEventTypeInfo>>;
  /**
   *
   *     Returns the specified Workflow object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  workflow?: Maybe<Workflow>;
  /** Returns a list of Workflow categories. */
  workflowCategories: Array<Maybe<IntegrationCategory>>;
  /** Returns a list of unique Workflow labels. */
  workflowLabels: Array<Maybe<Label>>;
  /**
   *
   *     Returns the specified WorkflowTemplate object.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_view_integrations].
   *     2. The Customer User has any of the following permissions for the Customer and the Objects Attribute variant is workflow: [customer_manage_integrations].
   */
  workflowTemplate?: Maybe<WorkflowTemplate>;
  /**
   *
   *     Returns a Relay Connection to a collection of WorkflowTemplate objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_manage_integrations, org_view_integrations].
   *     2. The Customer User has any of the following permissions for the Customer and the Objects Attribute variant is workflow: [customer_manage_integrations].
   */
  workflowTemplates: WorkflowTemplateConnection;
  /**
   *
   *     Returns a Relay Connection to a collection of Workflow objects.
   *
   * Access is permitted when any of the following condition(s) are met:
   *     1. The signed-in User has any of the following permissions for the associated Organization: [org_admin_integration_permissions, org_manage_integrations, org_view_integrations].
   *     2. The signed-in User has any of the following permissions for any version of the object: [integration_admin_permissions, integration_view, integration_edit, integration_remove].
   *     3. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_admin_instance_deploy, customer_manage_marketplace_integrations].
   *     4. The signed-in User has any of the following permissions for the associated Customer of Integrations available in the Marketplace: [customer_access_marketplace_integrations].
   *     5. The signed-in User has any of the following permissions for the object's 'customer' attribute: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   *     6. The Customer User has any of the following permissions for the Customer and the Objects Attribute template_configuration is AVAILABLE: [customer_admin_integration_permissions, customer_manage_integrations, customer_view_integrations].
   */
  workflows: WorkflowConnection;
};

export type RootQueryActionArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryActionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  canCallComponentFunctions?: InputMaybe<Scalars["Boolean"]["input"]>;
  component?: InputMaybe<Scalars["ID"]["input"]>;
  dataSourceType?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  filterQuery?: InputMaybe<Scalars["JSONString"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  hasOnInstanceDelete?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOnInstanceDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasWebhookCreateFunction?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasWebhookDeleteFunction?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeForCodeNativeIntegrations?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCommonTrigger?: InputMaybe<Scalars["Boolean"]["input"]>;
  isDataSource?: InputMaybe<Scalars["Boolean"]["input"]>;
  isDetailDataSource?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPollingTrigger?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTrigger?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ActionOrder>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ActionOrder>>>;
};

export type RootQueryActivitiesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ActivityOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ActivityOrder>>>;
  timestamp?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Gt?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lt?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  user?: InputMaybe<Scalars["ID"]["input"]>;
};

export type RootQueryActivityArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryAlertEventArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryAlertEventsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  details_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  monitor?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_FlowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_Instance?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_Instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_Instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  monitor_Instance_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  monitor_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertEventOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertEventOrder>>>;
};

export type RootQueryAlertGroupArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryAlertGroupsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertGroupOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertGroupOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type RootQueryAlertMonitorArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryAlertMonitorsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  lastTriggeredAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  lastTriggeredAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertMonitorOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertMonitorOrder>>>;
  triggered?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  triggers_IsGlobal?: InputMaybe<Scalars["Boolean"]["input"]>;
  triggers_Name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type RootQueryAlertTriggerArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryAlertTriggersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  isGlobal?: InputMaybe<Scalars["Boolean"]["input"]>;
  isInstanceSpecific?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertTriggerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertTriggerOrder>>>;
};

export type RootQueryAlertWebhookArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryAlertWebhooksArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AlertWebhookOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AlertWebhookOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  url_Icontains?: InputMaybe<Scalars["String"]["input"]>;
};

export type RootQueryAuthObjectTypeArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryAuthObjectTypesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<AuthObjectTypeOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<AuthObjectTypeOrder>>>;
};

export type RootQueryAuthorizationMethodArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryAuthorizationMethodsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type RootQueryComponentArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryComponentActionSearchResultsArgs = {
  actionFilterQuery?: InputMaybe<Scalars["JSONString"]["input"]>;
  componentFilterQuery?: InputMaybe<Scalars["JSONString"]["input"]>;
  searchTerms: Scalars["String"]["input"];
};

export type RootQueryComponentsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  filterQuery?: InputMaybe<Scalars["JSONString"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  hasActions?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasCommonTriggers?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasConnectionTemplates?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasConnections?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasDataSources?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasDataSourcesOfType?: InputMaybe<Scalars["String"]["input"]>;
  hasOauth2Connections?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasSimpleConnections?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasTriggers?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeComponentsForCodeNativeIntegrations?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ComponentOrder>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  searchTerms_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionCreatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionCreatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type RootQueryConnectionTemplateArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryConnectionTemplatesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connectionId?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ConnectionTemplateOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ConnectionTemplateOrder>>>;
};

export type RootQueryCredentialArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryCredentialsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  authorizationMethod_Key?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CredentialOrder>;
  readyForUse?: InputMaybe<Scalars["Boolean"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CredentialOrder>>>;
};

export type RootQueryCustomerArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryCustomerConfigVariableArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryCustomerConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  isTest?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CustomerConfigVariableOrder>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  scopedConfigVariable_Key?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_Key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_ManagedBy?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_VariableScope?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerConfigVariableOrder>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

export type RootQueryCustomerTotalUsageMetricArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryCustomerTotalUsageMetricsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  onlyLatestDailySnapshots?: InputMaybe<Scalars["Boolean"]["input"]>;
  orderBy?: InputMaybe<CustomerTotalUsageMetricsOrder>;
  snapshotTime_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  snapshotTime_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerTotalUsageMetricsOrder>>>;
};

export type RootQueryCustomersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  externalId_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  isSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  name_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CustomerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type RootQueryExecutionResultArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryExecutionResultsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  error_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  flow_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  invokeType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  invokedBy?: InputMaybe<ExecutionInvokedByInput>;
  isLre?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  queuedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  queuedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  queuedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  replayForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resultType?: InputMaybe<Scalars["String"]["input"]>;
  resultType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  resumedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  resumedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resumedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryCount?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  retryForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryNextAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryUniqueRequestId?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  status?: InputMaybe<ExecutionStatus>;
};

export type RootQueryExternalLogStreamArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryExternalLogStreamsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ExternalLogStreamOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ExternalLogStreamOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type RootQueryFifoQueueStatsArgs = {
  flowConfigId: Scalars["ID"]["input"];
};

export type RootQueryInstanceArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryInstanceDailyUsageMetricArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryInstanceDailyUsageMetricsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceDailyUsageMetricsOrder>;
  snapshotDate?: InputMaybe<Scalars["Date"]["input"]>;
  snapshotDate_Gte?: InputMaybe<Scalars["Date"]["input"]>;
  snapshotDate_Lte?: InputMaybe<Scalars["Date"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceDailyUsageMetricsOrder>>>;
};

export type RootQueryInstanceFlowConfigArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryInstanceFlowConfigsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow_Name?: InputMaybe<Scalars["String"]["input"]>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceFlowConfigOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceFlowConfigOrder>>>;
};

export type RootQueryInstanceProfileArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryInstanceProfilesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  isDefaultProfile?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceProfileOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceProfileOrder>>>;
};

export type RootQueryInstancesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  compatibility?: InputMaybe<Scalars["Int"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_ExternalId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  designedBy?: InputMaybe<InstanceDesignedBy>;
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  globalDebug?: InputMaybe<Scalars["Boolean"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  needsDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type RootQueryIntegrationArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryIntegrationCategoriesArgs = {
  fromTemplates?: InputMaybe<Scalars["Boolean"]["input"]>;
  onlyLatest?: InputMaybe<Scalars["Boolean"]["input"]>;
  onlyPublished?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type RootQueryIntegrationVariantsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  draft?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flows_IsAgentFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOutdatedComponents?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasUnpublishedChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCodeNative?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  marketplace?: InputMaybe<Scalars["Boolean"]["input"]>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_In?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationVariantOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_In?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type RootQueryIntegrationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flows_IsAgentFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOutdatedComponents?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasUnpublishedChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCodeNative?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  marketplace?: InputMaybe<Scalars["Boolean"]["input"]>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type RootQueryListUserTenantsArgs = {
  includeAllStacks?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type RootQueryLogArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryLogsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  configVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customerConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult_IsTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integrationVersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  logType?: InputMaybe<Scalars["String"]["input"]>;
  logType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  message_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<LogOrder>;
  requiredConfigVariableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  severity?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type RootQueryMarketplaceIntegrationArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryMarketplaceIntegrationsArgs = {
  activated?: InputMaybe<Scalars["Boolean"]["input"]>;
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  filterQuery?: InputMaybe<Scalars["JSONString"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flows_IsAgentFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOutdatedComponents?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasUnpublishedChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeActiveIntegrations?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCodeNative?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  marketplace?: InputMaybe<Scalars["Boolean"]["input"]>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  strictMatchFilterQuery?: InputMaybe<Scalars["Boolean"]["input"]>;
  templateConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type RootQueryNextRetriesArgs = {
  count: Scalars["Int"]["input"];
};

export type RootQueryObjectPermissionGrantArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryObjectPermissionGrantsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  grantedByRole?: InputMaybe<Scalars["ID"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  obj?: InputMaybe<Scalars["UUID"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ObjectPermissionGrantOrder>;
  permission?: InputMaybe<Scalars["ID"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ObjectPermissionGrantOrder>>>;
  user?: InputMaybe<Scalars["ID"]["input"]>;
};

export type RootQueryOnPremiseResourceArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryOnPremiseResourcesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<OnPremiseResourceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<OnPremiseResourceOrder>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type RootQueryOrgDailyUsageMetricArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryOrgDailyUsageMetricsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<OrgDailyUsageMetricsOrder>;
  snapshotDate?: InputMaybe<Scalars["Date"]["input"]>;
  snapshotDate_Gte?: InputMaybe<Scalars["Date"]["input"]>;
  snapshotDate_Lte?: InputMaybe<Scalars["Date"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<OrgDailyUsageMetricsOrder>>>;
};

export type RootQueryOrgTotalUsageMetricArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryOrgTotalUsageMetricsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  onlyLatestDailySnapshots?: InputMaybe<Scalars["Boolean"]["input"]>;
  orderBy?: InputMaybe<OrgTotalUsageMetricsOrder>;
  snapshotTime_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  snapshotTime_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<OrgTotalUsageMetricsOrder>>>;
};

export type RootQueryOrgUsersArgs = {
  orgId: Scalars["String"]["input"];
};

export type RootQueryPermissionArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryPermissionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  objType?: InputMaybe<Scalars["ID"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<PermissionOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<PermissionOrder>>>;
};

export type RootQueryReusableConnectionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Scalars["ID"]["input"]>;
  includeCustomer?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTest?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  managedBy?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  scopedConfigVariable_Key?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_Key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_ManagedBy?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_VariableScope?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ReusableConnectionOrder>>>;
  stableKey?: InputMaybe<Scalars["String"]["input"]>;
  stableKey_In?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Scalars["String"]["input"]>;
  variableScope?: InputMaybe<Scalars["String"]["input"]>;
};

export type RootQueryScopedConfigVariableArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryScopedConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  includeCustomer?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  managedBy?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ScopedConfigVariableOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ScopedConfigVariableOrder>>>;
  stableKey?: InputMaybe<Scalars["String"]["input"]>;
  stableKey_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  variableScope?: InputMaybe<Scalars["String"]["input"]>;
};

export type RootQueryStandardIntegrationTemplateArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryStandardIntegrationTemplatesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<IntegrationTemplateOrder>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationTemplateOrder>>>;
};

export type RootQueryStarredRecordArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryStarredRecordsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<StarredRecordOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<StarredRecordOrder>>>;
};

export type RootQueryStepResultArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryStepResultsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  branchName?: InputMaybe<Scalars["String"]["input"]>;
  displayStepName?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  fromPreprocessFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasError?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  isLoopStep?: InputMaybe<Scalars["Boolean"]["input"]>;
  isRootResult?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  loopStepIndex?: InputMaybe<Scalars["Int"]["input"]>;
  loopStepName?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceStepResultOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceStepResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  stepName?: InputMaybe<Scalars["String"]["input"]>;
};

export type RootQueryTestCaseArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryTestCasesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type RootQueryUploadMediaArgs = {
  fileName: Scalars["String"]["input"];
  mediaType: MediaType;
  objectId: Scalars["ID"]["input"];
};

export type RootQueryUserArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryUserExistsArgs = {
  email: Scalars["String"]["input"];
};

export type RootQueryUsersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  email_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  externalId_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  includeMarketplaceUsers?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<UserOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<UserOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type RootQueryWebhookEndpointArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryWebhookEndpointsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WebhookEndpointOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<WebhookEndpointOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type RootQueryWorkflowArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryWorkflowCategoriesArgs = {
  fromTemplates?: InputMaybe<Scalars["Boolean"]["input"]>;
  onlyLatest?: InputMaybe<Scalars["Boolean"]["input"]>;
  onlyPublished?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type RootQueryWorkflowLabelsArgs = {
  fromTemplates?: InputMaybe<Scalars["Boolean"]["input"]>;
  onlyLatest?: InputMaybe<Scalars["Boolean"]["input"]>;
  onlyPublished?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type RootQueryWorkflowTemplateArgs = {
  id: Scalars["ID"]["input"];
};

export type RootQueryWorkflowTemplatesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkflowTemplateOrder>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<WorkflowTemplateOrder>>>;
};

export type RootQueryWorkflowsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  draft?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkflowOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<WorkflowOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

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

export type RotateOnPremiseResourceJwtPayload = {
  __typename?: "RotateOnPremiseResourceJWTPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<CreateOnPremiseResourceJwtResult>;
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

export type SaveWorkflowTemplatePayload = {
  __typename?: "SaveWorkflowTemplatePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  workflowTemplate?: Maybe<WorkflowTemplate>;
};

export type ScheduledRetry = {
  __typename?: "ScheduledRetry";
  /** The instance ID */
  instanceId?: Maybe<Scalars["ID"]["output"]>;
  /** The retry attempt number */
  retryAttemptNumber?: Maybe<Scalars["Int"]["output"]>;
  /** The execution ID being retried */
  retryForExecutionId?: Maybe<Scalars["ID"]["output"]>;
  /** When the original execution started */
  retryForExecutionStartedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** When this retry is scheduled to run */
  scheduledAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The tenant ID */
  tenantId?: Maybe<Scalars["ID"]["output"]>;
  /** The S3 bucket key for the trigger payload */
  triggerPayloadBucketKey?: Maybe<Scalars["String"]["output"]>;
};

export type ScopedConfigVariable = Node & {
  __typename?: "ScopedConfigVariable";
  /** Specifies whether the signed-in User can remove the ScopedConfigVariable. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the ScopedConfigVariable. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Authorize URL of this Config Variable if associated with an OAuth 2.0 Connection. */
  authorizeUrl?: Maybe<Scalars["String"]["output"]>;
  /** The Connection to which this variable is associated. */
  connection?: Maybe<Connection>;
  /** The Customer with which this Config Variable is associated. */
  customer?: Maybe<Customer>;
  /** The Scoped Config Variable with which this Config Variable is associated. */
  customerConfigVariables: CustomerConfigVariableConnection;
  /** Returns a list of Customers using this config variable. */
  customers: CustomerConnection;
  /** Specifies whether this Config Variable is required for Customers using the related Component. */
  defaultForComponent: Scalars["Boolean"]["output"];
  /** Additional notes about the Scoped Config Variable. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Indicates this config variable is in use on an Instance. */
  hasDeployedInstances: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The collection of Expressions that serve as inputs to this variable. */
  inputs?: Maybe<ExpressionConnection>;
  /** Returns a list of Instances of Integrations using this config variable. */
  instances: InstanceConnection;
  /** Returns a list of Integrations using this config variable. */
  integrations: IntegrationConnection;
  /** Indicates that this config variable is currently in use by at least one Instance or Integration version. */
  isInUse: Scalars["Boolean"]["output"];
  /** The display name of this variable. */
  key: Scalars["String"]["output"];
  /** The timestamp of the most recent inputs reconfiguration. */
  lastConfiguredAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The timestamp of the last successful OAuth2 token refresh. */
  lastSuccessfulRefreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The ScopedConfigVariable which relates to the Log entry. */
  logs: LogConnection;
  /** Enforces which group of users can modify the variable. */
  managedBy: ScopedConfigVariableManagedBy;
  /** Contains arbitrary metadata about this variable. */
  meta?: Maybe<Scalars["JSONString"]["output"]>;
  /** Configuration for OAuth custom redirects. */
  oAuthRedirectConfig?: Maybe<OAuthRedirectConfig>;
  /** The timestamp at which the OAuth2 token will automatically be refreshed, if necessary. Only applies to OAuth2 methods where refresh is necessary. */
  refreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Scoped Config Variable providing configuration for this Required Config Variable. */
  requiredConfigVariables: RequiredConfigVariableConnection;
  /** The stable key for referencing this variable from Integrations. Cannot change after setting. */
  stableKey: Scalars["String"]["output"];
  /** Status indicating if this Connection is working as expected or encountering issues. */
  status?: Maybe<ScopedConfigVariableStatus>;
  /** Specifies the scope of the variable. */
  variableScope: ScopedConfigVariableVariableScope;
  /** Returns a list of Workflows using this config variable. */
  workflows: WorkflowConnection;
};

export type ScopedConfigVariableAuthorizeUrlArgs = {
  newSession?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type ScopedConfigVariableCustomerConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  isTest?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CustomerConfigVariableOrder>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  scopedConfigVariable_Key?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_Key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_ManagedBy?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_VariableScope?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerConfigVariableOrder>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

export type ScopedConfigVariableCustomersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  externalId?: InputMaybe<Scalars["String"]["input"]>;
  externalId_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  name_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CustomerOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type ScopedConfigVariableInputsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ScopedConfigVariableInstancesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_ExternalId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  designedBy?: InputMaybe<InstanceDesignedBy>;
  enabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  globalDebug?: InputMaybe<Scalars["Boolean"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  inFailedState?: InputMaybe<Scalars["Boolean"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  needsDeploy?: InputMaybe<Scalars["Boolean"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type ScopedConfigVariableIntegrationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  allowMultipleMarketplaceInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flows_IsAgentFlow?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasInstances?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasOutdatedComponents?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasUnpublishedChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
  isCodeNative?: InputMaybe<Scalars["Boolean"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  marketplace?: InputMaybe<Scalars["Boolean"]["input"]>;
  marketplaceConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  marketplaceConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  marketplaceConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<IntegrationOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<IntegrationOrder>>>;
  templateConfiguration_Iexact?: InputMaybe<Scalars["String"]["input"]>;
  templateConfiguration_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  templateConfiguration_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  useAsTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type ScopedConfigVariableLogsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  configVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customerConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult_IsTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integrationVersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  logType?: InputMaybe<Scalars["String"]["input"]>;
  logType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  message_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<LogOrder>;
  requiredConfigVariableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  severity?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type ScopedConfigVariableRequiredConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  dataSource?: InputMaybe<Scalars["ID"]["input"]>;
  dataType?: InputMaybe<Scalars["String"]["input"]>;
  dataType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  hasDivider?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<RequiredConfigVariableOrder>;
  orgOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<RequiredConfigVariableOrder>>>;
};

export type ScopedConfigVariableWorkflowsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  draft?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkflowOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<WorkflowOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/** Represents a Relay Connection to a collection of ScopedConfigVariable objects. */
export type ScopedConfigVariableConnection = {
  __typename?: "ScopedConfigVariableConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ScopedConfigVariableEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ScopedConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related ScopedConfigVariable object and a cursor for pagination. */
export type ScopedConfigVariableEdge = {
  __typename?: "ScopedConfigVariableEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<ScopedConfigVariable>;
};

export enum ScopedConfigVariableManagedBy {
  /** Customer */
  Customer = "CUSTOMER",
  /** Org */
  Org = "ORG",
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

export type SearchOrganizationsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The organization ID to lookup. */
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  /** The name or partial name of the organization to lookup. */
  organizationName?: InputMaybe<Scalars["String"]["input"]>;
  /** The Salesforce ID of the organization to lookup. */
  salesforceId?: InputMaybe<Scalars["String"]["input"]>;
};

export type SearchOrganizationsPayload = {
  __typename?: "SearchOrganizationsPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<OrgSearchResult>;
};

export type SetOrganizationPlanExpiresAtInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Global ID of Organization for which to set the specified Plan. */
  orgId: Scalars["ID"]["input"];
  /** Specifies the time at which the trial period for the Organization's current Plan will expire. */
  planExpiresAt: Scalars["DateTime"]["input"];
};

export type SetOrganizationPlanExpiresAtPayload = {
  __typename?: "SetOrganizationPlanExpiresAtPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type SetOrganizationPlanInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Global ID of Organization for which to set the specified Plan. */
  orgId: Scalars["ID"]["input"];
  /** Name of the Plan Template to use for the Organization's new Plan. */
  planTemplate: Scalars["String"]["input"];
};

export type SetOrganizationPlanPayload = {
  __typename?: "SetOrganizationPlanPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type SetOrganizationSalesforceIdInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Global ID of Organization for which to set the Salesforce ID. */
  orgId: Scalars["ID"]["input"];
  /** The ID that is used to link one or more Organization(s) to an account in Salesforce. */
  salesforceId: Scalars["String"]["input"];
};

export type SetOrganizationSalesforceIdPayload = {
  __typename?: "SetOrganizationSalesforceIdPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

export type SetPlanEnabledFeaturesInput = {
  /** Specifies whether to allow per-Instance configuration of the memory allocated to the Runner Lambda functions for the specified Organization's plan. */
  allowConfiguringInstanceMemory?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to enable or disable custom theme for the specified Organization's plan. */
  allowCustomTheme?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to enable or disable per-Instance configuration of persisting log and step results for the specified Organization's plan. */
  allowDisablingInstanceOutputs?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to enable or disable embedded designer for the specified Organization's plan. */
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to enable or disable embedded workflow builder for the specified Organization's plan. */
  allowEmbeddedWorkflowBuilder?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to enable or disable execution retry for the specified Organization's plan. */
  allowExecutionRetry?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows configuration of External Log Streams. */
  allowExternalLogStreams?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows for Long Running Executions. */
  allowLongRunningExecutions?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether this Plan allows for using the On Prem Agent system. */
  allowOnPremAgent?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to enable or disable the ULC for the specified Organization's plan. */
  allowUserLevelConfig?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Prevents org users from viewing sensitive customer data (step outputs, logs, execution results, and connection inputs). */
  hideSensitiveCustomerData?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies the available choices to use for Instance billing. */
  instanceBillingTypes?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** Global ID of Organization whose Plan needs to be modified. */
  orgId: Scalars["ID"]["input"];
};

export type SetPlanEnabledFeaturesPayload = {
  __typename?: "SetPlanEnabledFeaturesPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

/** Result type for stack details query. */
export type StackDetailsResult = {
  __typename?: "StackDetailsResult";
  /** List of public IPs associated with the stack. */
  publicIps: Array<Maybe<Scalars["String"]["output"]>>;
};

export type StarredRecord = Node & {
  __typename?: "StarredRecord";
  /** Specifies whether the signed-in User can remove the StarredRecord. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the StarredRecord. */
  allowUpdate: Scalars["Boolean"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Date/Time when the record was starred */
  timestamp: Scalars["DateTime"]["output"];
  /** User that starred a record */
  user: User;
};

/** Represents a Relay Connection to a collection of StarredRecord objects. */
export type StarredRecordConnection = {
  __typename?: "StarredRecordConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<StarredRecordEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<StarredRecord>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related StarredRecord object and a cursor for pagination. */
export type StarredRecordEdge = {
  __typename?: "StarredRecordEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<StarredRecord>;
};

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

/** Represents test data for webhook requests used to simulate events from connection triggers. */
export type TestCase = Node & {
  __typename?: "TestCase";
  /** Specifies whether the signed-in User can remove the TestCase. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the TestCase. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Content type of the test payload. */
  contentType?: Maybe<Scalars["String"]["output"]>;
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The IntegrationFlow this TestCase belongs to. */
  flow?: Maybe<IntegrationFlow>;
  /** Test headers as key/value pairs. */
  headers?: Maybe<Scalars["JSONString"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Integration this TestCase belongs to. */
  integration: Integration;
  /** The name of the TestCase. */
  name: Scalars["String"]["output"];
  /** Test step payload data. */
  payload?: Maybe<Scalars["String"]["output"]>;
  /** Test step result data. */
  result?: Maybe<Scalars["JSONString"]["output"]>;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
};

/** Represents a Relay Connection to a collection of TestCase objects. */
export type TestCaseConnection = {
  __typename?: "TestCaseConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<TestCaseEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<TestCase>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related TestCase object and a cursor for pagination. */
export type TestCaseEdge = {
  __typename?: "TestCaseEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<TestCase>;
};

export type TestFlowTriggerEventInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The type of system event to use for testing. */
  eventType: Scalars["String"]["input"];
  /** The ID of the IntegrationFlow to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type TestFlowTriggerEventPayload = {
  __typename?: "TestFlowTriggerEventPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  testFlowTriggerEventResult?: Maybe<TestFlowTriggerEventResult>;
};

/** Result of testing an IntegrationFlow's trigger event function for the specified event type. */
export type TestFlowTriggerEventResult = {
  __typename?: "TestFlowTriggerEventResult";
  /** The IntegrationFlow whose trigger was used for testing. */
  flow?: Maybe<IntegrationFlow>;
  /** Whether or not the IntegrationFlow's trigger event function succeeded. */
  succeeded?: Maybe<Scalars["Boolean"]["output"]>;
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

export type TestInstanceFlowConfigPayload = {
  __typename?: "TestInstanceFlowConfigPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  testInstanceFlowConfigResult?: Maybe<TestInstanceFlowConfigResult>;
};

/** Result of testing an InstanceFlowConfig. */
export type TestInstanceFlowConfigResult = {
  __typename?: "TestInstanceFlowConfigResult";
  /** The HTTP body of the response returned by the InstanceFlowConfig's Trigger. */
  body?: Maybe<Scalars["String"]["output"]>;
  /** The InstanceExecutionResult that specifies the result of testing the InstanceFlowConfig. */
  execution?: Maybe<InstanceExecutionResult>;
  /** The InstanceFlowConfig that was tested. */
  flowConfig?: Maybe<InstanceFlowConfig>;
  /** The HTTP headers of the response returned by the InstanceFlowConfig's Trigger. */
  headers?: Maybe<Scalars["JSONString"]["output"]>;
  /** The HTTP status code of the response returned by the InstanceFlowConfig's Trigger. */
  statusCode?: Maybe<Scalars["Int"]["output"]>;
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

export type TestIntegrationEndpointConfigPayload = {
  __typename?: "TestIntegrationEndpointConfigPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  testIntegrationEndpointConfigResult?: Maybe<TestIntegrationEndpointConfigResult>;
};

/** Result of testing an Integration endpoint config. */
export type TestIntegrationEndpointConfigResult = {
  __typename?: "TestIntegrationEndpointConfigResult";
  /** The HTTP body of the response returned as a result of testing the Integration endpoint configuration. */
  body?: Maybe<Scalars["String"]["output"]>;
  /** The InstanceExecutionResult that specifies the result of testing the endpoint configuration for the specified Integration. */
  execution?: Maybe<InstanceExecutionResult>;
  /** The HTTP headers of the response returned as a result of testing the Integration endpoint configuration. */
  headers?: Maybe<Scalars["JSONString"]["output"]>;
  /** The Integration for which the associated endpoint configuration was tested. */
  integration?: Maybe<Integration>;
  /** The HTTP status code of the response returned as a result of testing the Integration endpoint configuration. */
  statusCode?: Maybe<Scalars["Int"]["output"]>;
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

export type TestIntegrationFlowPayload = {
  __typename?: "TestIntegrationFlowPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  testIntegrationFlowResult?: Maybe<TestIntegrationFlowResult>;
};

/** Result of testing an IntegrationFlow. */
export type TestIntegrationFlowResult = {
  __typename?: "TestIntegrationFlowResult";
  /** The HTTP body of the response returned by the InstanceFlow's Trigger. */
  body?: Maybe<Scalars["String"]["output"]>;
  /** The InstanceExecutionResult that specifies the result of testing the IntegrationFlow. */
  execution?: Maybe<InstanceExecutionResult>;
  /** The IntegrationFlow that was tested. */
  flow?: Maybe<IntegrationFlow>;
  /** The HTTP headers of the response returned by the InstanceFlow's Trigger. */
  headers?: Maybe<Scalars["JSONString"]["output"]>;
  /** The HTTP status code of the response returned by the InstanceFlow's Trigger. */
  statusCode?: Maybe<Scalars["Int"]["output"]>;
};

export type TestWebhookEndpointInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the WebhookEndpoint to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type TestWebhookEndpointPayload = {
  __typename?: "TestWebhookEndpointPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  testWebhookEndpointResult?: Maybe<TestWebhookEndpointResult>;
};

/** Result of testing a webhook endpoint. */
export type TestWebhookEndpointResult = {
  __typename?: "TestWebhookEndpointResult";
  /** A message indicating the result of the test. */
  message: Scalars["String"]["output"];
  /** Whether the test webhook was sent successfully. */
  success: Scalars["Boolean"]["output"];
  /** The webhook endpoint that was tested. */
  webhookEndpoint: WebhookEndpoint;
};

/** Represents the Theme associated with an Organization. */
export type Theme = Node & {
  __typename?: "Theme";
  /** Specifies whether the signed-in User can remove the Theme. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Theme. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Theme the Color is associated with. */
  colors: ThemeColorConnection;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Theme the Property is associated with. */
  properties: ThemePropertyConnection;
};

/** Represents the Theme associated with an Organization. */
export type ThemeColorsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents the Theme associated with an Organization. */
export type ThemePropertiesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents a Color and its various properties used to style the Organization Theme. */
export type ThemeColor = Node & {
  __typename?: "ThemeColor";
  /** Specifies whether the signed-in User can remove the ThemeColor. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the ThemeColor. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Type of Theme Color. */
  type: ThemeColorType;
  /** The Value of the Theme Color. */
  value: Scalars["String"]["output"];
  /** The Theme Variant this Color will be used with. */
  variant: ThemeColorVariant;
};

/** Represents a Relay Connection to a collection of ThemeColor objects. */
export type ThemeColorConnection = {
  __typename?: "ThemeColorConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ThemeColorEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ThemeColor>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related ThemeColor object and a cursor for pagination. */
export type ThemeColorEdge = {
  __typename?: "ThemeColorEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<ThemeColor>;
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

/** Represents a Property of a given type used to style the Organization Theme. */
export type ThemeProperty = Node & {
  __typename?: "ThemeProperty";
  /** Specifies whether the signed-in User can remove the ThemeProperty. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the ThemeProperty. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Type of Theme Property. */
  type: ThemePropertyType;
  /** The Value of the Theme Property. */
  value: Scalars["String"]["output"];
  /** The Theme Variant this Color will be used with. */
  variant?: Maybe<ThemePropertyVariant>;
};

/** Represents a Relay Connection to a collection of ThemeProperty objects. */
export type ThemePropertyConnection = {
  __typename?: "ThemePropertyConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<ThemePropertyEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<ThemeProperty>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related ThemeProperty object and a cursor for pagination. */
export type ThemePropertyEdge = {
  __typename?: "ThemePropertyEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<ThemeProperty>;
};

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

export type ToggleShowG2ReviewBannerInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether to show the G2 Review Banner. */
  showG2ReviewBanner: Scalars["Boolean"]["input"];
  /** The email of the user. */
  userEmail: Scalars["String"]["input"];
};

export type ToggleShowG2ReviewBannerPayload = {
  __typename?: "ToggleShowG2ReviewBannerPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<AdminOperationResult>;
};

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

export type UpdateAlertGroupPayload = {
  __typename?: "UpdateAlertGroupPayload";
  alertGroup?: Maybe<AlertGroup>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
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

export type UpdateAlertMonitorPayload = {
  __typename?: "UpdateAlertMonitorPayload";
  alertMonitor?: Maybe<AlertMonitor>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
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

export type UpdateAlertWebhookPayload = {
  __typename?: "UpdateAlertWebhookPayload";
  alertWebhook?: Maybe<AlertWebhook>;
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
};

export type UpdateBlockedIdsResult = {
  __typename?: "UpdateBlockedIdsResult";
  blockedIds?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
};

export type UpdateComponentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Component to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateComponentPayload = {
  __typename?: "UpdateComponentPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  component?: Maybe<Component>;
  errors: Array<ErrorType>;
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

export type UpdateConnectionTemplatePayload = {
  __typename?: "UpdateConnectionTemplatePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  connectionTemplate?: Maybe<ConnectionTemplate>;
  errors: Array<ErrorType>;
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

export type UpdateCredentialPayload = {
  __typename?: "UpdateCredentialPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  credential?: Maybe<Credential>;
  errors: Array<ErrorType>;
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

export type UpdateCustomerConfigVariablePayload = {
  __typename?: "UpdateCustomerConfigVariablePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  errors: Array<ErrorType>;
};

export type UpdateCustomerInput = {
  /** Adds the specified Attachment to the object. */
  addAttachment?: InputMaybe<AttachmentInput>;
  /** Specifies whether this Customer can use the Embedded Designer. */
  allowEmbeddedDesigner?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The URL for the avatar image. */
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
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

export type UpdateCustomerOAuth2ConnectionPayload = {
  __typename?: "UpdateCustomerOAuth2ConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customerConfigVariable?: Maybe<CustomerConfigVariable>;
  errors: Array<ErrorType>;
};

export type UpdateCustomerPayload = {
  __typename?: "UpdateCustomerPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  customer?: Maybe<Customer>;
  errors: Array<ErrorType>;
};

export type UpdateEmbeddedInput = {
  /** Specifies custom names for branded elements. */
  brandedElements?: InputMaybe<Scalars["String"]["input"]>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** A list of Component identifiers that embedded designers are required to build into Integrations. */
  requiredComponents?: InputMaybe<Array<InputMaybe<RequiredComponentInput>>>;
};

export type UpdateEmbeddedPayload = {
  __typename?: "UpdateEmbeddedPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  embedded?: Maybe<Embedded>;
  errors: Array<ErrorType>;
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

export type UpdateExternalLogStreamPayload = {
  __typename?: "UpdateExternalLogStreamPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  externalLogStream?: Maybe<ExternalLogStream>;
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

export type UpdateInstanceConfigVariablesPayload = {
  __typename?: "UpdateInstanceConfigVariablesPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
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
  /** This field is deprecated. */
  logsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The name of the Instance. */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether to update the value of needsDeploy as part of the mutation or leave its current value unaltered. */
  preserveDeployState?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** This field is deprecated. */
  stepResultsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateInstancePayload = {
  __typename?: "UpdateInstancePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instance?: Maybe<Instance>;
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
  /** The billing type for the Instances that use this Instance Profile. */
  instanceBillingType?: InputMaybe<Scalars["String"]["input"]>;
  /** Specifies whether this Instance Profile is the default used when no Instance Profile is explicitly specified during Instance creation. */
  isDefaultProfile?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Specifies whether to disable the creation of logs during Instance execution. */
  logsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** DEPRECATED: Use quick_start_instances instead. Whether instances using this profile will startup faster when triggered. */
  quickStart?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** The number of QuickStart runners reserved for instances using this profile. */
  quickStartInstances?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies whether to disable the creation of step results during Instance execution. */
  stepResultsDisabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateInstanceProfilePayload = {
  __typename?: "UpdateInstanceProfilePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instanceProfile?: Maybe<InstanceProfile>;
};

export type UpdateInstancesUsingCustomerConfigVariableInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the CustomerConfigVariable to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UpdateInstancesUsingCustomerConfigVariablePayload = {
  __typename?: "UpdateInstancesUsingCustomerConfigVariablePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<UpdateInstancesUsingCustomerConfigVariableResult>;
};

export type UpdateInstancesUsingCustomerConfigVariableResult = {
  __typename?: "UpdateInstancesUsingCustomerConfigVariableResult";
  instances?: Maybe<Array<Maybe<UpdateInstancesUsingCustomerConfigVariableReturnObject>>>;
};

export type UpdateInstancesUsingCustomerConfigVariableReturnObject = {
  __typename?: "UpdateInstancesUsingCustomerConfigVariableReturnObject";
  instanceId?: Maybe<Scalars["String"]["output"]>;
  messages?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  redeployed?: Maybe<Scalars["Boolean"]["output"]>;
  updated?: Maybe<Scalars["Boolean"]["output"]>;
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

export type UpdateIntegrationMarketplaceConfigurationPayload = {
  __typename?: "UpdateIntegrationMarketplaceConfigurationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type UpdateIntegrationPayload = {
  __typename?: "UpdateIntegrationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
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

export type UpdateIntegrationTestConfigurationPayload = {
  __typename?: "UpdateIntegrationTestConfigurationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

export type UpdateIntegrationVersionAvailabilityInput = {
  /** Flag the Integration version as available or not */
  available: Scalars["Boolean"]["input"];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UpdateIntegrationVersionAvailabilityPayload = {
  __typename?: "UpdateIntegrationVersionAvailabilityPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
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

export type UpdateOAuth2ConnectionPayload = {
  __typename?: "UpdateOAuth2ConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  instanceConfigVariable?: Maybe<InstanceConfigVariable>;
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

export type UpdateOrganizationPayload = {
  __typename?: "UpdateOrganizationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  organization?: Maybe<Organization>;
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

export type UpdateScopedConfigVariablePayload = {
  __typename?: "UpdateScopedConfigVariablePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
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

export type UpdateScopedOAuth2ConnectionPayload = {
  __typename?: "UpdateScopedOAuth2ConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  scopedConfigVariable?: Maybe<ScopedConfigVariable>;
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

export type UpdateTestCasePayload = {
  __typename?: "UpdateTestCasePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  testCase?: Maybe<TestCase>;
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

export type UpdateThemePayload = {
  __typename?: "UpdateThemePayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  theme?: Maybe<Theme>;
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

export type UpdateUserLevelOAuth2ConnectionPayload = {
  __typename?: "UpdateUserLevelOAuth2ConnectionPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  userLevelConfigVariable?: Maybe<UserLevelConfigVariable>;
};

export type UpdateUserPayload = {
  __typename?: "UpdateUserPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  user?: Maybe<User>;
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

export type UpdateWebhookEndpointPayload = {
  __typename?: "UpdateWebhookEndpointPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  webhookEndpoint?: Maybe<WebhookEndpoint>;
};

export type UpdateWorkflowTestConfigurationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The ID of the Integration to mutate. */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Toggle listening mode for webhook snapshot executions. */
  listeningMode?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateWorkflowTestConfigurationPayload = {
  __typename?: "UpdateWorkflowTestConfigurationPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  integration?: Maybe<Integration>;
};

/** Represents the collection of information necessary to upload media file. */
export type UploadMedia = {
  __typename?: "UploadMedia";
  /** The content type (MIME type) that must be used when uploading the file. */
  contentType?: Maybe<Scalars["String"]["output"]>;
  /** Contains any error message that occurred as part of generating the pre-signed URL. */
  error?: Maybe<Scalars["String"]["output"]>;
  /** The URL where the file is located after being uploaded. */
  objectUrl?: Maybe<Scalars["String"]["output"]>;
  /** The pre-signed URL to which the file should be uploaded. */
  uploadUrl?: Maybe<Scalars["String"]["output"]>;
};

/**
 * Represents a user account. A User may belong to an Organization directly or
 * belong to a Customer, which itself belongs to an Organization.
 */
export type User = Node & {
  __typename?: "User";
  /** Specifies whether the signed-in User can change the Role of the User. */
  allowChangeRoles: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can remove the User. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the User. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The URL for the main avatar image that is displayed in Prismatic. */
  appAvatarUrl?: Maybe<Scalars["String"]["output"]>;
  /** The app name displayed in Prismatic. */
  appName: Scalars["String"]["output"];
  /** The URL for the avatar image. */
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The Customer the user belongs to, if any. If this is NULL then Organization will be specified. */
  customer?: Maybe<Customer>;
  /** Designates whether the User has dark mode activated or not. */
  darkMode: Scalars["Boolean"]["output"];
  /** Designates whether dark mode should be derived from the operating system. */
  darkModeSyncWithOs: Scalars["Boolean"]["output"];
  /** The date the User was created. */
  dateJoined: Scalars["DateTime"]["output"];
  /** The email address associated with the User. */
  email: Scalars["String"]["output"];
  /** Allows for mapping an external entity to a Prismatic record. */
  externalId?: Maybe<Scalars["String"]["output"]>;
  featureFlags: Scalars["JSONString"]["output"];
  /** Specifies whether sensitive customer data hiding is enabled for this user's organization. When True, sensitive data (step outputs, logs, execution results, and connection inputs) is hidden from view. Customer users always have this set to False as they can always see their own data. */
  hideSensitiveCustomerDataEnabled: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The name displayed for the Marketplace. */
  marketplaceName: Scalars["String"]["output"];
  /** The user's preferred name. */
  name: Scalars["String"]["output"];
  /** The Organization that the User belongs to, if any. If this is NULL then Customer will be specified. */
  org?: Maybe<Organization>;
  /** The preferred contact phone number for the User. */
  phone: Scalars["String"]["output"];
  /** The Role associated with the User which determines its permissions. */
  role: Role;
  /** The unique identifier for the tenant this user belongs to. */
  tenantId: Scalars["String"]["output"];
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
};

/** Represents a Relay Connection to a collection of User objects. */
export type UserConnection = {
  __typename?: "UserConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<User>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related User object and a cursor for pagination. */
export type UserEdge = {
  __typename?: "UserEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<User>;
};

export type UserFlow = Node & {
  __typename?: "UserFlow";
  apiKeys?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  /** JSON Schema defining how to invoke this flow */
  invokeSchema?: Maybe<Scalars["JSONString"]["output"]>;
  name: Scalars["String"]["output"];
  /** JSON Schema defining the result of this flow */
  resultSchema?: Maybe<Scalars["JSONString"]["output"]>;
  webhookUrl: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of UserFlow objects. */
export type UserFlowConnection = {
  __typename?: "UserFlowConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserFlowEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<UserFlow>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related UserFlow object and a cursor for pagination. */
export type UserFlowEdge = {
  __typename?: "UserFlowEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<UserFlow>;
};

/** Provides dynamic user-driven config values to satisfy Required Config Variables of an Instance. */
export type UserLevelConfig = Node & {
  __typename?: "UserLevelConfig";
  /** Specifies whether the signed-in User can remove the UserLevelConfig. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the UserLevelConfig. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Dynamic Config with which the Config Variable is associated. */
  configVariables: UserLevelConfigVariableConnection;
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  flowConfigs: UserLevelFlowConfigConnection;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The Instance with which the User Level Config is associated. */
  instance: Instance;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The User that owns the User Level Config. */
  user: User;
};

/** Provides dynamic user-driven config values to satisfy Required Config Variables of an Instance. */
export type UserLevelConfigConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  config?: InputMaybe<Scalars["ID"]["input"]>;
  config_Instance?: InputMaybe<Scalars["ID"]["input"]>;
  config_User?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/** Provides dynamic user-driven config values to satisfy Required Config Variables of an Instance. */
export type UserLevelConfigFlowConfigsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents a Relay Connection to a collection of UserLevelConfig objects. */
export type UserLevelConfigConnection = {
  __typename?: "UserLevelConfigConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserLevelConfigEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<UserLevelConfig>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related UserLevelConfig object and a cursor for pagination. */
export type UserLevelConfigEdge = {
  __typename?: "UserLevelConfigEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<UserLevelConfig>;
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

/**
 * Associates specific values to the Dynamic Config to satisfy Required Config Variables
 * of the related Instance.
 */
export type UserLevelConfigVariable = Node & {
  __typename?: "UserLevelConfigVariable";
  /** Specifies whether the signed-in User can remove the UserLevelConfigVariable. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the UserLevelConfigVariable. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The Authorize URL of this Config Variable if associated with an OAuth 2.0 Connection. */
  authorizeUrl?: Maybe<Scalars["String"]["output"]>;
  /** The Dynamic Config with which the Config Variable is associated. */
  config: UserLevelConfig;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The collection of Expressions that serve as inputs to the UserLevelConfigVariable. */
  inputs?: Maybe<ExpressionConnection>;
  /** The timestamp of the last successful OAuth2 token refresh. */
  lastSuccessfulRefreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The UserLevelConfigVariable which relates to the Log entry. */
  logs: LogConnection;
  /** Contains arbitrary metadata about this Config Var. */
  meta?: Maybe<Scalars["JSONString"]["output"]>;
  /** The On-Prem Resource that is associated with the Config Variable. */
  onPremiseResource?: Maybe<OnPremiseResource>;
  /** The timestamp at which the OAuth2 token will automatically be refreshed, if necessary. Only applies to OAuth2 methods where refresh is necessary. */
  refreshAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The Required Config Variable that is satisfied with the value of this Dynamic Config Variable. */
  requiredConfigVariable: RequiredConfigVariable;
  /** The schedule type to show in the UI when the Config Var uses the 'schedule' dataType. */
  scheduleType?: Maybe<UserLevelConfigVariableScheduleType>;
  /** Status indicating if this Connection is working as expected or encountering issues. */
  status?: Maybe<UserLevelConfigVariableStatus>;
  /** An optional timezone property for when the Config Var uses the 'schedule' dataType. */
  timeZone?: Maybe<Scalars["String"]["output"]>;
  /** The value for the Required Config Variable that becomes part of the Instance definition. */
  value?: Maybe<Scalars["String"]["output"]>;
};

/**
 * Associates specific values to the Dynamic Config to satisfy Required Config Variables
 * of the related Instance.
 */
export type UserLevelConfigVariableAuthorizeUrlArgs = {
  newSession?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/**
 * Associates specific values to the Dynamic Config to satisfy Required Config Variables
 * of the related Instance.
 */
export type UserLevelConfigVariableInputsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  visibleToCustomerDeployer?: InputMaybe<Scalars["Boolean"]["input"]>;
  visibleToOrgDeployer?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/**
 * Associates specific values to the Dynamic Config to satisfy Required Config Variables
 * of the related Instance.
 */
export type UserLevelConfigVariableLogsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  configVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customerConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult?: InputMaybe<Scalars["ID"]["input"]>;
  executionResult_IsTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integrationVersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  logType?: InputMaybe<Scalars["String"]["input"]>;
  logType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  loopPath?: InputMaybe<Scalars["String"]["input"]>;
  loopPath_Istartswith?: InputMaybe<Scalars["String"]["input"]>;
  message_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<LogOrder>;
  requiredConfigVariableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  severity?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<LogOrder>>>;
  timestamp_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  userLevelConfigVariable_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Represents a Relay Connection to a collection of UserLevelConfigVariable objects. */
export type UserLevelConfigVariableConnection = {
  __typename?: "UserLevelConfigVariableConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserLevelConfigVariableEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<UserLevelConfigVariable>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related UserLevelConfigVariable object and a cursor for pagination. */
export type UserLevelConfigVariableEdge = {
  __typename?: "UserLevelConfigVariableEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<UserLevelConfigVariable>;
};

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

/** Represents the configuration options for a particular User Level Config and Instance Flow Config pair. */
export type UserLevelFlowConfig = Node & {
  __typename?: "UserLevelFlowConfig";
  /** Specifies whether the signed-in User can remove the UserLevelFlowConfig. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the UserLevelFlowConfig. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  instanceFlowConfig: InstanceFlowConfig;
  userLevelConfig: UserLevelConfig;
  /** The URL of the endpoint that triggers execution of the UserLevelFlowConfig. */
  webhookUrl: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of UserLevelFlowConfig objects. */
export type UserLevelFlowConfigConnection = {
  __typename?: "UserLevelFlowConfigConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<UserLevelFlowConfigEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<UserLevelFlowConfig>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related UserLevelFlowConfig object and a cursor for pagination. */
export type UserLevelFlowConfigEdge = {
  __typename?: "UserLevelFlowConfigEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<UserLevelFlowConfig>;
};

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

export type UserTenantAccess = {
  __typename?: "UserTenantAccess";
  /** The AWS region where the tenant is hosted. */
  awsRegion: Scalars["String"]["output"];
  /** The tenant exists on the current stack. */
  isCurrentStack: Scalars["Boolean"]["output"];
  /** The organization name for the tenant. */
  orgName: Scalars["String"]["output"];
  /** The unique identifier for the tenant. */
  tenantId: Scalars["String"]["output"];
  /** The URL for accessing the tenant. */
  url: Scalars["String"]["output"];
};

/** Represents a collection of user tenant access records. */
export type UserTenantsConnection = {
  __typename?: "UserTenantsConnection";
  /** List of tenant access nodes. */
  nodes: Array<UserTenantAccess>;
};

export type UtilizationReportInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** End date of the reporting period. */
  endDate: Scalars["Date"]["input"];
  /** Name of the Organization. */
  orgName: Scalars["String"]["input"];
  /** Start date of the reporting period. */
  startDate: Scalars["Date"]["input"];
};

export type UtilizationReportPayload = {
  __typename?: "UtilizationReportPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<UtilizationReportResult>;
};

export type UtilizationReportResult = {
  __typename?: "UtilizationReportResult";
  billedBy?: Maybe<Scalars["String"]["output"]>;
  endDate?: Maybe<Scalars["Date"]["output"]>;
  orgName?: Maybe<Scalars["String"]["output"]>;
  quantity?: Maybe<Scalars["Decimal"]["output"]>;
  startDate?: Maybe<Scalars["Date"]["output"]>;
};

export type ValidateIntegrationSchemaFormResult = {
  __typename?: "ValidateIntegrationSchemaFormResult";
  isValid?: Maybe<Scalars["Boolean"]["output"]>;
};

export type ValidateIntegrationSchemaInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The YAML serialized definition of the Integration to validate. */
  definition: Scalars["String"]["input"];
};

export type ValidateIntegrationSchemaPayload = {
  __typename?: "ValidateIntegrationSchemaPayload";
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  errors: Array<ErrorType>;
  result?: Maybe<ValidateIntegrationSchemaFormResult>;
};

/** Represents a specific version of an object that implements the Prismatic versioning protocol. */
export type Version = Node & {
  __typename?: "Version";
  /** Additional commentary/description of this Version. */
  comment?: Maybe<Scalars["String"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Specifies whether the Version is available for use. */
  isAvailable?: Maybe<Scalars["Boolean"]["output"]>;
  /** The timestamp when the Version was published. */
  publishedAt: Scalars["DateTime"]["output"];
  /** User that published this Version. */
  publishedBy?: Maybe<User>;
  /** The sequential number that corresponds to the Version. */
  versionNumber?: Maybe<Scalars["Int"]["output"]>;
};

/** Represents a Relay Connection to a collection of Version objects. */
export type VersionConnection = {
  __typename?: "VersionConnection";
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<VersionEdge>>;
  /** List of nodes in this connection */
  nodes: Array<Maybe<Version>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of versions */
  totalCount: Scalars["Int"]["output"];
};

/** Connection type for version distribution data. */
export type VersionDistributionConnection = {
  __typename?: "VersionDistributionConnection";
  /** List of version instance counts. */
  nodes: Array<VersionInstanceCount>;
};

/** A Relay edge containing a `Version` and its cursor. */
export type VersionEdge = {
  __typename?: "VersionEdge";
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<Version>;
};

/** Represents the instance count for a specific integration version. */
export type VersionInstanceCount = {
  __typename?: "VersionInstanceCount";
  /** The number of Instances deployed at this version. */
  instanceCount: Scalars["Int"]["output"];
  /** The version number of the Integration. */
  versionNumber: Scalars["Int"]["output"];
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

/** Represents a webhook endpoint that receives events from the Prismatic platform. */
export type WebhookEndpoint = Node & {
  __typename?: "WebhookEndpoint";
  /** Specifies whether the signed-in User can remove the WebhookEndpoint. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the WebhookEndpoint. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** Additional notes about this webhook endpoint configuration. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Whether this webhook endpoint is currently enabled. Disabled endpoints will not receive events. */
  enabled: Scalars["Boolean"]["output"];
  /** List of event types this webhook endpoint subscribes to. Must include at least one event type. */
  eventTypes: Array<Scalars["String"]["output"]>;
  /** A JSON object of key/value pairs that will be sent as headers with each webhook request. */
  headers?: Maybe<Scalars["JSONString"]["output"]>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Friendly name for the webhook endpoint. */
  name: Scalars["String"]["output"];
  /** Secret key used for HMAC signature generation. If provided, all webhook payloads will include an X-Webhook-Signature header. */
  secret?: Maybe<Scalars["String"]["output"]>;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The URL where webhook events will be sent. */
  url: Scalars["String"]["output"];
};

/** Represents a Relay Connection to a collection of WebhookEndpoint objects. */
export type WebhookEndpointConnection = {
  __typename?: "WebhookEndpointConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<WebhookEndpointEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<WebhookEndpoint>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related WebhookEndpoint object and a cursor for pagination. */
export type WebhookEndpointEdge = {
  __typename?: "WebhookEndpointEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<WebhookEndpoint>;
};

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

/** Information about a webhook event type. */
export type WebhookEventTypeInfo = {
  __typename?: "WebhookEventTypeInfo";
  /** The event type identifier (e.g., 'log_stream.updated', 'user.deleted'). */
  id: Scalars["String"]["output"];
  /** The human-readable event name (e.g., 'Log Stream Updated', 'User Deleted'). */
  name: Scalars["String"]["output"];
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type Workflow = Node & {
  __typename?: "Workflow";
  /** The individual actions within this Workflow. */
  actions: WorkflowActionConnection;
  /** Specifies whether the signed-in User can remove the Workflow. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the Workflow. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Specifies the category of the Integration. */
  category?: Maybe<Scalars["String"]["output"]>;
  /** Components associated with this Workflow. */
  components: ComponentConnection;
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The Customer that this Workflow belongs to. */
  customer?: Maybe<Customer>;
  /** Returns a list of Customer Config Variables associated with this Workflow. */
  customerConfigVariables: CustomerConfigVariableConnection;
  /** The YAML that is the declarative definition for the Integration that backs this Workflow. */
  definition?: Maybe<Scalars["String"]["output"]>;
  /** The deployed version of this Workflow. */
  deployedVersion?: Maybe<Workflow>;
  /** Additional notes about the Workflow. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Rich text documentation to accompany the Workflow. */
  documentation?: Maybe<Scalars["String"]["output"]>;
  /** List of reasons preventing this Workflow from being enabled. */
  enablementBlockers: Array<Maybe<EnablementBlocker>>;
  /** The singular Flow that represents the Workflow. */
  flow: WorkflowFlow;
  /** Specifies whether the Workflow definition has changes that have not yet been published. */
  hasUnpublishedChanges: Scalars["Boolean"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The singular Instance that runs this Workflow. */
  instance?: Maybe<Instance>;
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars["String"]["output"]>>;
  /** The timestamp at which this Workflow was most recently executed. */
  lastExecutedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** A JSON string that represents metadata about the Workflow. */
  metadata?: Maybe<Scalars["JSONString"]["output"]>;
  /** The name of the Workflow. */
  name: Scalars["String"]["output"];
  /** Returns a list of Scoped Config Variables associated with this Workflow. */
  scopedConfigVariables: ScopedConfigVariableConnection;
  /** Indicates whether the record is starred by the signed-in User. */
  starred?: Maybe<Scalars["Boolean"]["output"]>;
  /** System Instance backing this Workflow. */
  systemInstance: Instance;
  /** The WorkflowTemplate associated with this Workflow, if any. */
  template?: Maybe<WorkflowTemplate>;
  /** Test cases associated with this Workflow, if any. */
  testCases: TestCaseConnection;
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** Validation Rules applied to this Workflow. */
  validationRules: IntegrationValidationRules;
  /** Object data at specified version */
  versionAt?: Maybe<Workflow>;
  /** Additional attributes that are specific to this version. */
  versionAttributes?: Maybe<Scalars["JSONString"]["output"]>;
  /** Additional comments about this version. */
  versionComment?: Maybe<Scalars["String"]["output"]>;
  /** Timestamp of the creation of this version. */
  versionCreatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User that created this version. */
  versionCreatedBy?: Maybe<User>;
  /** Indicates if the version is available for use. */
  versionIsAvailable: Scalars["Boolean"]["output"];
  /** Marked if this record is the latest version of this sequence. */
  versionIsLatest: Scalars["Boolean"]["output"];
  /** Sequential number identifying this version. */
  versionNumber: Scalars["Int"]["output"];
  /** Sequence of versions of this Workflow. */
  versionSequence?: Maybe<WorkflowConnection>;
  /** Identifier for this version sequence. */
  versionSequenceId?: Maybe<Scalars["UUID"]["output"]>;
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type WorkflowActionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type WorkflowComponentsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ComponentOrder>;
  outdated?: InputMaybe<Scalars["Boolean"]["input"]>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  searchTerms_Fulltext?: InputMaybe<Scalars["String"]["input"]>;
  searchTerms_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<ComponentOrder>>>;
  versionCreatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionCreatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type WorkflowCustomerConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  isTest?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  key_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<CustomerConfigVariableOrder>;
  scopedConfigVariable?: InputMaybe<Scalars["ID"]["input"]>;
  scopedConfigVariable_Key?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_Key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_ManagedBy?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_StableKey_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  scopedConfigVariable_VariableScope?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<CustomerConfigVariableOrder>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type WorkflowDefinitionArgs = {
  definitionType?: InputMaybe<DefinitionType>;
  useLatestComponentVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  variant?: InputMaybe<Scalars["String"]["input"]>;
  version?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type WorkflowScopedConfigVariablesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  connection_Component_In?: InputMaybe<Array<InputMaybe<ComponentSelector>>>;
  connection_Component_Label_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  id_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  includeCustomer?: InputMaybe<Scalars["Boolean"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  key_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  managedBy?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ScopedConfigVariableOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<ScopedConfigVariableOrder>>>;
  stableKey?: InputMaybe<Scalars["String"]["input"]>;
  stableKey_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  status_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  variableScope?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type WorkflowTestCasesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type WorkflowVersionAtArgs = {
  id?: InputMaybe<Scalars["ID"]["input"]>;
  latestAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Represents the collection of information that defines a Workflow, to
 * include the sequence of Component Actions, or steps, inputs,
 * the trigger, and other associated data.
 */
export type WorkflowVersionSequenceArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  allVersions?: InputMaybe<Scalars["Boolean"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  category_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  createdAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  customer?: InputMaybe<Scalars["ID"]["input"]>;
  customer_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  description_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  draft?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  labels_Contains?: InputMaybe<Scalars["String"]["input"]>;
  labels_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkflowOrder>;
  sortBy?: InputMaybe<Array<InputMaybe<WorkflowOrder>>>;
  updatedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  updatedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  versionIsAvailable?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionNumber?: InputMaybe<Scalars["Int"]["input"]>;
  versionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/** Represents an association of a Component Action to a Workflow. */
export type WorkflowAction = Node & {
  __typename?: "WorkflowAction";
  /** The specific Component Action that is being associated to the IntegrationFlow. */
  action: Action;
  /** Specifies whether the signed-in User can remove the WorkflowAction. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the WorkflowAction. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** A brief description of the IntegrationAction. */
  description: Scalars["String"]["output"];
  /** The type of error handling to use when failures occur for this IntegrationAction. */
  errorHandlerType?: Maybe<IntegrationActionErrorHandlerType>;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The collection of Expressions that serve as inputs to the IntegrationAction. */
  inputs: ExpressionConnection;
  /** The displayed name of the IntegrationAction. */
  name: Scalars["String"]["output"];
  /** Specifies the delay in seconds between retry attempts for failures of this IntegrationAction. */
  retryDelaySeconds?: Maybe<Scalars["Int"]["output"]>;
  /** Specifies whether to fail the Execution when the final retry attempt fails for this IntegrationAction, or whether to ignore and continue. */
  retryIgnoreFinalError?: Maybe<Scalars["Boolean"]["output"]>;
  /** Specifies the maximum number of retry attempts that will be performed for failures of this IntegrationAction. */
  retryMaxAttempts?: Maybe<Scalars["Int"]["output"]>;
  /** Specifies whether to use exponential backoff in scheduling retries for failures of this IntegrationAction. */
  retryUsesExponentialBackoff?: Maybe<Scalars["Boolean"]["output"]>;
  /** A user-provided value that represents identity across multiple integration versions and across step renames. */
  stableKey?: Maybe<Scalars["String"]["output"]>;
  /** The Workflow in which this action resides. */
  workflow: Workflow;
};

/** Represents an association of a Component Action to a Workflow. */
export type WorkflowActionInputsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents a Relay Connection to a collection of WorkflowAction objects. */
export type WorkflowActionConnection = {
  __typename?: "WorkflowActionConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<WorkflowActionEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<WorkflowAction>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related WorkflowAction object and a cursor for pagination. */
export type WorkflowActionEdge = {
  __typename?: "WorkflowActionEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<WorkflowAction>;
};

/** Represents a Relay Connection to a collection of Workflow objects. */
export type WorkflowConnection = {
  __typename?: "WorkflowConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<WorkflowEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<Workflow>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related Workflow object and a cursor for pagination. */
export type WorkflowEdge = {
  __typename?: "WorkflowEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<Workflow>;
};

/**
 * Relates a Workflow to a hierarchical structure of Component Actions
 * that define the behavior of the Workflow.
 */
export type WorkflowFlow = Node & {
  __typename?: "WorkflowFlow";
  /** Specifies whether the signed-in User can remove the WorkflowFlow. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the WorkflowFlow. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Additional notes about the IntegrationFlow. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Specifies the security configuration to use for the endpoint of this IntegrationFlow. */
  endpointSecurityType: IntegrationFlowEndpointSecurityType;
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** Specifies whether responses to Executions of this IntegrationFlow are synchronous. Responses are asynchronous by default. */
  isSynchronous: Scalars["Boolean"]["output"];
  /** The timestamp at which this IntegrationFlow was most recently executed as part of an Instance. */
  lastExecutedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** The displayed name of the IntegrationFlow. */
  name: Scalars["String"]["output"];
  /** Specifies the delay in minutes between retry attempts of Executions of this IntegrationFlow. */
  retryDelayMinutes: Scalars["Int"]["output"];
  /** Specifies the maximum number of retry attempts that will be performed for Executions of this IntegrationFlow. */
  retryMaxAttempts: Scalars["Int"]["output"];
  /** Specifies a reference to the data to use as a Unique Request ID for retry request cancellation. */
  retryUniqueRequestIdField?: Maybe<Expression>;
  /** Specifies whether to use exponential backoff in scheduling retries of Executions of this IntegrationFlow. */
  retryUsesExponentialBackoff: Scalars["Boolean"]["output"];
  /** Defines schemas to apply to executions of this flow */
  schemas?: Maybe<Scalars["JSONString"]["output"]>;
  /** The order in which the IntegrationFlow will appear in the UI. */
  sortOrder: Scalars["Int"]["output"];
  /** Represents identity across different integration versions. Not intended to be used directly by end users, as the implementation may change at any time. */
  stableId?: Maybe<Scalars["UUID"]["output"]>;
  /** A user-provided value that represents identity across multiple integration versions and across flow renames. */
  stableKey?: Maybe<Scalars["String"]["output"]>;
  /** Content type of the payload for testing this Flow. */
  testContentType?: Maybe<Scalars["String"]["output"]>;
  /** The Execution Results that were generated during testing. */
  testExecutionResults: InstanceExecutionResultConnection;
  /** Headers of the request for testing this Flow. */
  testHeaders?: Maybe<Scalars["JSONString"]["output"]>;
  /** Data payload for testing this Flow. */
  testPayload?: Maybe<Scalars["String"]["output"]>;
  /** The URL of the endpoint that triggers execution of the Flow in the Test Runner. */
  testUrl: Scalars["String"]["output"];
  /** The Action that is the trigger for the Flow. */
  trigger: IntegrationAction;
};

/**
 * Relates a Workflow to a hierarchical structure of Component Actions
 * that define the behavior of the Workflow.
 */
export type WorkflowFlowTestExecutionResultsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  endedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  endedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  endedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  error_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  flow?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig?: InputMaybe<Scalars["ID"]["input"]>;
  flowConfig_Flow?: InputMaybe<Scalars["ID"]["input"]>;
  flow_In?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  instance?: InputMaybe<Scalars["ID"]["input"]>;
  instanceType?: InputMaybe<InstanceType>;
  instance_Customer?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration?: InputMaybe<Scalars["ID"]["input"]>;
  instance_Integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  instance_IsSystem?: InputMaybe<Scalars["Boolean"]["input"]>;
  instance_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  integration?: InputMaybe<Scalars["ID"]["input"]>;
  integration_VersionSequenceId?: InputMaybe<Scalars["UUID"]["input"]>;
  invokeType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  isLre?: InputMaybe<Scalars["Boolean"]["input"]>;
  isTestExecution?: InputMaybe<Scalars["Boolean"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  maxRetryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<InstanceExecutionResultOrder>;
  queuedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  queuedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  queuedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  replayForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resultType?: InputMaybe<Scalars["String"]["input"]>;
  resultType_In?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  resumedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  resumedAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  resumedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryCount?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Gte?: InputMaybe<Scalars["Int"]["input"]>;
  retryCount_Lte?: InputMaybe<Scalars["Int"]["input"]>;
  retryForExecution_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryNextAt_Isnull?: InputMaybe<Scalars["Boolean"]["input"]>;
  retryNextAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  retryUniqueRequestId?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Array<InputMaybe<InstanceExecutionResultOrder>>>;
  startedAt_Gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  startedAt_Lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

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

/** Represents a reusable definition of a Workflow. */
export type WorkflowTemplate = Node & {
  __typename?: "WorkflowTemplate";
  /** Specifies whether the signed-in User can remove the WorkflowTemplate. */
  allowRemove: Scalars["Boolean"]["output"];
  /** Specifies whether the signed-in User can update the WorkflowTemplate. */
  allowUpdate: Scalars["Boolean"]["output"];
  /** Specifies the category of the Integration Template. */
  category: Scalars["String"]["output"];
  /** The timestamp at which the object was created. */
  createdAt: Scalars["DateTime"]["output"];
  /** The YAML representation of the Integration Template. */
  definition: Scalars["String"]["output"];
  /** Additional notes about the Integration Template. */
  description: Scalars["String"]["output"];
  /** The ID of the object */
  id: Scalars["ID"]["output"];
  /** The labels that are associated with the object. */
  labels?: Maybe<Array<Scalars["String"]["output"]>>;
  /** The name of the Integration Template. Must be unique. */
  name: Scalars["String"]["output"];
  /** The timestamp at which the object was most recently updated.  */
  updatedAt: Scalars["DateTime"]["output"];
  /** The Workflow in which this action resides. */
  workflow?: Maybe<Workflow>;
};

/** Represents a Relay Connection to a collection of WorkflowTemplate objects. */
export type WorkflowTemplateConnection = {
  __typename?: "WorkflowTemplateConnection";
  /** List of edges containing the nodes in this connection. */
  edges: Array<Maybe<WorkflowTemplateEdge>>;
  /** List of nodes in this connection. */
  nodes: Array<Maybe<WorkflowTemplate>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Total count of nodes available. */
  totalCount: Scalars["Int"]["output"];
};

/** A Relay edge to a related WorkflowTemplate object and a cursor for pagination. */
export type WorkflowTemplateEdge = {
  __typename?: "WorkflowTemplateEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The related object at the end of the edge. */
  node?: Maybe<WorkflowTemplate>;
};

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
