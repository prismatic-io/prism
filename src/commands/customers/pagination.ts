import { Errors } from "incur";
import type { PaginationFlags, TableFlags } from "../../utils/table.js";

export function nextPageOptions(flags: PaginationFlags & TableFlags, after: string) {
  return {
    after,
    ...(flags.first !== undefined ? { first: flags.first } : {}),
    ...(flags.filter !== undefined ? { filter: flags.filter } : {}),
    ...(flags.sort !== undefined ? { sort: flags.sort } : {}),
    ...(flags.columns !== undefined ? { columns: flags.columns } : {}),
  };
}

export function checkPageCursor(
  pageInfo: { hasNextPage: boolean; endCursor?: string | null },
  seen: Set<string>,
) {
  if (!pageInfo.hasNextPage) return;
  const cursor = pageInfo.endCursor;
  if (!cursor || seen.has(cursor))
    throw new Errors.IncurError({
      code: "PAGINATION_ERROR",
      exitCode: 1,
      retryable: false,
      message:
        "The API reported another page without a new cursor. Listing stopped to avoid repeating results.",
    });
  seen.add(cursor);
}
