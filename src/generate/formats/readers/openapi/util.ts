import { camelCase } from "lodash-es";

/** Convert path to grouping tag. */
export const toGroupTag = (input: string): string => {
  const tag = input.startsWith("/") ? input.split("/")[1] || "root" : input;
  const cleaned = tag.replace(/^(\d)/, "a$1");
  return camelCase(cleaned);
};
