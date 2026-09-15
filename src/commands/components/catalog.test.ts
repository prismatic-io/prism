import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { TEST_PRISMATIC_URL } from "../../../vitest.setup.js";
import { runCommand } from "../../test-command.js";
import ActionsListCommand from "./actions/list.js";
import ConnectionsListCommand from "./connections/list.js";
import GetCommand from "./get.js";
import SearchCommand from "./search.js";

const component = {
  id: "component-1",
  key: "slack",
  label: "Slack",
  public: true,
  versionNumber: 3,
};
const requests: Array<{ operation: string; variables: Record<string, unknown> }> = [];
const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);
const server = setupServer(
  api.query("searchCatalog", ({ variables }) => {
    requests.push({ operation: "searchCatalog", variables });
    return HttpResponse.json({
      data: {
        componentActionSearchResults: [
          {
            __typename: "Action",
            id: "action-1",
            key: "postMessage",
            label: "Post Message",
            description: "Post a message",
            isTrigger: false,
            isDataSource: false,
            dataSourceType: null,
            component: { ...component, category: "Application Connectors" },
          },
        ],
      },
    });
  }),
  api.query("listComponentMembers", ({ variables }) => {
    requests.push({ operation: "listComponentMembers", variables });
    const second = variables.after === "cursor-1";
    return HttpResponse.json({
      data: {
        components: {
          nodes: [
            {
              ...component,
              actions: {
                totalCount: 2,
                nodes: [
                  {
                    id: second ? "action-2" : "action-1",
                    key: second ? "second" : "first",
                    label: second ? "Second" : "First",
                    description: "",
                    important: false,
                    isTrigger: false,
                    isCommonTrigger: null,
                    isPollingTrigger: null,
                    scheduleSupport: null,
                    synchronousResponseSupport: null,
                    batchSupport: "INVALID",
                    isDataSource: false,
                    dataSourceType: null,
                    isDetailDataSource: false,
                    detailDataSource: null,
                    allowsBranching: false,
                    terminateExecution: false,
                  },
                ],
                pageInfo: second
                  ? { hasNextPage: false, endCursor: null }
                  : { hasNextPage: true, endCursor: "cursor-1" },
              },
            },
          ],
        },
      },
    });
  }),
  api.query("inspectComponent", ({ variables }) => {
    requests.push({ operation: "inspectComponent", variables });
    return HttpResponse.json({ data: { components: { nodes: [] } } });
  }),
  api.query("listComponentConnections", ({ variables }) => {
    requests.push({ operation: "listComponentConnections", variables });
    return HttpResponse.json({
      data: {
        components: {
          nodes: [
            {
              ...component,
              connections: {
                nodes: [
                  {
                    id: "connection-1",
                    key: "oauth2",
                    label: "OAuth 2.0",
                    default: true,
                    order: 0,
                    comments: null,
                    oauth2Type: "AUTHORIZATION_CODE",
                    onPremiseAvailable: false,
                    inputs: {
                      nodes: [
                        { id: "i1", key: "clientId", required: true, parentId: null, order: 0 },
                        { id: "i2", key: "scopes", required: false, parentId: null, order: 1 },
                      ],
                      pageInfo: { hasNextPage: false, endCursor: null },
                    },
                    templates: { nodes: [] },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  requests.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

describe("components:search", () => {
  it("returns typed catalog rows and forwards the kind filter", async () => {
    const result = await runCommand(SearchCommand, [
      "slack message",
      "--agent",
      "--kind",
      "actions",
    ]);
    expect(result).toEqual({
      items: [
        {
          kind: "action",
          componentKey: "slack",
          componentLabel: "Slack",
          componentVersion: 3,
          public: true,
          key: "postMessage",
          label: "Post Message",
          description: "Post a message",
          category: "Application Connectors",
          dataSourceType: null,
          id: "action-1",
        },
      ],
    });
    expect(requests[0].variables).toMatchObject({
      searchTerms: "slack message",
      actionFilterQuery: JSON.stringify([
        "and",
        ["equal", "isTrigger", false],
        ["equal", "isDataSource", false],
      ]),
    });
  });
});

describe("components:actions:list", () => {
  it("returns one resumable page in agent mode and stamps the resolved component", async () => {
    const result = await runCommand(ActionsListCommand, ["slack", "--agent", "--first", "1"]);
    expect(result).toMatchObject({
      items: [{ key: "first", componentKey: "slack", componentVersion: 3, public: true }],
      pageInfo: { hasNextPage: true, endCursor: "cursor-1" },
    });
    expect(requests.map(({ variables }) => variables.after)).toEqual([null]);
  });

  it("fetches every page with --all and pins a version when asked", async () => {
    const result = await runCommand(ActionsListCommand, [
      "slack",
      "--agent",
      "--all",
      "--version",
      "2",
      "--private",
    ]);
    expect(result).toMatchObject({
      items: [{ key: "first" }, { key: "second" }],
      pageInfo: { hasNextPage: false, endCursor: null },
    });
    expect(requests[0].variables).toMatchObject({
      key: "slack",
      public: false,
      versionNumber: 2,
      allVersions: true,
    });
    expect(requests[1].variables).toMatchObject({ after: "cursor-1" });
  });
});

describe("components:get", () => {
  it("reports a typed failure when the component does not exist", async () => {
    await expect(runCommand(GetCommand, ["missing", "--agent"])).rejects.toMatchObject({
      code: "COMPONENT_NOT_FOUND",
      message: "No component 'missing' was found.",
    });
  });
});

describe("components:connections:list", () => {
  it("summarizes required inputs per connection", async () => {
    const result = await runCommand(ConnectionsListCommand, ["slack", "--agent"]);
    expect(result).toMatchObject({
      items: [
        {
          key: "oauth2",
          isDefault: true,
          oauth2Type: "AUTHORIZATION_CODE",
          requiredInputs: "clientId",
          inputs: "clientId, scopes",
          componentKey: "slack",
        },
      ],
    });
  });
});
