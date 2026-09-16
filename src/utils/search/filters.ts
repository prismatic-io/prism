import { Errors } from "incur";
import type { EventFilterGroup } from "../../graphql/schema.generated.js";
import { FilterOperator, LogicalOperator } from "../../graphql/schema.generated.js";

export interface Condition {
  keyPath: string;
  operator: FilterOperator;
  value: unknown;
}

const operatorTokens: Array<[string, FilterOperator]> = [
  ["!=", FilterOperator.NotEq],
  [">=", FilterOperator.Gte],
  ["<=", FilterOperator.Lte],
  ["^=", FilterOperator.StartsWith],
  ["~", FilterOperator.Contains],
  ["=", FilterOperator.Eq],
];

const numericKeys = new Set(["retryAttemptNumber", "loopStepIndex", "stepCount", "durationMs"]);

const coerceValue = (keyPath: string, raw: string): unknown => {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (numericKeys.has(keyPath) && /^-?\d+$/.test(raw)) return Number(raw);
  return raw;
};

const invalid = (expression: string) =>
  new Errors.IncurError({
    code: "INVALID_FILTER",
    exitCode: 2,
    retryable: false,
    message: `Cannot parse filter '${expression}'.`,
    hint: "Use key=value, key!=value, key~text, key^=prefix, key>=value, key<=value, key=null, key!=null, or 'key in a,b,c'.",
  });

export function parseWhere(expression: string): Condition {
  const trimmed = expression.trim();
  const membership = /^([\w.]+)\s+in\s+(.+)$/i.exec(trimmed);
  if (membership) {
    const [, keyPath, list] = membership;
    return {
      keyPath,
      operator: FilterOperator.In,
      value: list.split(",").map((item) => coerceValue(keyPath, item.trim())),
    };
  }
  for (const [token, operator] of operatorTokens) {
    const index = trimmed.indexOf(token);
    if (index <= 0) continue;
    const keyPath = trimmed.slice(0, index).trim();
    const raw = trimmed.slice(index + token.length).trim();
    if (!/^[\w.]+$/.test(keyPath)) throw invalid(expression);
    if (raw === "null" && operator === FilterOperator.Eq)
      return { keyPath, operator: FilterOperator.IsNull, value: true };
    if (raw === "null" && operator === FilterOperator.NotEq)
      return { keyPath, operator: FilterOperator.IsNull, value: false };
    if (raw === "") throw invalid(expression);
    return { keyPath, operator, value: coerceValue(keyPath, raw) };
  }
  throw invalid(expression);
}

export const condition = (
  keyPath: string,
  operator: FilterOperator,
  value: unknown,
): Condition => ({
  keyPath,
  operator,
  value,
});

export const toFilterGroups = (conditions: Condition[]): EventFilterGroup[] | null =>
  conditions.length === 0 ? null : [{ operator: LogicalOperator.And, filters: conditions }];

export const describeCondition = ({ keyPath, operator, value }: Condition) =>
  `${keyPath} ${operator} ${JSON.stringify(value)}`;

export type OptionalCondition = readonly [
  keyPath: string,
  operator: FilterOperator,
  value: unknown,
];

const isBlank = (value: unknown) =>
  value === undefined || value === null || value === false || value === "";

export const optionalConditions = (entries: OptionalCondition[]): Condition[] =>
  entries
    .filter(([, , value]) => !isBlank(value))
    .map(([keyPath, operator, value]) => condition(keyPath, operator, value));
