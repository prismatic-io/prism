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
