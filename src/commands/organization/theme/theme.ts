import { Errors, z } from "incur";
import { GetThemeDocument as GET_THEME } from "../../../graphql/operations/getTheme.generated.js";
import { gqlRequest } from "../../../graphql.js";

// Values accepted by the backend's ThemeColor model and theme validators.
export const themeColorTypes = [
  "primary",
  "secondary",
  "accent",
  "warning",
  "error",
  "info",
  "success",
  "other01",
  "icon_color",
  "link_color",
  "sidebar",
  "background",
  "debug",
  "trace",
  "metric",
  "designer_shell",
  "neutral",
] as const;
export const themeVariants = ["light", "dark", "embedded-light", "embedded-dark"] as const;
export const maxBorderRadius = 100;

export type ThemeVariant = (typeof themeVariants)[number];
export type ThemeColor = { type: string; value: string; variant: string };
export type ThemeProperty = { type: string; value: string; variant: string | null };
export type Theme = { colors: ThemeColor[]; properties: ThemeProperty[] };

export const variantOption = z.enum(themeVariants);
export const toApiVariant = (variant: ThemeVariant) => variant.replace("-", "_");
const toCliVariant = (variant: string) => variant.replace("_", "-");

const hexColor = /^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const rgbColor = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;

const invalid = (message: string) =>
  new Errors.IncurError({ code: "VALIDATION_ERROR", exitCode: 2, message });

export const normalizeColorType = (type: string) => {
  const normalized = type.trim().toLowerCase().replaceAll("-", "_");
  if (!(themeColorTypes as readonly string[]).includes(normalized))
    throw invalid(`Unknown theme color "${type}". Use one of: ${themeColorTypes.join(", ")}.`);
  return normalized;
};

/** Parse `type=value` color assignments, rejecting values the API would reject. */
export const parseColorAssignments = (assignments: string[]) =>
  assignments.map((assignment) => {
    const separator = assignment.indexOf("=");
    if (separator < 1) throw invalid(`Expected --color type=value, received "${assignment}".`);
    const type = normalizeColorType(assignment.slice(0, separator));
    const value = assignment.slice(separator + 1).trim();
    if (!hexColor.test(value) && !rgbColor.test(value))
      throw invalid(
        `Color "${type}" must be a hex value such as #4f46e5 or rgb(79, 70, 229), received "${value}".`,
      );
    return { type, value };
  });

/** Read the organization theme, refusing a partial read that a write would truncate. */
export const readTheme = async (): Promise<Theme> => {
  const { theme } = await gqlRequest({ document: GET_THEME });
  if (!theme) return { colors: [], properties: [] };
  const { colors, properties } = theme;
  if (
    colors.nodes.length !== colors.totalCount ||
    properties.nodes.length !== properties.totalCount
  )
    throw new Errors.IncurError({
      code: "COMMAND_FAILED",
      exitCode: 1,
      message: "The theme has more entries than one request returns, so it cannot be read in full.",
    });
  // The API returns enum names such as EMBEDDED_LIGHT; updateTheme expects lowercase values.
  return {
    colors: colors.nodes.map(({ type, value, variant }) => ({
      type: type.toLowerCase(),
      value,
      variant: variant.toLowerCase(),
    })),
    properties: properties.nodes.map(({ type, value, variant }) => ({
      type: type.toLowerCase(),
      value,
      variant: variant?.toLowerCase() ?? null,
    })),
  };
};

/** Group theme entries by CLI variant name, optionally for one variant. */
export const describeTheme = (theme: Theme, only?: ThemeVariant) => {
  const variants: Record<
    string,
    { colors: Record<string, string>; properties: Record<string, string> }
  > = {};
  const group = (variant: string | null) => {
    const name = variant ? toCliVariant(variant) : "all";
    variants[name] ??= { colors: {}, properties: {} };
    return variants[name];
  };
  for (const { type, value, variant } of theme.colors) group(variant).colors[type] = value;
  for (const { type, value, variant } of theme.properties) group(variant).properties[type] = value;
  if (!only) return variants;
  return { [only]: variants[only] ?? { colors: {}, properties: {} } };
};
