import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { TEST_PRISMATIC_URL } from "../vitest.setup.js";
import CustomerUsers from "./commands/customers/users/list.js";
import ConfigVariables from "./commands/instances/config-vars/list.js";
import FlowConfigs from "./commands/instances/flow-configs/list.js";
import Versions from "./commands/integrations/versions/index.js";
import SigningKeys from "./commands/organization/signingKeys/list.js";
import OrganizationUsers from "./commands/organization/users/list.js";

const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const cases = [
  { command: CustomerUsers, parent: "customer", child: "users", args: ["customer-id"] },
  { command: ConfigVariables, parent: "instance", child: "configVariables", args: ["instance-id"] },
  { command: FlowConfigs, parent: "instance", child: "flowConfigs", args: ["instance-id"] },
  { command: Versions, parent: "integration", child: "versionSequence", args: ["integration-id"] },
  { command: SigningKeys, parent: "organization", child: "signingKeys", args: [] },
  { command: OrganizationUsers, parent: "organization", child: "users", args: [] },
];

describe.each(cases)("$parent.$child resource lookup", ({ command, parent, child, args }) => {
  it("rejects a missing parent instead of reporting a successful empty list", async () => {
    server.use(api.operation(() => HttpResponse.json({ data: { [parent]: null } })));
    await expect(command.run(args)).rejects.toMatchObject({
      code: "NOT_FOUND",
      exitCode: 1,
    });
  });

  it("allows an existing parent with no children", async () => {
    server.use(
      api.operation(() =>
        HttpResponse.json({
          data: {
            [parent]: {
              [child]: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
            },
          },
        }),
      ),
    );
    await expect(command.run(args)).resolves.toBeUndefined();
  });
});
