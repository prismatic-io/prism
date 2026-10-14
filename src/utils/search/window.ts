import { Errors } from "incur";

export interface TimeWindow {
  start: Date;
  end: Date;
}

const unitMs: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export const DAY_MS = unitMs.d;
export const HOUR_MS = unitMs.h;
const RETENTION_MARGIN_MS = 5 * unitMs.m;

const invalidTime = (value: string) =>
  new Errors.IncurError({
    code: "INVALID_TIME",
    exitCode: 2,
    retryable: false,
    message: `Cannot parse time '${value}'.`,
    hint: "Use a relative duration such as 15m, 2h, 7d, or an ISO 8601 timestamp.",
  });

export function parseTime(value: string, now: Date): Date {
  const relative = /^(\d+)\s*([smhdw])$/i.exec(value.trim());
  if (relative)
    return new Date(now.getTime() - Number(relative[1]) * unitMs[relative[2].toLowerCase()]);
  const absolute = new Date(value);
  if (Number.isNaN(absolute.getTime())) throw invalidTime(value);
  return absolute;
}

export interface WindowLimits {
  maxAgeMs?: number;
  maxSpanMs?: number;
}

export function resolveWindow(
  input: { since?: string; until?: string },
  defaultSpanMs: number,
  limits: WindowLimits,
  now = new Date(),
): TimeWindow {
  const end = input.until ? parseTime(input.until, now) : now;
  let start = input.since ? parseTime(input.since, now) : new Date(end.getTime() - defaultSpanMs);
  if (limits.maxAgeMs !== undefined) {
    const earliest = now.getTime() - limits.maxAgeMs + RETENTION_MARGIN_MS;
    if (start.getTime() < earliest && now.getTime() - start.getTime() <= limits.maxAgeMs)
      start = new Date(earliest);
  }
  if (start >= end)
    throw new Errors.IncurError({
      code: "INVALID_TIME_WINDOW",
      exitCode: 2,
      retryable: false,
      message: "--since must be earlier than --until.",
    });
  if (limits.maxAgeMs !== undefined && now.getTime() - start.getTime() > limits.maxAgeMs)
    throw new Errors.IncurError({
      code: "TIME_WINDOW_TOO_OLD",
      exitCode: 2,
      retryable: false,
      message: `This stack keeps searchable data for ${Math.round(limits.maxAgeMs / DAY_MS)} days. --since is earlier than that.`,
    });
  if (limits.maxSpanMs !== undefined && end.getTime() - start.getTime() > limits.maxSpanMs)
    throw new Errors.IncurError({
      code: "TIME_WINDOW_TOO_WIDE",
      exitCode: 2,
      retryable: false,
      message: `The legacy log search on this stack accepts at most ${Math.round(limits.maxSpanMs / HOUR_MS)} hours between --since and --until.`,
    });
  return { start, end };
}
