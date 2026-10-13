import type { ComponentIdentity, listMembers } from "../../utils/component/catalog.js";
import type { ColumnsConfig } from "../../utils/table.js";

export type MemberRow = Awaited<ReturnType<typeof listMembers>>["items"][number];

export const memberColumns = (
  component: ComponentIdentity,
  extra: ColumnsConfig<MemberRow>,
): ColumnsConfig<MemberRow> => ({
  id: { minWidth: 8, extended: true },
  key: { minWidth: 10 },
  label: {},
  description: {},
  ...extra,
  componentKey: { extended: true, get: () => component.key },
  componentVersion: { extended: true, get: () => component.versionNumber },
  public: { extended: true, get: () => component.public },
});

// Keep script-facing tables stable while exposing catalog details through agent output
// and explicit --columns selections.
export const compatibleMemberColumns = (
  component: ComponentIdentity,
  extra: ColumnsConfig<MemberRow>,
  agent: boolean,
): ColumnsConfig<MemberRow> => {
  const legacy: ColumnsConfig<MemberRow> = {
    id: { minWidth: 8, extended: true },
    key: { minWidth: 10, extended: true },
    label: {},
    description: {},
    ...(extra.dataSourceType ? { dataSourceType: extra.dataSourceType } : {}),
    ...(extra.detailDataSource
      ? {
          detailDataSource: {
            extended: true,
            header: "Detail Data Source",
            get: (row: MemberRow) => row.detailDataSource?.label ?? "",
          },
        }
      : {}),
    componentid: { extended: true, get: () => component.id },
    componentkey: { extended: true, get: () => component.key },
  };
  const modern = memberColumns(component, extra);
  const primary = agent ? modern : legacy;
  const secondary = agent ? legacy : modern;
  return {
    ...primary,
    ...Object.fromEntries(
      Object.entries(secondary)
        .filter(([key]) => !(key in primary))
        .map(([key, column]) => [key, { ...column, hidden: true }]),
    ),
  };
};
