interface Value {
  key: string;
  value: unknown;
}

export const toValues = (rawValues?: string): Value[] | undefined => {
  if (!rawValues) return undefined;

  const obj: Record<string, unknown> = JSON.parse(rawValues);
  return Object.entries(obj).reduce<Value[]>(
    (result, [key, value]) => [...result, { key, value }],
    []
  );
};

export const parseJsonOrUndefined = (json?: string) =>
  json ? JSON.parse(json) : undefined;
