import { describe, expect, it, vi } from "vitest";
import { gqlRequest } from "../../graphql.js";
import {
  buildInputTree,
  getMember,
  inspectComponent,
  listConnections,
  listMembers,
  pickComponent,
  searchCatalog,
} from "./catalog.js";

vi.mock(import("../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: vi.fn(),
}));

const component = { id: "component-1", key: "slack", public: true, versionNumber: 3 };
const request = vi.mocked(gqlRequest);
const variablesOf = (call: number) =>
  (request.mock.calls[call]?.[0] as { variables: Record<string, unknown> }).variables;

describe("pickComponent", () => {
  it("returns the single matching component", () => {
    expect(pickComponent([component], { key: "slack" })).toBe(component);
  });

  it("fails when both visibilities share a key", () => {
    expect(() =>
      pickComponent([component, { ...component, public: false }], { key: "slack" }),
    ).toThrowError(expect.objectContaining({ code: "COMPONENT_AMBIGUOUS" }));
  });

  it("distinguishes a missing component from a missing version", () => {
    expect(() => pickComponent([], { key: "slack" })).toThrowError(
      expect.objectContaining({ code: "COMPONENT_NOT_FOUND" }),
    );
    expect(() => pickComponent([], { key: "slack", version: 9 })).toThrowError(
      expect.objectContaining({ code: "COMPONENT_VERSION_NOT_FOUND" }),
    );
  });
});

describe("searchCatalog", () => {
  const results = [
    {
      __typename: "Component",
      id: "component-1",
      key: "slack",
      label: "Slack",
      description: "Chat",
      public: true,
      category: "Application Connectors",
      versionNumber: 3,
    },
    {
      __typename: "Action",
      id: "action-1",
      key: "postMessage",
      label: "Post Message",
      description: "Post",
      isTrigger: false,
      isDataSource: false,
      dataSourceType: null,
      component: {
        id: "component-1",
        key: "slack",
        label: "Slack",
        public: true,
        category: "Application Connectors",
        versionNumber: 3,
      },
    },
    {
      __typename: "Action",
      id: "trigger-1",
      key: "webhook",
      label: "Webhook",
      description: "Fires",
      isTrigger: true,
      isDataSource: false,
      dataSourceType: null,
      component: {
        id: "component-2",
        key: "acme",
        label: "Acme",
        public: false,
        category: null,
        versionNumber: 1,
      },
    },
  ];

  it("flattens the Designer search union into typed rows", async () => {
    request.mockResolvedValueOnce({ componentActionSearchResults: results } as never);
    const rows = await searchCatalog({ terms: "slack" });
    expect(rows.map(({ kind, key, componentKey }) => [kind, key, componentKey])).toEqual([
      ["component", "slack", "slack"],
      ["action", "postMessage", "slack"],
      ["trigger", "webhook", "acme"],
    ]);
    expect(variablesOf(0)).toEqual({
      searchTerms: "slack",
      componentFilterQuery: null,
      actionFilterQuery: null,
      contextStableKey: null,
    });
  });

  it("sends the Designer filter trees and drops rows outside the requested kind", async () => {
    request.mockResolvedValueOnce({ componentActionSearchResults: results } as never);
    const rows = await searchCatalog({ terms: "webhook", kind: "trigger", public: false });
    expect(rows.map(({ key }) => key)).toEqual(["webhook"]);
    expect(variablesOf(0)).toMatchObject({
      componentFilterQuery: JSON.stringify(["equal", "public", false]),
      actionFilterQuery: JSON.stringify([
        "and",
        ["equal", "isTrigger", true],
        ["equal", "isDataSource", false],
      ]),
    });
  });

  it("keeps only component rows for a component search", async () => {
    request.mockResolvedValueOnce({ componentActionSearchResults: results } as never);
    const rows = await searchCatalog({ terms: "slack", kind: "component" });
    expect(rows.map(({ kind }) => kind)).toEqual(["component"]);
  });
});

