import { Cli, Errors, z } from "incur";
import { UpdateThemeDocument as UPDATE_THEME } from "../../../graphql/operations/updateTheme.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import {
  describeTheme,
  maxBorderRadius,
  normalizeColorType,
  parseColorAssignments,
  readTheme,
  type ThemeProperty,
  toApiVariant,
  variantOption,
} from "./values.js";

const entries = z.record(z.string(), z.string());
const toPropertyInput = ({ type, value, variant }: ThemeProperty) => ({
  type,
  value,
  ...(variant === null ? {} : { variant }),
});

export default Cli.command({
  output: z
    .object({
      variant: z.string(),
      changed: z.array(z.string()),
      colors: entries,
      properties: entries,
    })
    .extend(warningsOutput),
  description: "Update colors and properties for one theme variant, keeping the rest of the theme",
  options: z.object({
    variant: variantOption.describe(
      "variant to update: embedded-light and embedded-dark style embedded screens for your customers",
    ),
    color: z
      .array(z.string())
      .optional()
      .describe("set a color as type=value, such as primary=#4f46e5; repeatable"),
    removeColor: z
      .array(z.string())
      .optional()
      .describe("return a color type to Prismatic's default; repeatable"),
    borderRadius: z.coerce
      .number()
      .int()
      .min(0)
      .max(maxBorderRadius)
      .optional()
      .describe(`corner radius in pixels, 0 to ${maxBorderRadius}`),
    disableElevation: z
      .enum(["true", "false"])
      .optional()
      .describe("remove drop shadows when true"),
  }),
  examples: [
    {
      description: "Match embedded screens to an app's brand color and corner radius:",
      options: {
        variant: "embedded-light",
        color: ["primary=#4f46e5", "link_color=#4338ca"],
        borderRadius: 8,
      },
    },
  ],
  hint: "Run `prism organization theme get` first to see current values. Theme changes apply to every customer immediately.",
  async run(context) {
    const {
      variant,
      color = [],
      removeColor = [],
      borderRadius,
      disableElevation,
    } = context.options;
    const colors = parseColorAssignments(color);
    const removed = removeColor.map(normalizeColorType);
    const properties = [
      ...(borderRadius === undefined
        ? []
        : [{ type: "border_radius", value: String(borderRadius) }]),
      ...(disableElevation === undefined
        ? []
        : [{ type: "disable_elevation", value: disableElevation }]),
    ];
    if (!colors.length && !removed.length && !properties.length)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        exitCode: 2,
        message:
          "Name at least one --color, --remove-color, --border-radius, or --disable-elevation.",
      });

    // updateTheme replaces the whole theme, so send every existing entry with this variant's changes.
    const apiVariant = toApiVariant(variant);
    const current = await readTheme();
    const replacedColors = new Set([...colors.map(({ type }) => type), ...removed]);
    const replacedProperties = new Set(properties.map(({ type }) => type));
    const next = {
      colors: [
        ...current.colors.filter(
          (entry) => entry.variant !== apiVariant || !replacedColors.has(entry.type),
        ),
        ...colors.map((entry) => ({ ...entry, variant: apiVariant })),
      ],
      properties: [
        ...current.properties.filter(
          (entry) => entry.variant !== apiVariant || !replacedProperties.has(entry.type),
        ),
        ...properties.map((entry) => ({ ...entry, variant: apiVariant })),
      ],
    };
    await gqlRequest({
      document: UPDATE_THEME,
      variables: { colors: next.colors, properties: next.properties.map(toPropertyInput) },
    });
    return {
      variant,
      changed: [...replacedColors, ...replacedProperties],
      ...describeTheme(next, variant)[variant],
    };
  },
});
