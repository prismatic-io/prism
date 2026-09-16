import { camelCase } from "lodash-es";
import { toWords } from "number-to-words";

export const RESERVED_WORDS: ReadonlySet<string> = new Set([
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

export const isIdentifier = (name: string): boolean =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && !RESERVED_WORDS.has(name);

const identifierReplacements: Record<string, string> = {
  default: "defaultValue",
  public: "isPublic",
  protected: "isProtected",
  private: "isPrivate",
  interface: "anInterface",
  context: "ctx",
  data: "aData",
  case: "aCase",
  void: "voidOperation",
};

export const cleanIdentifier = (key: string): string => {
  const replacement = identifierReplacements[key];
  if (replacement) return replacement;
  const name = camelCase(
    key.replace(/^([0-9])(.+)?$/, (_, digit, rest = "") => `${toWords(digit)}${rest}`),
  );
  if (RESERVED_WORDS.has(name)) return identifierReplacements[name] ?? `${name}Value`;
  return name;
};
