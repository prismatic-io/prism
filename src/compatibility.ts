import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { z } from "incur";
import type { globalOptions } from "./command-schemas.js";

/** Metadata needed only for public argv spellings and cross-option constraints. */
export type Field = {
  kind: "boolean" | "integer" | "string";
  char?: string;
  default?: unknown;
  dependsOn?: string[];
  description?: string;
  exclusive?: string[];
  exactlyOne?: string[];
  hidden?: boolean;
  min?: number;
  multiple?: boolean;
  options?: readonly unknown[];
  preserveExplicit?: boolean;
  required?: boolean;
  legacyName?: string;
};
export type Fields = Record<string, Field>;
export const schemaFieldName = (name: string) => (name.startsWith("no-") ? name.slice(3) : name);
const passthroughPrefix = `__PRISM_PASSTHROUGH_${randomUUID()}__`;
export const encodePassthroughArgument = (value: string) =>
  `${passthroughPrefix}${Buffer.from(value).toString("base64url")}`;
export const decodePassthroughArgument = (value: string) =>
  value.startsWith(passthroughPrefix)
    ? Buffer.from(value.slice(passthroughPrefix.length), "base64url").toString()
    : value;
export type McpGlobals = Partial<z.output<typeof globalOptions>>;
// incur does not forward globals to MCP calls yet (wevm/incur#229).
// Keep launch defaults scoped to the transport while tools supply per-call context.
const transport = new AsyncLocalStorage<Readonly<McpGlobals>>();
export const runWithMcpTransport = <T>(callback: () => T, globals: McpGlobals = {}): T =>
  transport.run(Object.freeze({ ...globals }), callback);
export const isMcpTransport = () => transport.getStore() !== undefined;
export const getMcpGlobals = (): Readonly<McpGlobals> => transport.getStore() ?? {};

export function fieldsFromSchema(schema?: z.ZodObject): Fields {
  return Object.fromEntries(
    Object.entries(schema?.shape ?? {}).map(([key, schema]) => {
      const field = schema as z.ZodType;
      const meta = (field.meta()?.cli ?? {}) as Partial<Field>;
      let inner = field;
      let defaultValue: unknown;
      while (
        inner instanceof z.ZodOptional ||
        inner instanceof z.ZodDefault ||
        inner instanceof z.ZodNullable
      ) {
        if (inner instanceof z.ZodDefault) defaultValue = inner.def.defaultValue;
        inner = inner.unwrap() as z.ZodType;
      }
      const multiple = inner instanceof z.ZodArray;
      if (inner instanceof z.ZodArray) inner = inner.element as z.ZodType;
      const kind =
        inner instanceof z.ZodBoolean
          ? "boolean"
          : inner instanceof z.ZodNumber
            ? "integer"
            : "string";
      return [
        meta.legacyName ?? key,
        {
          kind,
          required: !field.safeParse(undefined).success,
          description: field.description,
          ...(defaultValue !== undefined ? { default: defaultValue } : {}),
          ...(multiple ? { multiple: true } : {}),
          ...(inner instanceof z.ZodEnum ? { options: Object.values(inner.enum) } : {}),
          ...meta,
        },
      ];
    }),
  );
}

export function applyLegacyOptionConstraints<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): z.ZodObject<T> {
  const fields = fieldsFromSchema(schema);
  return schema.superRefine((input, ctx) => {
    const values = input as Record<string, unknown>;
    for (const [name, field] of Object.entries(fields)) {
      const present = (key: string) => values[schemaFieldName(key)] !== undefined;
      const issue = (message: string) =>
        ctx.addIssue({ code: "custom", message, path: [schemaFieldName(name)] });
      if (field.exactlyOne) {
        const names = [...new Set([name, ...field.exactlyOne])];
        if (names.filter(present).length !== 1)
          issue(`Exactly one of ${names.map((k) => `--${k}`).join(", ")} is required`);
      }
      if (!present(name)) continue;
      for (const exclusive of field.exclusive ?? [])
        if (present(exclusive))
          issue(`--${name} cannot also be provided when using --${exclusive}`);
      for (const dependency of field.dependsOn ?? [])
        if (!present(dependency)) issue(`--${name} requires --${dependency}`);
    }
  });
}

export function decodeCliArguments<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): z.ZodObject<T> {
  const decode = (field: z.ZodType): z.ZodType => {
    // Parser inspects wrappers and arrays for token arity. Decode scalar values inside them.
    if (field instanceof z.ZodOptional) return decode(field.unwrap() as z.ZodType).optional();
    if (field instanceof z.ZodDefault)
      return decode(field.unwrap() as z.ZodType).default(field.def.defaultValue);
    if (field instanceof z.ZodArray) return z.array(decode(field.element as z.ZodType));
    return z.preprocess(
      (value) =>
        typeof value === "string" && !isMcpTransport() ? decodePassthroughArgument(value) : value,
      field,
    );
  };
  const fields = fieldsFromSchema(schema);
  const shape = Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      const field = value as z.ZodType;
      return [
        key,
        decode(field).meta({ ...field.meta(), description: field.description, cli: fields[key] }),
      ];
    }),
  );
  // Decoding changes input bytes only; each field still returns its declared output type.
  return z.object(shape) as unknown as z.ZodObject<T>;
}
