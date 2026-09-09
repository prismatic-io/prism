import AutocompleteCommand from "./commands/autocomplete/index.js";
import AutocompleteScriptCommand from "./commands/autocomplete/script.js";
import AlertsEventsListCommand from "./commands/alerts/events/list.js";
import AlertsGroupsCreateCommand from "./commands/alerts/groups/create.js";
import AlertsGroupsDeleteCommand from "./commands/alerts/groups/delete.js";
import AlertsGroupsListCommand from "./commands/alerts/groups/list.js";
import AlertsMonitorsClearCommand from "./commands/alerts/monitors/clear.js";
import AlertsMonitorsCreateCommand from "./commands/alerts/monitors/create.js";
import AlertsMonitorsDeleteCommand from "./commands/alerts/monitors/delete.js";
import AlertsMonitorsListCommand from "./commands/alerts/monitors/list.js";
import AlertsTriggersListCommand from "./commands/alerts/triggers/list.js";
import AlertsWebhooksCreateCommand from "./commands/alerts/webhooks/create.js";
import AlertsWebhooksDeleteCommand from "./commands/alerts/webhooks/delete.js";
import AlertsWebhooksListCommand from "./commands/alerts/webhooks/list.js";
import ComponentsActionsListCommand from "./commands/components/actions/list.js";
import ComponentsDataSourcesListCommand from "./commands/components/data-sources/list.js";
import ComponentsDeleteCommand from "./commands/components/delete.js";
import ComponentsDevRunCommand from "./commands/components/dev/run.js";
import ComponentsDevTestCommand from "./commands/components/dev/test.js";
import ComponentsInitComponentCommand from "./commands/components/init/component.js";
import ComponentsInitCommand from "./commands/components/init/index.js";
import ComponentsListCommand from "./commands/components/list.js";
import ComponentsPublishCommand from "./commands/components/publish.js";
import ComponentsSignatureCommand from "./commands/components/signature.js";
import ComponentsTriggersListCommand from "./commands/components/triggers/list.js";
import CustomersCreateCommand from "./commands/customers/create.js";
import CustomersDeleteCommand from "./commands/customers/delete.js";
import CustomersListCommand from "./commands/customers/list.js";
import CustomersUpdateCommand from "./commands/customers/update.js";
import CustomersUsersCreateCommand from "./commands/customers/users/create.js";
import CustomersUsersDeleteCommand from "./commands/customers/users/delete.js";
import CustomersUsersListCommand from "./commands/customers/users/list.js";
import CustomersUsersRolesCommand from "./commands/customers/users/roles.js";
import CustomersUsersUpdateCommand from "./commands/customers/users/update.js";
import ExecutionsStepResultGetCommand from "./commands/executions/step-result/get.js";
import GraphqlQueryCommand from "./commands/graphql/query.js";
import InstancesConfigVarsListCommand from "./commands/instances/config-vars/list.js";
import InstancesCreateCommand from "./commands/instances/create.js";
import InstancesDeleteCommand from "./commands/instances/delete.js";
import InstancesDeployCommand from "./commands/instances/deploy.js";
import InstancesDisableCommand from "./commands/instances/disable.js";
import InstancesEnableCommand from "./commands/instances/enable.js";
import InstancesFlowConfigsListCommand from "./commands/instances/flow-configs/list.js";
import InstancesFlowConfigsTestCommand from "./commands/instances/flow-configs/test.js";
import InstancesListCommand from "./commands/instances/list.js";
import InstancesUpdateCommand from "./commands/instances/update.js";
import IntegrationsAvailableCommand from "./commands/integrations/available.js";
import IntegrationConvertCommand from "./commands/integrations/convert/index.js";
import IntegrationsCreateCommand from "./commands/integrations/create.js";
import IntegrationsDeleteCommand from "./commands/integrations/delete.js";
import IntegrationsExportCommand from "./commands/integrations/export.js";
import IntegrationsFlowsListCommand from "./commands/integrations/flows/list.js";
import IntegrationsFlowsListenCommand from "./commands/integrations/flows/listen.js";
import IntegrationsFlowsTestCommand from "./commands/integrations/flows/test.js";
import IntegrationsForkCommand from "./commands/integrations/fork.js";
import IntegrationsImportCommand from "./commands/integrations/import.js";
import IntegrationsInitCommand from "./commands/integrations/init/index.js";
import IntegrationsListCommand from "./commands/integrations/list.js";
import IntegrationsMarketplaceCommand from "./commands/integrations/marketplace.js";
import IntegrationsOpenCommand from "./commands/integrations/open.js";
import IntegrationsPublishCommand from "./commands/integrations/publish.js";
import IntegrationsSetDebugCommand from "./commands/integrations/set-debug.js";
import IntegrationsUpdateCommand from "./commands/integrations/update.js";
import IntegrationsValidateYamlCommand from "./commands/integrations/validate-yaml.js";
import IntegrationsVersionsCommand from "./commands/integrations/versions/index.js";
import LoginCommand from "./commands/login/index.js";
import LoginSwitchCommand from "./commands/login/switch.js";
import LogoutCommand from "./commands/logout.js";
import LogsSeveritiesListCommand from "./commands/logs/severities/list.js";
import MeCommand from "./commands/me/index.js";
import MeTokenRevokeCommand from "./commands/me/token/revoke.js";
import MeTokenCommand from "./commands/me/token.js";
import OnPremResourcesDeleteCommand from "./commands/on-prem-resources/delete.js";
import OnPremResourcesListCommand from "./commands/on-prem-resources/list.js";
import OnPremResourcesRegistrationCommand from "./commands/on-prem-resources/registration-jwt.js";
import OrganizationConnectionsListCommand from "./commands/organization/connections/list.js";
import OrganizationSigningKeysDeleteCommand from "./commands/organization/signingKeys/delete.js";
import OrganizationSigningKeysGenerateCommand from "./commands/organization/signingKeys/generate.js";
import OrganizationSigningKeysImportCommand from "./commands/organization/signingKeys/import.js";
import OrganizationSigningKeysListCommand from "./commands/organization/signingKeys/list.js";
import OrganizationUpdateCommand from "./commands/organization/update.js";
import OrganizationUpdateAvatarUrlCommand from "./commands/organization/updateAvatarUrl.js";
import OrganizationUsersCreateCommand from "./commands/organization/users/create.js";
import OrganizationUsersDeleteCommand from "./commands/organization/users/delete.js";
import OrganizationUsersListCommand from "./commands/organization/users/list.js";
import OrganizationUsersRolesCommand from "./commands/organization/users/roles.js";
import OrganizationUsersUpdateCommand from "./commands/organization/users/update.js";
import ProfilesDeleteCommand from "./commands/profiles/delete.js";
import ProfilesListCommand from "./commands/profiles/list.js";
import ProfilesUseCommand from "./commands/profiles/use.js";
import TranslationsListCommand from "./commands/translations/list.js";
import WorkflowsExportCommand from "./commands/workflows/export.js";
import WorkflowsImportCommand from "./commands/workflows/import.js";
import { prepareCommand } from "./command.js";

