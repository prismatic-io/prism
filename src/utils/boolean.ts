import { z } from "zod";

const booleanString = z.enum(["true", "false"]);

export function parseOptionalBoolean(value: string | undefined): boolean | undefined {
  return value === undefined ? undefined : booleanString.parse(value) === "true";
}
