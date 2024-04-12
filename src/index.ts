import LoginCommand from "./commands/login.js";
import LogoutCommand from "./commands/logout.js";
import ComponentsDeleteCommand from "./commands/components/delete.js";
import ComponentsListCommand from "./commands/components/list.js";
import ComponentsPublishCommand from "./commands/components/publish.js";
import CustomersCreateCommand from "./commands/customers/create.js";
import CustomersDeleteCommand from "./commands/customers/delete.js";
import CustomersListCommand from "./commands/customers/list.js";
import CustomersUpdateCommand from "./commands/customers/update.js";
import InstancesCreateCommand from "./commands/instances/create.js";
import InstancesDeleteCommand from "./commands/instances/delete.js";
import InstancesDeployCommand from "./commands/instances/deploy.js";
import InstancesDisableCommand from "./commands/instances/disable.js";
import InstancesEnableCommand from "./commands/instances/enable.js";
import InstancesListCommand from "./commands/instances/list.js";
import InstancesUpdateCommand from "./commands/instances/update.js";
import IntegrationsAvailableCommand from "./commands/integrations/available.js";
import IntegrationsCreateCommand from "./commands/integrations/create.js";
import IntegrationsDeleteCommand from "./commands/integrations/delete.js";
import IntegrationsExportCommand from "./commands/integrations/export.js";
import IntegrationsForkCommand from "./commands/integrations/fork.js";
import IntegrationsImportCommand from "./commands/integrations/import.js";
import IntegrationsListCommand from "./commands/integrations/list.js";
import IntegrationsMarketplaceCommand from "./commands/integrations/marketplace.js";
import IntegrationsOpenCommand from "./commands/integrations/open.js";
import IntegrationsPublishCommand from "./commands/integrations/publish.js";
import IntegrationsUpdateCommand from "./commands/integrations/update.js";
import MeCommand from "./commands/me/index.js";
import MeTokenCommand from "./commands/me/token.js";
import OnPremResourcesDeleteCommand from "./commands/on-prem-resources/delete.js";
import OnPremResourcesListCommand from "./commands/on-prem-resources/list.js";
import OnPremResourcesRegistrationCommand from "./commands/on-prem-resources/registration-jwt.js";
import OrganizationUpdateCommand from "./commands/organization/update.js";
import OrganizationUpdateAvatarUrlCommand from "./commands/organization/updateAvatarUrl.js";
import TranslationsListCommand from "./commands/translations/list.js";
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
import ComponentsDevRunCommand from "./commands/components/dev/run.js";
import ComponentsDevTestCommand from "./commands/components/dev/test.js";
import ComponentsInitActionCommand from "./commands/components/init/action.js";
import ComponentsInitComponentCommand from "./commands/components/init/component.js";
import ComponentsInitConnectionCommand from "./commands/components/init/connection.js";
import ComponentsInitDataSourceCommand from "./commands/components/init/dataSource.js";
import ComponentsInitCommand from "./commands/components/init/index.js";
import ComponentsInitTriggerCommand from "./commands/components/init/trigger.js";
import ComponentsTriggersListCommand from "./commands/components/triggers/list.js";
import CustomersCredentialsCreateCommand from "./commands/customers/credentials/create.js";
import CustomersCredentialsDeleteCommand from "./commands/customers/credentials/delete.js";
import CustomersCredentialsUpdateCommand from "./commands/customers/credentials/update.js";
import CustomersCredentialsListCommand from "./commands/customers/credentials/list.js";
import CustomersUsersCreateCommand from "./commands/customers/users/create.js";
import CustomersUsersDeleteCommand from "./commands/customers/users/delete.js";
import CustomersUsersListCommand from "./commands/customers/users/list.js";
import CustomersUsersRolesCommand from "./commands/customers/users/roles.js";
import CustomersUsersUpdateCommand from "./commands/customers/users/update.js";
import ExecutionsStepResultGetCommand from "./commands/executions/step-result/get.js";
import InstancesConfigVarsListCommand from "./commands/instances/config-vars/list.js";
import InstancesFlowConfigsListCommand from "./commands/instances/flow-configs/list.js";
import InstancesFlowConfigsTestCommand from "./commands/instances/flow-configs/test.js";
import IntegrationsFlowsListCommand from "./commands/integrations/flows/list.js";
import IntegrationsFlowsTestCommand from "./commands/integrations/flows/test.js";
import IntegrationsInitFlowCommand from "./commands/integrations/init/flow.js";
import IntegrationsInitCommand from "./commands/integrations/init/index.js";
import IntegrationsInitIntegrationCommand from "./commands/integrations/init/integration.js";
import IntegrationsInitSelectorCommand from "./commands/integrations/init/selector/selector.js";
import IntegrationsVersionsCommand from "./commands/integrations/versions/index.js";
import LogsSeveritiesListCommand from "./commands/logs/severities/list.js";
import MeTokenRevokeCommand from "./commands/me/token/revoke.js";
import OrganizationCredentialsCreateCommand from "./commands/organization/credentials/create.js";
import OrganizationCredentialsDeleteCommand from "./commands/organization/credentials/delete.js";
import OrganizationCredentialsListCommand from "./commands/organization/credentials/list.js";
import OrganizationCredentialsUpdateCommand from "./commands/organization/credentials/update.js";
import OrganizationSigningKeysDeleteCommand from "./commands/organization/signingKeys/delete.js";
import OrganizationSigningKeysGenerateCommand from "./commands/organization/signingKeys/generate.js";
import OrganizationSigningKeysImportCommand from "./commands/organization/signingKeys/import.js";
import OrganizationSigningKeysListCommand from "./commands/organization/signingKeys/list.js";
import OrganizationUsersCreateCommand from "./commands/organization/users/create.js";
import OrganizationUsersDeleteCommand from "./commands/organization/users/delete.js";
import OrganizationUsersListCommand from "./commands/organization/users/list.js";
import OrganizationUsersRolesCommand from "./commands/organization/users/roles.js";
import OrganizationUsersUpdateCommand from "./commands/organization/users/update.js";

