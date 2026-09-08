/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "../schema.generated.js";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
/** Represents a collection of data that defines a Component Action. */
export type ActionDefinitionInput = {
  /** Specifies whether the Action will allow Conditional Branching. */
  allowsBranching?: boolean | null | undefined;
  /** Specifies how the Action handles Authorization. */
  authorization?: AuthorizationDefinition | null | undefined;
  /** Specifies whether an Action will break out of a loop. */
  breakLoop?: boolean | null | undefined;
  /** Specifies whether the Action can call other Component Actions, Data Sources, or Triggers. */
  canCallComponentFunctions?: boolean | null | undefined;
  /** Specifies how the Component Action is displayed. */
  display: ActionDisplayDefinition;
  /** The input associated with dynamic branching. */
  dynamicBranchInput?: string | null | undefined;
  /** An example of the returned payload of an Action. */
  examplePayload?: unknown;
  /** Whether the Action's examplePerform is safe to invoke inline. */
  examplePerformSafety?: ActionPerformSafety | null | undefined;
  /** The InputFields supported by the Component Action. */
  inputs: Array<InputFieldDefinition | null | undefined>;
  /** A string which uniquely identifies the Action in the context of the Component. */
  key: string;
  /** Describes the shape of the Action's output. For branching Actions, declares a distinct schema per branch. */
  outputSchema?: ActionOutputSchemaInput | null | undefined;
  /** Whether the Action's perform is safe to invoke inline. */
  performSafety?: ActionPerformSafety | null | undefined;
  /** The static branch names associated with an Action. */
  staticBranchNames?: Array<string | null | undefined> | null | undefined;
  /** Specifies whether the Action will terminate Instance execution. */
  terminateExecution?: boolean | null | undefined;
};

/** Represents a collection of data that defines how a Component Action is displayed. */
export type ActionDisplayDefinition = {
  /** The category of the Component. */
  category?: string | null | undefined;
  /** Additional notes about the Component. */
  description: string;
  /** Notes which may provide insight on the intended use of the Action. */
  directions?: string | null | undefined;
  /** Specifies whether the Action is important and/or commonly used. */
  important?: boolean | null | undefined;
  /** The name of the Component. */
  label: string;
};

/**
 * Tagged-union input describing the shape of an Action's output.
 *
 * GraphQL has no native input unions, so the discriminant `type` selects
 * which payload field applies:
 *   * 'actionOutput'    -> `schema` (a single JSON Schema)
 *   * 'branchingOutput' -> `branchSchemas` (a JSON Schema per branch, as a
 *     list of name/schema pairs — GraphQL has no native map type)
 * The server validates that exactly the field matching `type` is provided.
 */
export type ActionOutputSchemaInput = {
  /** Per-branch JSON Schemas, one entry per branch. Required for 'branchingOutput'. */
  branchSchemas?: Array<BranchOutputSchemaInput | null | undefined> | null | undefined;
  /** A JSON Schema describing the Action's output. Required for 'actionOutput'. */
  schema?: unknown;
  /** The output-schema variant: 'actionOutput' or 'branchingOutput'. */
  type: string;
};

export type ActionPerformSafety = "NOT_ALLOWED" | "SAFE";

/** Represents authorization details for a Component. */
export type AuthorizationDefinition = {
  /** The list of authorization methods supported by the Component. */
  methods: Array<string | null | undefined>;
  /** Specifies whether authorization is required for the Component. */
  required: boolean;
};

/** A single branch's output schema, identified by branch name. */
export type BranchOutputSchemaInput = {
  /** The branch name; must match one of the Action's staticBranchNames. */
  name: string;
  /** A JSON Schema describing this branch's output. */
  schema: unknown;
};

/** Represents a collection of data that defines a Component. */
export type ComponentDefinitionInput = {
  /** Specifies how the Component handles Authorization. */
  authorization?: AuthorizationDefinition | null | undefined;
  /** Specifies how the Component is displayed. */
  display: ComponentDisplayDefinition;
  /** The URL that specifies where the Component documentation exists. */
  documentationUrl?: string | null | undefined;
  /** Specifies whether the Component is for a Code Native Integration. */
  forCodeNativeIntegration?: boolean | null | undefined;
  /** A string that uniquely identifies the Component. */
  key: string;
  /** Specifies whether the Component is publicly available or whether it's private to the Organization. */
  public?: boolean | null | undefined;
  /** This field has been deprecated. */
  version?: string | null | undefined;
};