describe("buildInputTree", () => {
  it("nests structured inputs under their parents in declared order", () => {
    const tree = buildInputTree([
      { id: "b", parentId: null, order: 1, key: "b" },
      { id: "a", parentId: null, order: 0, key: "a" },
      { id: "a2", parentId: "a", order: 1, key: "a2" },
      { id: "a1", parentId: "a", order: 0, key: "a1" },
      { id: "a1x", parentId: "a1", order: 0, key: "a1x" },
    ]);
    expect(tree).toEqual([
      {
        id: "a",
        order: 0,
        key: "a",
        inputs: [
          {
            id: "a1",
            order: 0,
            key: "a1",
            inputs: [{ id: "a1x", order: 0, key: "a1x", inputs: [] }],
          },
          { id: "a2", order: 1, key: "a2", inputs: [] },
        ],
      },
      { id: "b", order: 1, key: "b", inputs: [] },
    ]);
  });
});

describe("listMembers", () => {
  const page = (keys: string[], endCursor: string | null) => ({
    components: {
      nodes: [
        {
          ...component,
          actions: {
            totalCount: 3,
            nodes: keys.map((key) => ({ key })),
            pageInfo: { hasNextPage: endCursor !== null, endCursor },
          },
        },
      ],
    },
  });

  it("returns one resumable page unless every page is requested", async () => {
    request.mockResolvedValueOnce(page(["a", "b"], "cursor-1") as never);
    const single = await listMembers({ key: "slack" }, { kind: "action", first: 2, all: false });
    expect(single.items.map(({ key }) => key)).toEqual(["a", "b"]);
    expect(single.pageInfo).toEqual({ hasNextPage: true, endCursor: "cursor-1" });
    expect(single.totalCount).toBe(3);
    expect(variablesOf(0)).toMatchObject({
      key: "slack",
      public: null,
      versionNumber: null,
      allVersions: false,
      isTrigger: false,
      isDataSource: false,
      first: 2,
      after: null,
    });

    request.mockResolvedValueOnce(page(["a", "b"], "cursor-1") as never);
    request.mockResolvedValueOnce(page(["c"], null) as never);
    const every = await listMembers(
      { key: "slack", public: true, version: 2 },
      { kind: "trigger", all: true },
    );
    expect(every.items.map(({ key }) => key)).toEqual(["a", "b", "c"]);
    expect(variablesOf(1)).toMatchObject({
      public: true,
      versionNumber: 2,
      allVersions: true,
      isTrigger: true,
      isDataSource: null,
    });
    expect(variablesOf(2)).toMatchObject({ after: "cursor-1" });
  });
});