export const Commands = {
  autocomplete: prepareCommand(AutocompleteCommand, {}),
  "autocomplete:script": prepareCommand(AutocompleteScriptCommand, {}),
  login: prepareCommand(LoginCommand, { mutates: true, authContext: "profile" as const }),
  "login:switch": prepareCommand(LoginSwitchCommand, {
    mutates: true,
    authContext: "profile" as const,
  }),
  logout: prepareCommand(LogoutCommand, { mutates: true, authContext: "profile" as const }),
  "components:delete": prepareCommand(ComponentsDeleteCommand, { mutates: true }),
  "components:list": prepareCommand(ComponentsListCommand, {}),
  "components:publish": prepareCommand(ComponentsPublishCommand, { mutates: true }),
  "customers:create": prepareCommand(CustomersCreateCommand, { mutates: true }),
  "customers:delete": prepareCommand(CustomersDeleteCommand, { mutates: true }),
  "customers:list": prepareCommand(CustomersListCommand, {}),
  "customers:update": prepareCommand(CustomersUpdateCommand, { mutates: true }),
  "instances:create": prepareCommand(InstancesCreateCommand, { mutates: true }),
  "instances:delete": prepareCommand(InstancesDeleteCommand, { mutates: true }),
  "instances:deploy": prepareCommand(InstancesDeployCommand, { mutates: true }),
  "instances:disable": prepareCommand(InstancesDisableCommand, { mutates: true }),
  "instances:enable": prepareCommand(InstancesEnableCommand, { mutates: true }),
  "instances:list": prepareCommand(InstancesListCommand, {}),
  "instances:update": prepareCommand(InstancesUpdateCommand, { mutates: true }),
  "integrations:available": prepareCommand(IntegrationsAvailableCommand, { mutates: true }),
  "integrations:create": prepareCommand(IntegrationsCreateCommand, { mutates: true }),
  "integrations:delete": prepareCommand(IntegrationsDeleteCommand, { mutates: true }),
  "integrations:export": prepareCommand(IntegrationsExportCommand, {}),
  "integrations:fork": prepareCommand(IntegrationsForkCommand, { mutates: true }),
  "integrations:import": prepareCommand(IntegrationsImportCommand, { mutates: true }),
  "integrations:list": prepareCommand(IntegrationsListCommand, {}),
  "integrations:marketplace": prepareCommand(IntegrationsMarketplaceCommand, { mutates: true }),
  "integrations:open": prepareCommand(IntegrationsOpenCommand, { mutates: true }),
  "integrations:publish": prepareCommand(IntegrationsPublishCommand, { mutates: true }),
  "integrations:set-debug": prepareCommand(IntegrationsSetDebugCommand, { mutates: true }),
  "integrations:update": prepareCommand(IntegrationsUpdateCommand, { mutates: true }),
  "integrations:validate-yaml": prepareCommand(IntegrationsValidateYamlCommand, {}),
  me: prepareCommand(MeCommand, {}),
  "me:token": prepareCommand(MeTokenCommand, {}),
  "profiles:list": prepareCommand(ProfilesListCommand, {}),
  "profiles:use": prepareCommand(ProfilesUseCommand, { mutates: true }),
  "profiles:delete": prepareCommand(ProfilesDeleteCommand, { mutates: true }),
  "on-prem-resources:delete": prepareCommand(OnPremResourcesDeleteCommand, { mutates: true }),
  "on-prem-resources:list": prepareCommand(OnPremResourcesListCommand, {}),
  "on-prem-resources:registration-jwt": prepareCommand(OnPremResourcesRegistrationCommand, {
    mutates: true,
  }),
  "organization:update": prepareCommand(OrganizationUpdateCommand, { mutates: true }),
  "organization:updateAvatarUrl": prepareCommand(OrganizationUpdateAvatarUrlCommand, {
    mutates: true,
  }),
  "translations:list": prepareCommand(TranslationsListCommand, { mutates: true }),
  "alerts:events:list": prepareCommand(AlertsEventsListCommand, {}),
  "alerts:groups:create": prepareCommand(AlertsGroupsCreateCommand, { mutates: true }),
  "alerts:groups:delete": prepareCommand(AlertsGroupsDeleteCommand, { mutates: true }),
  "alerts:groups:list": prepareCommand(AlertsGroupsListCommand, {}),
  "alerts:monitors:clear": prepareCommand(AlertsMonitorsClearCommand, { mutates: true }),
  "alerts:monitors:create": prepareCommand(AlertsMonitorsCreateCommand, { mutates: true }),
  "alerts:monitors:delete": prepareCommand(AlertsMonitorsDeleteCommand, { mutates: true }),
  "alerts:monitors:list": prepareCommand(AlertsMonitorsListCommand, {}),
  "alerts:triggers:list": prepareCommand(AlertsTriggersListCommand, {}),
  "alerts:webhooks:create": prepareCommand(AlertsWebhooksCreateCommand, { mutates: true }),
  "alerts:webhooks:delete": prepareCommand(AlertsWebhooksDeleteCommand, { mutates: true }),
  "alerts:webhooks:list": prepareCommand(AlertsWebhooksListCommand, {}),
  "components:actions:list": prepareCommand(ComponentsActionsListCommand, {}),
  "components:data-sources:list": prepareCommand(ComponentsDataSourcesListCommand, {}),
  "components:dev:run": prepareCommand(ComponentsDevRunCommand, { mutates: true }),
  "components:dev:test": prepareCommand(ComponentsDevTestCommand, { mutates: true }),
  "components:init:component": prepareCommand(ComponentsInitComponentCommand, {
    mutates: true,
    hidden: true,
  }),
  "components:init": prepareCommand(ComponentsInitCommand, { mutates: true }),
  "components:signature": prepareCommand(ComponentsSignatureCommand, {}),
  "components:triggers:list": prepareCommand(ComponentsTriggersListCommand, {}),
  "customers:users:create": prepareCommand(CustomersUsersCreateCommand, { mutates: true }),
  "customers:users:delete": prepareCommand(CustomersUsersDeleteCommand, { mutates: true }),
  "customers:users:list": prepareCommand(CustomersUsersListCommand, {}),
  "customers:users:roles": prepareCommand(CustomersUsersRolesCommand, {}),
  "customers:users:update": prepareCommand(CustomersUsersUpdateCommand, { mutates: true }),
  "executions:step-result:get": prepareCommand(ExecutionsStepResultGetCommand, { mutates: true }),
  "instances:config-vars:list": prepareCommand(InstancesConfigVarsListCommand, {}),
  "instances:flow-configs:list": prepareCommand(InstancesFlowConfigsListCommand, {}),
  "instances:flow-configs:test": prepareCommand(InstancesFlowConfigsTestCommand, { mutates: true }),
  "integrations:convert": prepareCommand(IntegrationConvertCommand, { mutates: true }),
  "integrations:flows:list": prepareCommand(IntegrationsFlowsListCommand, {}),
  "integrations:flows:listen": prepareCommand(IntegrationsFlowsListenCommand, { mutates: true }),
  "integrations:flows:test": prepareCommand(IntegrationsFlowsTestCommand, { mutates: true }),
  "integrations:init": prepareCommand(IntegrationsInitCommand, { mutates: true }),
  "integrations:versions": prepareCommand(IntegrationsVersionsCommand, {}),
  "logs:severities:list": prepareCommand(LogsSeveritiesListCommand, {}),
  "me:token:revoke": prepareCommand(MeTokenRevokeCommand, { mutates: true }),
  "organization:connections:list": prepareCommand(OrganizationConnectionsListCommand, {}),
  "organization:signing-keys:delete": prepareCommand(OrganizationSigningKeysDeleteCommand, {
    mutates: true,
  }),
  "organization:signing-keys:generate": prepareCommand(OrganizationSigningKeysGenerateCommand, {
    mutates: true,
  }),
  "organization:signing-keys:import": prepareCommand(OrganizationSigningKeysImportCommand, {
    mutates: true,
  }),
  "organization:signing-keys:list": prepareCommand(OrganizationSigningKeysListCommand, {}),
  "organization:users:create": prepareCommand(OrganizationUsersCreateCommand, { mutates: true }),
  "organization:users:delete": prepareCommand(OrganizationUsersDeleteCommand, { mutates: true }),
  "organization:users:list": prepareCommand(OrganizationUsersListCommand, {}),
  "organization:users:roles": prepareCommand(OrganizationUsersRolesCommand, {}),
  "organization:users:update": prepareCommand(OrganizationUsersUpdateCommand, { mutates: true }),
  "workflows:export": prepareCommand(WorkflowsExportCommand, {}),
  "workflows:import": prepareCommand(WorkflowsImportCommand, { mutates: true }),
  "graphql:query": prepareCommand(GraphqlQueryCommand, {}),
};

export type CommandName = keyof typeof Commands;