/** Represents a collection of data that defines how a Component is displayed. */
export type ComponentDisplayDefinition = {
  /** The category of the Component. */
  category?: string | null | undefined;
  /** Additional notes about the Component. */
  description: string;
  /** The URL that specifies where the Component icon exists. */
  iconPath?: string | null | undefined;
  /** The name of the Component. */
  label: string;
};

/** Represents a collection of data that defines a Component Connection. */
export type ConnectionDefinitionInput = {
  /** Optional path to the avatar icon for this Connection. */
  avatarIconPath?: string | null | undefined;
  /** Additional notes about the Connection. */
  comments?: string | null | undefined;
  /** Optional path to the connect icon for this Connection. */
  iconPath?: string | null | undefined;
  /** Inputs for this Connection. */
  inputs?: Array<ConnectionInputFieldDefinition | null | undefined> | null | undefined;
  /** A string which uniquely identifies the Connection in the context of the Component. */
  key: string;
  /** The name of the Connection. */
  label: string;
  /** Metadata to support bespoke OAuth2 flow behaviors for this Connection. */
  oauth2Config?: ConnectionOAuth2Configuration | null | undefined;
  /** Type of OAuth2 PKCE method, if any. */
  oauth2PkceMethod?: string | null | undefined;
  /** Type of OAuth2 connection, if any. */
  oauth2Type?: string | null | undefined;
};

/** Represents an input field for a Connection. */
export type ConnectionInputFieldDefinition = {
  /** Specifies the type of collection to use for storing input values, if applicable. */
  collection?: string | null | undefined;
  /** Additional notes about the InputField. */
  comments?: string | null | undefined;
  /** If present, the related Data Source capable of supplying a value to this InputField. */
  dataSource?: string | null | undefined;
  /** The default value for the InputField. */
  default?: unknown;
  /** An example valid input for this InputField. */
  example?: string | null | undefined;
  /** Nested InputFields. Permitted when `type` is 'structuredObject' or 'dynamicObject'. A top-level 'structuredObject' may only contain leaf children. A 'dynamicObject's children must each be a 'structuredObject' configuration; each configuration may itself contain a nested 'structuredObject' one level deep. */
  inputs?: Array<InputFieldDefinition | null | undefined> | null | undefined;
  /** A string which uniquely identifies the InputField in the context of the Action. */
  key: string;
  /** Label used for the Keys of a 'keyvaluelist' collection. */
  keyLabel?: string | null | undefined;
  /** The name of the InputField. */
  label: string;
  /** Language to use for the Code Field. */
  language?: string | null | undefined;
  /** Dictates how possible choices are provided for this InputField. */
  model?: Array<InputFieldChoice | null | undefined> | null | undefined;
  /** Whether or not the field is controlled by the attached On-Prem Resource. */
  onPremiseControlled?: boolean | null | undefined;
  /** Placeholder text that will appear in the InputField UI. */
  placeholder?: string | null | undefined;
  /** Specifies whether the InputField is required by the Action. */
  required?: boolean | null | undefined;
  /** Specifies the scope in which this input is accessible. */
  scope?: InputFieldScope | null | undefined;
  /** Whether or not the field is shown to Integrators and Deployers. Field must have a default is this is `false`. */
  shown?: boolean | null | undefined;
  /** Specifies the type of data the InputField handles. */
  type: string;
};

/** Represents metadata to support bespoke OAuth2 flow behaviors for a Component Connection. */
export type ConnectionOAuth2Configuration = {
  /** A list of allowed parameter keys to pass between the authorize response and the token request. */
  allowedTokenParams?: Array<string | null | undefined> | null | undefined;
  /** An optional override for the grant_type of an OAuth2 flow. */
  overrideGrantType?: string | null | undefined;
};

/** Represents a collection of data that defines a Component Data Source. */
export type DataSourceDefinitionInput = {
  /** Specifies how the Data Source handles Authorization. */
  authorization?: AuthorizationDefinition | null | undefined;
  /** Specifies whether the Data Source can call other Component Actions, Data Sources, or Triggers. */
  canCallComponentFunctions?: boolean | null | undefined;
  /** The type of the resulting data from the Data Source. */
  dataSourceType: string;
  /** Specifies the key of a Data Source in this Component which can provide additional details about the content for this Data Source, such as example values when selecting particular API object fields. */
  detailDataSource?: string | null | undefined;
  /** Specifies how the Data Source is displayed. */
  display: ActionDisplayDefinition;
  /** An example of the returned payload of an Data Source. */
  examplePayload?: unknown;
  /** The InputFields supported by the Data Source. */
  inputs: Array<InputFieldDefinition | null | undefined>;
  /** A string which uniquely identifies the Data Source in the context of the Component. */
  key: string;
};

