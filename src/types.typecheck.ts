import type {
  DataSourceConfigVarDataTypeEnum,
  DefaultRequiredConfigVar,
  FieldMappingRule,
  FieldMappingRuleModeEnum,
  FieldMappingSide,
  RequiredConfigVar,
} from "./types.js";

// This function is never executed. Unlike *.test.ts, this file is included by
// the project's TypeScript check, so unused @ts-expect-error directives fail CI.
export function assertFieldMappingConfigVarTypes(configVar: RequiredConfigVar): void {
  const mapping: RequiredConfigVar = {
    key: "Lead Mapping",
    description: "Map the lead fields",
    dataType: "fieldMapping",
    fieldMapping: {
      source: {
        dataSource: {
          component: { key: "acme-leads", version: 1, isPublic: false },
          key: "fields",
        },
        inputs: { objectType: { type: "value", value: "lead" } },
      },
      destination: { staticOptions: [{ key: "email", label: "Email Address" }] },
      allowAdditionalMappings: true,
      allowNewFields: false,
      rules: [{ mode: "static", sourceField: "lead_email", destField: "email" }],
    },
  };
  if (configVar.dataType === "fieldMapping") {
    const rules: FieldMappingRule[] | undefined = configVar.fieldMapping.rules;
    void rules;
  }
  // @ts-expect-error A fieldMapping config var requires its fieldMapping definition.
  const missingDefinition: RequiredConfigVar = { key: "Lead Mapping", dataType: "fieldMapping" };
  // @ts-expect-error The default config var shape does not accept the fieldMapping data type.
  const defaultShape: DefaultRequiredConfigVar = { key: "Lead Mapping", dataType: "fieldMapping" };
  // @ts-expect-error No single data source can produce a fieldMapping value.
  const dataSourceType: DataSourceConfigVarDataTypeEnum = "fieldMapping";
  // @ts-expect-error A side lists its fields from a data source or from static options.
  const emptySide: FieldMappingSide = {};
  // @ts-expect-error A rule mode is required, optional or static.
  const lockedMode: FieldMappingRuleModeEnum = "locked";
  // @ts-expect-error A rule requires a mode.
  const ruleWithoutMode: FieldMappingRule = { sourceField: "lead_email" };
  void [
    mapping,
    missingDefinition,
    defaultShape,
    dataSourceType,
    emptySide,
    lockedMode,
    ruleWithoutMode,
  ];
}
