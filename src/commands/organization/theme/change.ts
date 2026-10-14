import { z } from "incur";
import { UpdateThemeDocument as UPDATE_THEME } from "../../../graphql/operations/updateTheme.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import {
  describeTheme,
  readTheme,
  type ThemeVariant,
  toApiVariant,
  variantOption,
} from "./values.js";

const entries = z.record(z.string(), z.string());
export const changeOutput = z
  .object({
    variant: z.string(),
    changed: z.array(z.string()),
    colors: entries,
    properties: entries,
  })
  .extend(warningsOutput);
export const changeOptions = z.object({
  variant: variantOption.describe("theme variant to change"),
});
export const changeHint =
  "Theme changes apply immediately. Run `prism organization theme get` to inspect custom values.";

/** updateTheme replaces both collections; preserve every unrelated entry, including unscoped properties. */
export async function changeTheme(
  variant: ThemeVariant,
  collection: "colors" | "properties",
  type: string,
  value?: string,
) {
  const current = await readTheme();
  const apiVariant = toApiVariant(variant);
  const next = {
    ...current,
    [collection]: [
      ...current[collection].filter((entry) => entry.variant !== apiVariant || entry.type !== type),
      ...(value === undefined ? [] : [{ type, value, variant: apiVariant }]),
    ],
  };
  await gqlRequest({
    document: UPDATE_THEME,
    variables: {
      colors: next.colors,
      properties: next.properties.map(({ type, value, variant }) => ({
        type,
        value,
        ...(variant === null ? {} : { variant }),
      })),
    },
  });
  return { variant, changed: [type], ...describeTheme(next, variant)[variant] };
}