describe("getMember", () => {
  const detail = {
    id: "action-1",
    key: "postMessage",
    label: "Post Message",
    isTrigger: false,
    isDataSource: false,
    examplePayload: '{"data":{"ok":true}}',
    detailDataSource: null,
  };

  it("pins the resolved version when it fetches input fields and parses the example payload", async () => {
    request.mockResolvedValueOnce({
      components: { nodes: [{ ...component, label: "Slack", actions: { nodes: [detail] } }] },
    } as never);
    request.mockResolvedValueOnce({
      actionInputFields: {
        nodes: [
          {
            id: "input-1",
            key: "message",
            parentId: null,
            order: 0,
            action: { id: "action-1", key: "postMessage" },
            dataSource: null,
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    } as never);

    const member = await getMember({ key: "slack" }, "action", "postMessage");
    expect(member.kind).toBe("action");
    expect(member.component).toEqual({ ...component, label: "Slack" });
    expect(member.examplePayload).toEqual({ data: { ok: true } });
    expect(member.inputs).toEqual([
      { id: "input-1", key: "message", order: 0, dataSource: null, inputs: [] },
    ]);
    expect(variablesOf(0)).toMatchObject({
      memberKey: "postMessage",
      isTrigger: false,
      isDataSource: false,
    });
    expect(variablesOf(1)).toMatchObject({
      actions: [
        {
          componentKey: "slack",
          componentPublic: true,
          componentVersion: 3,
          actionKey: "postMessage",
          isTrigger: false,
          isDataSource: false,
        },
      ],
      first: 100,
    });
  });

  it("fails with a typed error when the member does not exist", async () => {
    request.mockResolvedValueOnce({
      components: { nodes: [{ ...component, label: "Slack", actions: { nodes: [] } }] },
    } as never);
    await expect(getMember({ key: "slack" }, "dataSource", "missing")).rejects.toMatchObject({
      code: "COMPONENT_MEMBER_NOT_FOUND",
      message: "No data source 'missing' exists on component 'slack'.",
    });
  });
});

describe("inspectComponent", () => {
  it("summarizes counts and pages long member lists to completion", async () => {
    const members = (keys: string[], endCursor: string | null) => ({
      totalCount: keys.length + (endCursor ? 1 : 0),
      nodes: keys.map((key) => ({ id: key, key, label: key, description: "" })),
      pageInfo: { hasNextPage: endCursor !== null, endCursor },
    });
    request.mockResolvedValueOnce({
      components: {
        nodes: [
          {
            ...component,
            label: "Slack",
            actions: members(["a"], "cursor-1"),
            triggers: members([], null),
            dataSources: members(["ds"], null),
            connections: { totalCount: 1, nodes: [{ id: "c", key: "oauth2" }] },
          },
        ],
      },
    } as never);
    request.mockResolvedValueOnce({
      components: {
        nodes: [
          {
            ...component,
            actions: {
              totalCount: 2,
              nodes: [{ id: "b", key: "b", label: "b", description: "", extra: true }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        ],
      },
    } as never);

    const inspection = await inspectComponent({ key: "slack" });
    expect(inspection.counts).toEqual({ actions: 2, triggers: 0, dataSources: 1, connections: 1 });
    expect(inspection.actions.map(({ key }) => key)).toEqual(["a", "b"]);
    expect(inspection.actions[1]).not.toHaveProperty("extra");
    expect(variablesOf(1)).toMatchObject({
      key: "slack",
      public: true,
      versionNumber: 3,
      allVersions: true,
      after: "cursor-1",
    });
  });
});

describe("listConnections", () => {
  const connection = (inputs: Array<{ id: string; key: string }>, endCursor: string | null) => ({
    id: "connection-1",
    key: "oauth2",
    inputs: {
      nodes: inputs.map((input) => ({ ...input, parentId: null, order: 0 })),
      pageInfo: { hasNextPage: endCursor !== null, endCursor },
    },
    templates: { nodes: [{ id: "template-1", name: "Default" }] },
  });
  const response = (inputs: Array<{ id: string; key: string }>, endCursor: string | null) => ({
    components: {
      nodes: [
        { ...component, label: "Slack", connections: { nodes: [connection(inputs, endCursor)] } },
      ],
    },
  });

  it("merges overflowing input pages into one tree", async () => {
    request.mockResolvedValueOnce(response([{ id: "i1", key: "clientId" }], "cursor-1") as never);
    request.mockResolvedValueOnce(response([{ id: "i2", key: "clientSecret" }], null) as never);
    const { items } = await listConnections({ key: "slack" }, "oauth2");
    expect(items[0].inputs.map(({ key }) => key)).toEqual(["clientId", "clientSecret"]);
    expect(items[0].templates).toEqual([{ id: "template-1", name: "Default" }]);
    expect(variablesOf(1)).toMatchObject({ connectionKey: "oauth2", inputsAfter: "cursor-1" });
  });

  it("fails when the requested connection is missing", async () => {
    request.mockResolvedValueOnce({
      components: { nodes: [{ ...component, label: "Slack", connections: { nodes: [] } }] },
    } as never);
    await expect(listConnections({ key: "slack" }, "missing")).rejects.toMatchObject({
      code: "COMPONENT_CONNECTION_NOT_FOUND",
    });
  });
});
