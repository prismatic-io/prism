import { Errors } from "incur";
import {
  GetComponentMemberDocument as GET_COMPONENT_MEMBER,
  type GetComponentMemberQuery,
} from "../../graphql/components/getComponentMember.generated.js";
import {
  InspectComponentDocument as INSPECT_COMPONENT,
  type InspectComponentQuery,
} from "../../graphql/components/inspectComponent.generated.js";
import {
  ListActionInputFieldsDocument as LIST_ACTION_INPUT_FIELDS,
  type ListActionInputFieldsQuery,
} from "../../graphql/components/listActionInputFields.generated.js";
import {
  ListComponentConnectionsDocument as LIST_COMPONENT_CONNECTIONS,
  type ListComponentConnectionsQuery,
} from "../../graphql/components/listComponentConnections.generated.js";
import {
  ListComponentMembersDocument as LIST_COMPONENT_MEMBERS,
  type ListComponentMembersQuery,
} from "../../graphql/components/listComponentMembers.generated.js";
import {
  ListComponentVersionsDocument as LIST_COMPONENT_VERSIONS,
  type ListComponentVersionsQuery,
} from "../../graphql/components/listComponentVersions.generated.js";
import {
  SearchCatalogDocument as SEARCH_CATALOG,
  type SearchCatalogQuery,
} from "../../graphql/components/searchCatalog.generated.js";
import { gqlRequest } from "../../graphql.js";
import { collectPages, type PageInfo } from "../pagination.js";

export type MemberKind = "action" | "trigger" | "dataSource";
export type SearchKind = MemberKind | "component";

export interface ComponentSelector {
  key: string;
  public?: boolean;
  version?: number;
}

export interface ComponentIdentity {
  id: string;
  key: string;
  public: boolean;
  versionNumber: number;
}

type FilterExpression = [string, ...unknown[]];

const memberFlags: Record<MemberKind, { isTrigger: boolean; isDataSource: boolean }> = {
  action: { isTrigger: false, isDataSource: false },
  trigger: { isTrigger: true, isDataSource: false },
  dataSource: { isTrigger: false, isDataSource: true },
};

const memberListFlags: Record<
  MemberKind,
  { isTrigger: boolean | null; isDataSource: boolean | null }
> = {
  action: { isTrigger: false, isDataSource: false },
  trigger: { isTrigger: true, isDataSource: null },
  dataSource: { isTrigger: null, isDataSource: true },
};

const memberLabels: Record<MemberKind, string> = {
  action: "action",
  trigger: "trigger",
  dataSource: "data source",
};

export const memberFilter = (kind: MemberKind): FilterExpression => [
  "and",
  ["equal", "isTrigger", memberFlags[kind].isTrigger],
  ["equal", "isDataSource", memberFlags[kind].isDataSource],
];

export const memberKindOf = (member: { isTrigger: boolean; isDataSource: boolean }): MemberKind => {
  if (member.isTrigger) return "trigger";
  if (member.isDataSource) return "dataSource";
  return "action";
};

const describeSelector = ({ key, public: isPublic, version }: ComponentSelector) => {
  const visibility = isPublic === undefined ? "" : isPublic ? "public " : "private ";
  const suffix = version === undefined ? "" : ` version ${version}`;
  return `${visibility}component '${key}'${suffix}`;
};

export const selectorVariables = ({ key, public: isPublic, version }: ComponentSelector) => ({
  key,
  public: isPublic ?? null,
  versionNumber: version ?? null,
  allVersions: version !== undefined,
});

export function pickComponent<T extends ComponentIdentity>(
  nodes: T[],
  selector: ComponentSelector,
): T {
  const visibilities = new Set(nodes.map((node) => node.public));
  if (visibilities.size > 1)
    throw new Errors.IncurError({
      code: "COMPONENT_AMBIGUOUS",
      exitCode: 1,
      retryable: false,
      message: `Both a public and a private component use the key '${selector.key}'.`,
      hint: "Pass --public or --private to choose one.",
    });
  const [node] = nodes;
  if (!node)
    throw new Errors.IncurError({
      code: selector.version === undefined ? "COMPONENT_NOT_FOUND" : "COMPONENT_VERSION_NOT_FOUND",
      exitCode: 1,
      retryable: false,
      message: `No ${describeSelector(selector)} was found.`,
      hint: "Run 'prism components search <terms>' or 'prism components list' to find component keys.",
    });
  return node;
}

const memberNotFound = (selector: ComponentSelector, kind: MemberKind, memberKey: string) =>
  new Errors.IncurError({
    code: "COMPONENT_MEMBER_NOT_FOUND",
    exitCode: 1,
    retryable: false,
    message: `No ${memberLabels[kind]} '${memberKey}' exists on ${describeSelector(selector)}.`,
    hint: `Run 'prism components ${kind === "dataSource" ? "data-sources" : `${kind}s`} list ${selector.key}' to see the available keys.`,
  });

