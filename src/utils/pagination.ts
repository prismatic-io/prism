import { Errors } from "incur";
import type { PaginationFlags, TableFlags } from "./table.js";

export type PageInfo = { hasNextPage: boolean; endCursor?: string | null };

export function nextPageOptions(flags: PaginationFlags & TableFlags, after: string) {
  return {
    after,
    ...(flags.first !== undefined ? { first: flags.first } : {}),
    ...(flags.filter !== undefined ? { filter: flags.filter } : {}),
    ...(flags.sort !== undefined ? { sort: flags.sort } : {}),
    ...(flags.columns !== undefined ? { columns: flags.columns } : {}),
  };
}

export function checkPageCursor(pageInfo: PageInfo, seen: Set<string>) {
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

export async function collectPages<T>(
  fetchPage: (after: string | null) => Promise<{ nodes: T[]; pageInfo: PageInfo }>,
  options: { after?: string | null; all: boolean },
): Promise<{ items: T[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } }> {
  let items: T[] = [];
  let cursor: string | null = options.after ?? null;
  const seen = new Set<string>(cursor ? [cursor] : []);
  let pageInfo: { hasNextPage: boolean; endCursor: string | null } = {
    hasNextPage: false,
    endCursor: null,
  };
  let hasNextPage = true;
  while (hasNextPage) {
    const page = await fetchPage(cursor);
    items = [...items, ...page.nodes];
    checkPageCursor(page.pageInfo, seen);
    pageInfo = {
      hasNextPage: page.pageInfo.hasNextPage,
      endCursor: page.pageInfo.endCursor ?? null,
    };
    cursor = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage && options.all;
  }
  return { items, pageInfo };
}

export function nextPageCta(
  command: string,
  args: Record<string, string> | undefined,
  flags: PaginationFlags & TableFlags,
  pageInfo: { hasNextPage: boolean; endCursor: string | null },
  agent: boolean,
  description: string,
) {
  if (!agent || !pageInfo.hasNextPage || !pageInfo.endCursor) return undefined;
  return {
    cta: {
      commands: [
        {
          command,
          description,
          ...(args ? { args } : {}),
          options: nextPageOptions(flags, pageInfo.endCursor),
        },
      ],
    },
  };
}