/** Represents a choice for an InputField. */
export type InputFieldChoice = {
  /** The label to display for the choice. */
  label: string;
  /** The value of the choice. */
  value: string;
};

/** Represents an input field for a Component Action. */
export type InputFieldDefinition = {
  /** Specifies the type of collection to use for storing input values, if applicable. */
  collection?: string | null | undefined;
  /** Additional notes about the InputField. */
  comments?: string | null | undefined;
  /** If present, the related Data Source capable of supplying a value to this InputField. */
  dataSource?: string | null | undefined;
  /** The default value for the InputField. */
  default?: unknown;
  /** An example valid input for this InputField. */
  example?: string | null | undefined;
  /** Nested InputFields. Permitted when `type` is 'structuredObject' or 'dynamicObject'. A top-level 'structuredObject' may only contain leaf children. A 'dynamicObject's children must each be a 'structuredObject' configuration; each configuration may itself contain a nested 'structuredObject' one level deep. */
  inputs?: Array<InputFieldDefinition | null | undefined> | null | undefined;
  /** A string which uniquely identifies the InputField in the context of the Action. */
  key: string;
  /** Label used for the Keys of a 'keyvaluelist' collection. */
  keyLabel?: string | null | undefined;
  /** The name of the InputField. */
  label: string;
  /** Language to use for the Code Field. */
  language?: string | null | undefined;
  /** Dictates how possible choices are provided for this InputField. */
  model?: Array<InputFieldChoice | null | undefined> | null | undefined;
  /** Placeholder text that will appear in the InputField UI. */
  placeholder?: string | null | undefined;
  /** Specifies whether the InputField is required by the Action. */
  required?: boolean | null | undefined;
  /** Specifies the scope in which this input is accessible. */
  scope?: InputFieldScope | null | undefined;
  /** Specifies the type of data the InputField handles. */
  type: string;
};

export type InputFieldScope = "ON_DEPLOY";

/** Represents a collection of data that defines a Component Trigger. */
export type TriggerDefinitionInput = {
  /** Specifies whether the Action will allow Conditional Branching. */
  allowsBranching?: boolean | null | undefined;
  /** Specifies how the Action handles Authorization. */
  authorization?: AuthorizationDefinition | null | undefined;
  /** Specifies whether an Action will break out of a loop. */
  breakLoop?: boolean | null | undefined;
  /** Specifies whether the Action can call other Component Actions, Data Sources, or Triggers. */
  canCallComponentFunctions?: boolean | null | undefined;
  /** Specifies how the Component Action is displayed. */
  display: ActionDisplayDefinition;
  /** The input associated with dynamic branching. */
  dynamicBranchInput?: string | null | undefined;
  /** An example of the returned payload of an Action. */
  examplePayload?: unknown;
  /** Whether the Action's examplePerform is safe to invoke inline. */
  examplePerformSafety?: ActionPerformSafety | null | undefined;
  /** Whether this Trigger defines a getNextDiscoveryState function for pagination. */
  hasGetNextDiscoveryState?: boolean | null | undefined;
  /** Whether this Trigger defines an onDeployResolver.getNextDiscoveryState function for pagination of the on-deploy fire. */
  hasGetOnDeployNextDiscoveryState?: boolean | null | undefined;
  /** Whether this Trigger defines an onDeployPerform function. */
  hasOnDeployPerform?: boolean | null | undefined;
  hasOnInstanceDelete?: boolean | null | undefined;
  hasOnInstanceDeploy?: boolean | null | undefined;
  /** Whether this Trigger defines an onDeployResolver.resolveItems function. */
  hasResolveOnDeployItems?: boolean | null | undefined;
  /** Whether this Trigger defines a resolveItems function to extract items from its payload. */
  hasResolveTriggerItems?: boolean | null | undefined;
  hasWebhookCreateFunction?: boolean | null | undefined;
  hasWebhookDeleteFunction?: boolean | null | undefined;
  /** The InputFields supported by the Component Action. */
  inputs: Array<InputFieldDefinition | null | undefined>;
  isCommonTrigger?: boolean | null | undefined;
  isPollingTrigger?: boolean | null | undefined;
  /** A string which uniquely identifies the Action in the context of the Component. */
  key: string;
  /** Describes the shape of the Action's output. For branching Actions, declares a distinct schema per branch. */
  outputSchema?: ActionOutputSchemaInput | null | undefined;
  /** Whether the Action's perform is safe to invoke inline. */
  performSafety?: ActionPerformSafety | null | undefined;
  /** Specifies support for triggering an Integration on a recurring schedule. */
  scheduleSupport?: string | null | undefined;
  /** The static branch names associated with an Action. */
  staticBranchNames?: Array<string | null | undefined> | null | undefined;
  /** Specifies support for synchronous responses to an Integration webhook request. */
  synchronousResponseSupport?: string | null | undefined;
  /** Specifies whether the Action will terminate Instance execution. */
  terminateExecution?: boolean | null | undefined;
  /** Default number of items per batch. */
  triggerResolverDefaultBatchSize?: number | null | undefined;
  /** Default max batches of a single execution running concurrently. */
  triggerResolverDefaultConcurrentBatchLimit?: number | null | undefined;
  /** Whether this Trigger supports batching its items. */
  triggerResolverSupport?: string | null | undefined;
};