export const Commands = {
  login: LoginCommand,
  logout: LogoutCommand,
  "components:delete": ComponentsDeleteCommand,
  "components:list": ComponentsListCommand,
  "components:publish": ComponentsPublishCommand,
  "customers:create": CustomersCreateCommand,
  "customers:delete": CustomersDeleteCommand,
  "customers:list": CustomersListCommand,
  "customers:update": CustomersUpdateCommand,
  "instances:create": InstancesCreateCommand,
  "instances:delete": InstancesDeleteCommand,
  "instances:deploy": InstancesDeployCommand,
  "instances:disable": InstancesDisableCommand,
  "instances:enable": InstancesEnableCommand,
  "instances:list": InstancesListCommand,
  "instances:update": InstancesUpdateCommand,
  "integrations:available": IntegrationsAvailableCommand,
  "integrations:create": IntegrationsCreateCommand,
  "integrations:delete": IntegrationsDeleteCommand,
  "integrations:export": IntegrationsExportCommand,
  "integrations:fork": IntegrationsForkCommand,
  "integrations:import": IntegrationsImportCommand,
  "integrations:list": IntegrationsListCommand,
  "integrations:marketplace": IntegrationsMarketplaceCommand,
  "integrations:open": IntegrationsOpenCommand,
  "integrations:publish": IntegrationsPublishCommand,
  "integrations:update": IntegrationsUpdateCommand,
  me: MeCommand,
  "me:token": MeTokenCommand,
  "on-prem-resources:delete": OnPremResourcesDeleteCommand,
  "on-prem-resources:list": OnPremResourcesListCommand,
  "on-prem-resources:registration-jwt": OnPremResourcesRegistrationCommand,
  "organization:update": OrganizationUpdateCommand,
  "organization:updateAvatarUrl": OrganizationUpdateAvatarUrlCommand,
  "translations:list": TranslationsListCommand,
  "alerts:events:list": AlertsEventsListCommand,
  "alerts:groups:create": AlertsGroupsCreateCommand,
  "alerts:groups:delete": AlertsGroupsDeleteCommand,
  "alerts:groups:list": AlertsGroupsListCommand,
  "alerts:monitors:clear": AlertsMonitorsClearCommand,
  "alerts:monitors:create": AlertsMonitorsCreateCommand,
  "alerts:monitors:delete": AlertsMonitorsDeleteCommand,
  "alerts:monitors:list": AlertsMonitorsListCommand,
  "alerts:triggers:list": AlertsTriggersListCommand,
  "alerts:webhooks:create": AlertsWebhooksCreateCommand,
  "alerts:webhooks:delete": AlertsWebhooksDeleteCommand,
  "alerts:webhooks:list": AlertsWebhooksListCommand,
  "components:actions:list": ComponentsActionsListCommand,
  "components:data-sources:list": ComponentsDataSourcesListCommand,
  "components:dev:run": ComponentsDevRunCommand,
  "components:dev:test": ComponentsDevTestCommand,
  "components:init:action": ComponentsInitActionCommand,
  "components:init:component": ComponentsInitComponentCommand,
  "components:init:connection": ComponentsInitConnectionCommand,
  "components:init:data-source": ComponentsInitDataSourceCommand,
  "components:init": ComponentsInitCommand,
  "components:init:trigger": ComponentsInitTriggerCommand,
  "components:triggers:list": ComponentsTriggersListCommand,
  "customers:credentials:create": CustomersCredentialsCreateCommand,
  "customers:credentials:delete": CustomersCredentialsDeleteCommand,
  "customers:credentials:update": CustomersCredentialsUpdateCommand,
  "customers:credentials:list": CustomersCredentialsListCommand,
  "customers:users:create": CustomersUsersCreateCommand,
  "customers:users:delete": CustomersUsersDeleteCommand,
  "customers:users:list": CustomersUsersListCommand,
  "customers:users:roles": CustomersUsersRolesCommand,
  "customers:users:update": CustomersUsersUpdateCommand,
  "executions:step-result:get": ExecutionsStepResultGetCommand,
  "instances:config-vars:list": InstancesConfigVarsListCommand,
  "instances:flow-configs:list": InstancesFlowConfigsListCommand,
  "instances:flow-configs:test": InstancesFlowConfigsTestCommand,
  "integrations:flows:list": IntegrationsFlowsListCommand,
  "integrations:flows:test": IntegrationsFlowsTestCommand,
  "integrations:init:flow": IntegrationsInitFlowCommand,
  "integrations:init": IntegrationsInitCommand,
  "integrations:init:integration": IntegrationsInitIntegrationCommand,
  "integrations:init:selector": IntegrationsInitSelectorCommand,
  "integrations:versions": IntegrationsVersionsCommand,
  "logs:severities:list": LogsSeveritiesListCommand,
  "me:token:revoke": MeTokenRevokeCommand,
  "organization:credentials:create": OrganizationCredentialsCreateCommand,
  "organization:credentials:delete": OrganizationCredentialsDeleteCommand,
  "organization:credentials:list": OrganizationCredentialsListCommand,
  "organization:credentials:update": OrganizationCredentialsUpdateCommand,
  "organization:signing-keys:delete": OrganizationSigningKeysDeleteCommand,
  "organization:signing-keys:generate": OrganizationSigningKeysGenerateCommand,
  "organization:signing-keys:import": OrganizationSigningKeysImportCommand,
  "organization:signing-keys:list": OrganizationSigningKeysListCommand,
  "organization:users:create": OrganizationUsersCreateCommand,
  "organization:users:delete": OrganizationUsersDeleteCommand,
  "organization:users:list": OrganizationUsersListCommand,
  "organization:users:roles": OrganizationUsersRolesCommand,
  "organization:users:update": OrganizationUsersUpdateCommand,
};
