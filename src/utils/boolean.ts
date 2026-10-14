import { z } from "zod";

const booleanString = z.enum(["true", "false"]);

export const parseOptionalBoolean = (value: string | undefined): boolean | undefined =>
  value === undefined ? undefined : booleanString.parse(value) === "true";
