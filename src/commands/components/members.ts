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
