import { z } from "incur";
import type { ComponentSelector } from "../../utils/component/catalog.js";

export const visibilityFilterOptions = () => ({
  public: z
    .boolean()
    .optional()
    .describe("Only include public components")
    .meta({ cli: { exclusive: ["private"] } }),
  private: z
    .boolean()
    .optional()
    .describe("Only include private components")
    .meta({ cli: { exclusive: ["public"] } }),
});

export const visibilityOptions = (subject = "details") => ({
  public: z
    .boolean()
    .optional()
    .describe(
      `Show ${subject} for the public component with the given key. Use this flag when you have a private component with the same key as a public component.`,
    )
    .meta({ cli: { exclusive: ["private"] } }),
  private: z
    .boolean()
    .optional()
    .describe(
      `Show ${subject} for the private component with the given key. Use this flag when you have a private component with the same key as a public component.`,
    )
    .meta({ cli: { exclusive: ["public"] } }),
});

export const versionOption = () => ({
  version: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Pin a specific component version (defaults to the latest version)"),
});

export const componentKeyArg = (purpose: string) =>
  z.string().describe(`The key of the component ${purpose} (e.g. 'salesforce')`);

export const resolveVisibility = (flags: { public?: boolean; private?: boolean }) => {
  if (flags.public) return true;
  if (flags.private) return false;
  return undefined;
};

export const toSelector = (
  key: string,
  flags: { public?: boolean; private?: boolean; version?: number },
): ComponentSelector => ({ key, public: resolveVisibility(flags), version: flags.version });

export const pageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
});

export const componentRefSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  public: z.boolean(),
  versionNumber: z.number().int(),
});

const inputFieldBase = z.object({
  id: z.string(),
  key: z.string(),
  keyPath: z.array(z.string()),
  order: z.number().int().nullable(),
  label: z.string(),
  keyLabel: z.string().nullable(),
  type: z.string(),
  collection: z.string().nullable(),
  required: z.boolean(),
  shown: z.boolean(),
  default: z.unknown().optional(),
  placeholder: z.string().nullable(),
  comments: z.string().nullable(),
  example: z.string().nullable(),
  model: z.unknown().optional(),
  language: z.string().nullable(),
  onPremiseControlled: z.boolean(),
  scope: z.string().nullable(),
  dataSource: z
    .object({ key: z.string(), label: z.string(), dataSourceType: z.string().nullable() })
    .nullable()
    .optional(),
});

export type InputFieldOutput = z.infer<typeof inputFieldBase> & { inputs: InputFieldOutput[] };

export const inputFieldSchema: z.ZodType<InputFieldOutput> = inputFieldBase.extend({
  inputs: z.lazy(() => z.array(inputFieldSchema)),
});

export const outputSchemaSchema = z
  .union([
    z.object({ __typename: z.literal("ActionOutputSchema"), type: z.string(), schema: z.string() }),
    z.object({
      __typename: z.literal("BranchingOutputSchema"),
      type: z.string(),
      branchSchemas: z.array(z.object({ name: z.string(), schema: z.string() })),
    }),
  ])
  .nullable();

const memberDetailBase = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  description: z.string(),
  directions: z.string().nullable(),
  important: z.boolean(),
  authorizationRequired: z.boolean().nullable(),
  isTrigger: z.boolean(),
  isCommonTrigger: z.boolean().nullable(),
  isPollingTrigger: z.boolean().nullable(),
  scheduleSupport: z.string().nullable(),
  synchronousResponseSupport: z.string().nullable(),
  batchSupport: z.string(),
  defaultBatchSize: z.number().int().nullable(),
  hasOnDeployPerform: z.boolean(),
  hasOnInstanceDeploy: z.boolean(),
  hasOnInstanceDelete: z.boolean(),
  hasWebhookCreateFunction: z.boolean(),
  hasWebhookDeleteFunction: z.boolean(),
  isDataSource: z.boolean(),
  dataSourceType: z.string().nullable(),
  isDetailDataSource: z.boolean(),
  allowsBranching: z.boolean(),
  staticBranchNames: z.array(z.string()).nullable(),
  dynamicBranchInput: z.string(),
  terminateExecution: z.boolean(),
  breakLoop: z.boolean().nullable(),
  canCallComponentFunctions: z.boolean(),
  examplePayload: z.unknown().optional(),
  outputSchema: outputSchemaSchema,
  inputs: z.array(inputFieldSchema),
});

export const memberDetailSchema = memberDetailBase.extend({
  kind: z.enum(["action", "trigger", "dataSource"]),
  component: componentRefSchema,
  detailDataSource: memberDetailBase.nullable(),
});

export const connectionSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  default: z.boolean(),
  order: z.number().int().nullable(),
  comments: z.string().nullable(),
  oauth2Type: z.string().nullable(),
  onPremiseAvailable: z.boolean(),
  inputs: z.array(inputFieldSchema),
  templates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      templatedInputKeys: z.array(z.string().nullable()).nullable(),
    }),
  ),
});

export const connectionDetailSchema = connectionSchema.extend({ component: componentRefSchema });

const memberSummarySchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  description: z.string(),
});

export const componentInspectionSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  description: z.string(),
  public: z.boolean(),
  category: z.string().nullable(),
  documentationUrl: z.string().nullable(),
  signature: z.string(),
  labels: z.array(z.string()).nullable(),
  forCodeNativeIntegration: z.boolean(),
  versionNumber: z.number().int(),
  versionIsLatest: z.boolean(),
  versionIsAvailable: z.boolean(),
  versionCreatedAt: z.string().nullable(),
  versionComment: z.string().nullable(),
  customer: z
    .object({ id: z.string(), name: z.string(), externalId: z.string().nullable() })
    .nullable(),
  counts: z.object({
    actions: z.number().int(),
    triggers: z.number().int(),
    dataSources: z.number().int(),
    connections: z.number().int(),
  }),
  actions: z.array(memberSummarySchema),
  triggers: z.array(memberSummarySchema),
  dataSources: z.array(memberSummarySchema.extend({ dataSourceType: z.string().nullable() })),
  connections: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      label: z.string(),
      default: z.boolean(),
      oauth2Type: z.string().nullable(),
      onPremiseAvailable: z.boolean(),
    }),
  ),
});