export type SearchResultNode = SearchCatalogQuery["componentActionSearchResults"][number];
export type SearchRow = {
  kind: SearchKind;
  id: string;
  key: string;
  label: string;
  description: string;
  componentKey: string;
  componentLabel: string;
  componentVersion: number;
  public: boolean;
  category: string | null;
  dataSourceType: string | null;
};

export interface SearchOptions {
  terms: string;
  kind?: SearchKind;
  public?: boolean;
  category?: string;
  contextStableKey?: string;
}

const andAll = (expressions: Array<FilterExpression | undefined>): FilterExpression | undefined => {
  const present = expressions.filter((e): e is FilterExpression => e !== undefined);
  if (present.length === 0) return undefined;
  if (present.length === 1) return present[0];
  return ["and", ...present];
};

export async function searchCatalog(options: SearchOptions): Promise<SearchRow[]> {
  const { terms, kind, category, contextStableKey } = options;
  const componentFilter = andAll([
    options.public === undefined ? undefined : ["equal", "public", options.public],
    category === undefined ? undefined : ["equal", "category", category],
  ]);
  const actionFilter = kind && kind !== "component" ? memberFilter(kind) : undefined;
  const { componentActionSearchResults }: SearchCatalogQuery = await gqlRequest({
    document: SEARCH_CATALOG,
    variables: {
      searchTerms: terms,
      componentFilterQuery: componentFilter ? JSON.stringify(componentFilter) : null,
      actionFilterQuery: actionFilter ? JSON.stringify(actionFilter) : null,
      contextStableKey: contextStableKey ?? null,
    },
  });
  const rows: SearchRow[] = [];
  for (const node of componentActionSearchResults) {
    if (!node) continue;
    if (node.__typename === "Component") {
      if (kind && kind !== "component") continue;
      rows.push({
        kind: "component",
        id: node.id,
        key: node.key,
        label: node.label,
        description: node.description,
        componentKey: node.key,
        componentLabel: node.label,
        componentVersion: node.versionNumber,
        public: node.public,
        category: node.category ?? null,
        dataSourceType: null,
      });
      continue;
    }
    if (kind === "component") continue;
    const component = node.component;
    if (!component) continue;
    if (options.public !== undefined && component.public !== options.public) continue;
    if (category !== undefined && component.category !== category) continue;
    rows.push({
      kind: memberKindOf(node),
      id: node.id,
      key: node.key,
      label: node.label,
      description: node.description,
      componentKey: component.key,
      componentLabel: component.label,
      componentVersion: component.versionNumber,
      public: component.public,
      category: component.category ?? null,
      dataSourceType: node.dataSourceType ?? null,
    });
  }
  return rows;
}

type InspectNode = InspectComponentQuery["components"]["nodes"][number];
type MemberSummary = InspectNode["actions"]["nodes"][number];
type DataSourceSummary = InspectNode["dataSources"]["nodes"][number];
type MemberNode =
  ListComponentMembersQuery["components"]["nodes"][number]["actions"]["nodes"][number];

export interface MemberListOptions {
  kind: MemberKind;
  dataSourceType?: string;
  search?: string;
  after?: string | null;
  first?: number;
  all: boolean;
}