export type PublishComponentMutationVariables = Exact<{
  definition: Types.ComponentDefinitionInput;
  actions: Array<Types.ActionDefinitionInput | null | undefined> | Types.ActionDefinitionInput;
  triggers?:
    | Array<Types.TriggerDefinitionInput | null | undefined>
    | Types.TriggerDefinitionInput
    | null
    | undefined;
  dataSources?:
    | Array<Types.DataSourceDefinitionInput | null | undefined>
    | Types.DataSourceDefinitionInput
    | null
    | undefined;
  connections?:
    | Array<Types.ConnectionDefinitionInput | null | undefined>
    | Types.ConnectionDefinitionInput
    | null
    | undefined;
  comment?: string | null | undefined;
  customer?: string | number | null | undefined;
  attributes?: string | null | undefined;
}>;

export type PublishComponentMutation = {
  publishComponent: {
    publishResult: {
      iconUploadUrl: string | null;
      packageUploadUrl: string | null;
      sourceUploadUrl: string | null;
      component: { id: string; versionNumber: number } | null;
      connectionIconUploadUrls: Array<{
        connectionKey: string | null;
        iconUploadUrl: string | null;
      } | null> | null;
      connectionAvatarIconUploadUrls: Array<{
        connectionKey: string | null;
        iconUploadUrl: string | null;
      } | null> | null;
    } | null;
    errors: Array<{ field: string; messages: Array<string> }>;
  } | null;
};

export const PublishComponentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "publishComponent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "definition" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ComponentDefinitionInput" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "actions" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ActionDefinitionInput" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "triggers" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "TriggerDefinitionInput" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "dataSources" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DataSourceDefinitionInput" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "connections" } },
          type: {
            kind: "ListType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ConnectionDefinitionInput" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "comment" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "customer" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "attributes" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "publishComponent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "definition" },
                      value: { kind: "Variable", name: { kind: "Name", value: "definition" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "actions" },
                      value: { kind: "Variable", name: { kind: "Name", value: "actions" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "triggers" },
                      value: { kind: "Variable", name: { kind: "Name", value: "triggers" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "dataSources" },
                      value: { kind: "Variable", name: { kind: "Name", value: "dataSources" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "connections" },
                      value: { kind: "Variable", name: { kind: "Name", value: "connections" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "comment" },
                      value: { kind: "Variable", name: { kind: "Name", value: "comment" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "customer" },
                      value: { kind: "Variable", name: { kind: "Name", value: "customer" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "attributes" },
                      value: { kind: "Variable", name: { kind: "Name", value: "attributes" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "publishResult" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "component" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "iconUploadUrl" } },
                      { kind: "Field", name: { kind: "Name", value: "packageUploadUrl" } },
                      { kind: "Field", name: { kind: "Name", value: "sourceUploadUrl" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "connectionIconUploadUrls" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "connectionKey" } },
                            { kind: "Field", name: { kind: "Name", value: "iconUploadUrl" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "connectionAvatarIconUploadUrls" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "connectionKey" } },
                            { kind: "Field", name: { kind: "Name", value: "iconUploadUrl" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      { kind: "Field", name: { kind: "Name", value: "messages" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PublishComponentMutation, PublishComponentMutationVariables>;
