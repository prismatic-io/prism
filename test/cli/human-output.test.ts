import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterAll, beforeAll, expect, it } from "vitest";

const entrypoint = fileURLToPath(new URL("../../lib/run.js", import.meta.url));
const resource = { id: "resource-id" };
const definition = "definitionVersion: 7\nname: Smoke fixture\n";
const data = {
  createOnPremiseResourceJWT: { result: { jwt: "synthetic-registration-token" } },
  rotateOnPremiseResourceJWT: { result: { jwt: "synthetic-rotated-token" } },
  createOrganizationSigningKey: { result: { privateKey: "synthetic-private-key" } },
  marketplaceIntegrations: { nodes: [] },
  createCustomer: { customer: resource },
  updateCustomer: { customer: resource },
  createInstance: { instance: resource },
  updateInstance: { instance: resource },
  deployInstance: { instance: resource },
  createIntegration: { integration: resource },
  updateIntegration: { integration: resource },
  forkIntegration: { integration: resource },
  updateIntegrationVersionAvailability: { integration: resource },
  updateIntegrationMarketplaceConfiguration: { integration: resource },
  createAlertGroup: { alertGroup: resource },
  createAlertWebhook: { alertWebhook: resource },
  createAlertMonitor: { alertMonitor: resource },
  updateOrganization: { organization: resource },
  createOrganizationUser: { user: resource },
  updateUser: { user: resource },
  createCustomerUser: { user: resource },
  importWorkflow: { workflow: resource },
  integration: { definition },
  workflow: { definition },
  deleteCustomer: { errors: [] },
  deleteIntegration: { errors: [] },
  deleteInstance: { errors: [] },
  deleteComponent: { errors: [] },
  deleteAlertGroup: { errors: [] },
  deleteAlertMonitor: { errors: [] },
  deleteAlertWebhook: { errors: [] },
  deleteUser: { errors: [] },
  deleteOrganizationSigningKey: { errors: [] },
  clearAlertMonitor: { errors: [] },
  customers: {
    nodes: [{ id: "resource-id", name: "Fixture", description: "", externalId: null, labels: [] }],
    pageInfo: { hasNextPage: false, endCursor: null },
  },
};
let endpoint: string;
const server = createServer((request, response) => {
  request.resume();
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ data }));
});
beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing server port");
  endpoint = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
const run = async (args: string[]) =>
  promisify(execFile)(process.execPath, [entrypoint, ...args], {
    timeout: 30_000,
    env: {
      ...process.env,
      FORCE_HUMAN_MODE: "true",
      PRISMATIC_URL: endpoint,
      PRISM_ACCESS_TOKEN: "synthetic-audit-token",
      PRISM_REFRESH_TOKEN: "",
      PRISM_CONFIG_FILE: "/nonexistent/prism-audit.yml",
      NO_PROXY: "127.0.0.1",
    },
  });
const idCases = [
  ["customers:create", "--name", "Fixture"],
  ["customers:update", "resource-id", "--name", "Updated"],
  ["instances:create", "-n", "Fixture", "-i", "integration", "-c", "customer"],
  ["instances:update", "resource-id", "-n", "Updated"],
  ["instances:deploy", "resource-id"],
  ["instances:enable", "resource-id"],
  ["instances:disable", "resource-id"],
  ["integrations:create", "-n", "Fixture", "-d", "Fixture"],
  ["integrations:update", "resource-id", "-n", "Updated"],
  ["integrations:fork", "resource-id", "-n", "Fixture", "-d", "Fixture"],
  ["integrations:available", "resource-id", "--available"],
  ["integrations:marketplace", "resource-id", "--available"],
  ["alerts:groups:create", "-n", "Fixture"],
  ["alerts:webhooks:create", "-n", "Fixture", "-u", "https://example.invalid", "-p", "{}"],
  ["alerts:monitors:create", "-n", "Fixture", "-i", "instance", "-t", "[]"],
];
it.for(idCases)("%j retains a bare ID on human stdout", async (args) => {
  const result = await run(args);
  expect(result.stdout).toBe("resource-id\n");
});
it.for([
  "customers:delete",
  "instances:delete",
  "integrations:delete",
  "components:delete",
  "alerts:groups:delete",
  "alerts:monitors:delete",
  "alerts:webhooks:delete",
  "organization:signing-keys:delete",
])("%s retains silent human success", async (command) => {
  expect((await run([command, "resource-id"])).stdout).toBe("");
});
it.for(["integrations:export", "workflows:export"])("%s retains pipeable YAML", async (command) => {
  expect((await run([command, "resource-id"])).stdout).toBe(`${definition}\n`);
  expect(JSON.parse((await run([command, "resource-id", "--json"])).stdout)).toEqual({
    definition,
  });
});
it.for([
  [],
  ["--agent", "--yes"],
])("explicit human/agent JSON contains exactly one document: %j", async (mode) => {
  const created = await run(["customers:create", "--name", "Fixture", ...mode, "--json"]);
  expect(JSON.parse(created.stdout)).toMatchObject({ customerId: "resource-id" });
  const token = await run(["me:token", ...mode, "--json"]);
  expect(JSON.parse(token.stdout)).toEqual({ token: "synthetic-audit-token", type: "access" });
  const list = await run(["customers:list", ...mode, "--json"]);
  expect(JSON.parse(list.stdout).items).toHaveLength(1);
});

it.for([
  {
    args: ["on-prem-resources:registration-jwt", "--orgOnly"],
    text: "synthetic-registration-token",
    result: { token: "synthetic-registration-token" },
  },
  {
    args: ["on-prem-resources:registration-jwt", "--resourceId", "fixture", "--rotate"],
    text: "synthetic-rotated-token",
    result: { token: "synthetic-rotated-token" },
  },
  {
    args: ["organization:signing-keys:generate"],
    text: "synthetic-private-key",
    result: { privateKey: "synthetic-private-key" },
  },
  { args: ["translations:list", "--output-file", ""], text: "{}", result: { translations: {} } },
])("preserves pipeable human data and explicit JSON: $args", async ({ args, text, result }) => {
  expect((await run(args)).stdout).toBe(`${text}\n`);
  expect(JSON.parse((await run([...args, "--json"])).stdout)).toEqual(result);
});