export interface MemberList {
  component: ComponentIdentity;
  items: MemberNode[];
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

export async function listMembers(
  selector: ComponentSelector,
  options: MemberListOptions,
): Promise<MemberList> {
  let component: ComponentIdentity | undefined;
  let totalCount = 0;
  const page = await collectPages(
    async (after) => {
      const { components }: ListComponentMembersQuery = await gqlRequest({
        document: LIST_COMPONENT_MEMBERS,
        variables: {
          ...selectorVariables(selector),
          ...memberListFlags[options.kind],
          dataSourceType: options.dataSourceType?.toLowerCase() ?? null,
          search: options.search ?? null,
          after,
          first: options.first ?? null,
        },
      });
      const node = pickComponent(components.nodes, selector);
      component = {
        id: node.id,
        key: node.key,
        public: node.public,
        versionNumber: node.versionNumber,
      };
      totalCount = node.actions.totalCount;
      return node.actions;
    },
    { after: options.after, all: options.all },
  );
  if (!component) throw memberNotFound(selector, options.kind, "");
  return { component, items: page.items, totalCount, pageInfo: page.pageInfo };
}

async function collectRemaining<T>(
  selector: ComponentSelector,
  kind: MemberKind,
  page: { nodes: T[]; pageInfo: PageInfo },
  project: (member: MemberNode) => T,
): Promise<T[]> {
  if (!page.pageInfo.hasNextPage) return page.nodes;
  const rest = await listMembers(selector, {
    kind,
    after: page.pageInfo.endCursor ?? null,
    first: 100,
    all: true,
  });
  return [...page.nodes, ...rest.items.map(project)];
}

export type ComponentInspection = Omit<
  InspectNode,
  "actions" | "triggers" | "dataSources" | "connections"
> & {
  counts: { actions: number; triggers: number; dataSources: number; connections: number };
  actions: MemberSummary[];
  triggers: MemberSummary[];
  dataSources: DataSourceSummary[];
  connections: InspectNode["connections"]["nodes"];
};

export async function inspectComponent(selector: ComponentSelector): Promise<ComponentInspection> {
  const { components }: InspectComponentQuery = await gqlRequest({
    document: INSPECT_COMPONENT,
    variables: selectorVariables(selector),
  });
  const node = pickComponent(components.nodes, selector);
  const pinned: ComponentSelector = {
    key: node.key,
    public: node.public,
    version: node.versionNumber,
  };
  const summary = ({ id, key, label, description }: MemberNode): MemberSummary => ({
    id,
    key,
    label,
    description,
  });
  const { actions, triggers, dataSources, connections, ...identity } = node;
  return {
    ...identity,
    counts: {
      actions: actions.totalCount,
      triggers: triggers.totalCount,
      dataSources: dataSources.totalCount,
      connections: connections.totalCount,
    },
    actions: await collectRemaining(pinned, "action", actions, summary),
    triggers: await collectRemaining(pinned, "trigger", triggers, summary),
    dataSources: await collectRemaining(pinned, "dataSource", dataSources, (member) => ({
      ...summary(member),
      dataSourceType: member.dataSourceType,
    })),
    connections: connections.nodes,
  };
}

type InputFieldRow = ListActionInputFieldsQuery["actionInputFields"]["nodes"][number];
type ConnectionInputRow =
  ListComponentConnectionsQuery["components"]["nodes"][number]["connections"]["nodes"][number]["inputs"]["nodes"][number];
type InputRow = Omit<InputFieldRow, "action" | "dataSource"> & {
  dataSource?: InputFieldRow["dataSource"];
};

export type InputField = Omit<InputRow, "parentId"> & { inputs: InputField[] };

export function buildInputTree<
  T extends { id: string; parentId?: string | null; order?: number | null },
>(
  rows: T[],
): Array<Omit<T, "parentId"> & { inputs: Array<Omit<T, "parentId"> & { inputs: unknown[] }> }> {
  type Node = Omit<T, "parentId"> & { inputs: Node[] };
  const nodes = new Map<string, Node>();
  const ordered = [...rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const row of ordered) {
    const { parentId: _parentId, ...rest } = row;
    nodes.set(row.id, { ...rest, inputs: [] } as Node);
  }
  const roots: Node[] = [];
  for (const row of ordered) {
    const node = nodes.get(row.id);
    if (!node) continue;
    const parent = row.parentId ? nodes.get(row.parentId) : undefined;
    if (parent) parent.inputs.push(node);
    else roots.push(node);
  }
  return roots as ReturnType<typeof buildInputTree<T>>;
}

async function fetchMemberInputs(
  component: ComponentIdentity,
  kind: MemberKind,
  memberKey: string,
): Promise<InputRow[]> {
  const selector = {
    componentKey: component.key,
    componentPublic: component.public,
    componentVersion: component.versionNumber,
    actionKey: memberKey,
    ...memberFlags[kind],
  };
  const { items } = await collectPages(
    async (after) => {
      const { actionInputFields }: ListActionInputFieldsQuery = await gqlRequest({
        document: LIST_ACTION_INPUT_FIELDS,
        variables: { actions: [selector], after, first: 100 },
      });
      return actionInputFields;
    },
    { all: true },
  );
  return items.map(({ action: _action, ...row }) => row);
}

type MemberDetailNode =
  GetComponentMemberQuery["components"]["nodes"][number]["actions"]["nodes"][number];

type MemberDetailBase = Omit<MemberDetailNode, "detailDataSource" | "examplePayload"> & {
  examplePayload: unknown;
  inputs: InputField[];
};

export type MemberDetail = MemberDetailBase & {
  kind: MemberKind;
  component: ComponentIdentity & { label: string };
  detailDataSource: MemberDetailBase | null;
};

const parseJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value ?? null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export async function getMember(
  selector: ComponentSelector,
  kind: MemberKind,
  memberKey: string,
): Promise<MemberDetail> {
  const { components }: GetComponentMemberQuery = await gqlRequest({
    document: GET_COMPONENT_MEMBER,
    variables: { ...selectorVariables(selector), memberKey, ...memberFlags[kind] },
  });
  const node = pickComponent(components.nodes, selector);
  const component = {
    id: node.id,
    key: node.key,
    label: node.label,
    public: node.public,
    versionNumber: node.versionNumber,
  };
  const [member] = node.actions.nodes;
  if (!member) throw memberNotFound(selector, kind, memberKey);
  const { detailDataSource, ...detail } = member;
  const inputs = buildInputTree(
    await fetchMemberInputs(component, kind, memberKey),
  ) as InputField[];
  const detailInputs = detailDataSource
    ? (buildInputTree(
        await fetchMemberInputs(component, "dataSource", detailDataSource.key),
      ) as InputField[])
    : [];
  return {
    ...detail,
    kind,
    component,
    examplePayload: parseJson(detail.examplePayload),
    inputs,
    detailDataSource: detailDataSource
      ? {
          ...detailDataSource,
          examplePayload: parseJson(detailDataSource.examplePayload),
          inputs: detailInputs,
        }
      : null,
  };
}

type ConnectionNode =
  ListComponentConnectionsQuery["components"]["nodes"][number]["connections"]["nodes"][number];

export type ConnectionDetail = Omit<ConnectionNode, "inputs" | "templates"> & {
  inputs: InputField[];
  templates: ConnectionNode["templates"]["nodes"];
};

export interface ConnectionList {
  component: ComponentIdentity & { label: string };
  items: ConnectionDetail[];
}

export async function listConnections(
  selector: ComponentSelector,
  connectionKey?: string,
): Promise<ConnectionList> {
  const fetch = async (inputsAfter: string | null) => {
    const { components }: ListComponentConnectionsQuery = await gqlRequest({
      document: LIST_COMPONENT_CONNECTIONS,
      variables: {
        ...selectorVariables(selector),
        connectionKey: connectionKey ?? null,
        inputsAfter,
      },
    });
    return pickComponent(components.nodes, selector);
  };
  const node = await fetch(null);
  const component = {
    id: node.id,
    key: node.key,
    label: node.label,
    public: node.public,
    versionNumber: node.versionNumber,
  };
  const items: ConnectionDetail[] = [];
  for (const connection of node.connections.nodes) {
    let rows: ConnectionInputRow[] = connection.inputs.nodes;
    let pageInfo = connection.inputs.pageInfo;
    while (pageInfo.hasNextPage && pageInfo.endCursor) {
      const refreshed = await fetch(pageInfo.endCursor);
      const match = refreshed.connections.nodes.find(({ id }) => id === connection.id);
      if (!match) break;
      rows = [...rows, ...match.inputs.nodes];
      pageInfo = match.inputs.pageInfo;
    }
    const { inputs: _inputs, templates, ...rest } = connection;
    items.push({
      ...rest,
      inputs: buildInputTree(rows) as InputField[],
      templates: templates.nodes,
    });
  }
  if (connectionKey !== undefined && items.length === 0)
    throw new Errors.IncurError({
      code: "COMPONENT_CONNECTION_NOT_FOUND",
      exitCode: 1,
      retryable: false,
      message: `No connection '${connectionKey}' exists on ${describeSelector(selector)}.`,
      hint: `Run 'prism components connections list ${selector.key}' to see the available keys.`,
    });
  return { component, items };
}

type VersionNode =
  ListComponentVersionsQuery["components"]["nodes"][number]["versions"] extends infer V
    ? V extends { nodes: Array<infer N> }
      ? N
      : never
    : never;

export interface VersionList {
  component: ComponentIdentity & { versionSequenceId: string | null };
  items: VersionNode[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

export async function listVersions(
  selector: Omit<ComponentSelector, "version">,
  options: { after?: string | null; first?: number; all: boolean },
): Promise<VersionList> {
  let component: VersionList["component"] | undefined;
  const page = await collectPages(
    async (after) => {
      const { components }: ListComponentVersionsQuery = await gqlRequest({
        document: LIST_COMPONENT_VERSIONS,
        variables: {
          key: selector.key,
          public: selector.public ?? null,
          after,
          first: options.first ?? null,
        },
      });
      const node = pickComponent(components.nodes, selector);
      component = {
        id: node.id,
        key: node.key,
        public: node.public,
        versionNumber: node.versionNumber,
        versionSequenceId: node.versionSequenceId ?? null,
      };
      return node.versions ?? { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
    },
    { after: options.after, all: options.all },
  );
  if (!component) throw pickComponent([], selector);
  return { component, items: page.items, pageInfo: page.pageInfo };
}

export async function identifyComponent(
  selector: Omit<ComponentSelector, "version">,
): Promise<ComponentIdentity> {
  const { components }: ListComponentVersionsQuery = await gqlRequest({
    document: LIST_COMPONENT_VERSIONS,
    variables: { key: selector.key, public: selector.public ?? null, after: null, first: 1 },
  });
  const { id, key, public: isPublic, versionNumber } = pickComponent(components.nodes, selector);
  return { id, key, public: isPublic, versionNumber };
}
