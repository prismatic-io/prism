import crypto from "crypto";
import { camelCase, kebabCase } from "lodash-es";
import {
  ActionObjectFromYAML,
  ConfigPageObjectFromYAML,
  ConfigVarObjectFromYAML,
  FlowObjectFromYAML,
  IntegrationObjectFromYAML,
} from "./types.js";
import {
  createFlowInputsString,
  writeLoopString,
  extractComponentList,
  formatConfigVarInputs,
  getPermissionAndVisibilityType,
  formatInputValue,
  UsedComponent,
} from "./utils.js";
import {
  IndentationText,
  Project,
  ScriptKind,
  SourceFile,
  VariableDeclarationKind,
} from "ts-morph";
import path from "path";
import { updatePackageJson } from "../../../util.js";
import { writeBranchString, getBranchKind } from "./branching.js";
import { escapeText } from "../../utils.js";

type ImportDeclaration = {
  moduleSpecifier: string;
  defaultImport?: string;
  namedImports?: string[];
};

type FormattedConfigPages = ReturnType<typeof formatConfigPages>;

export async function writeIntegration(
  integration: IntegrationObjectFromYAML,
  registryPrefix?: string,
) {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
    },
  });
  project.createDirectory("src");

  const usedComponents = await extractComponentList(integration, registryPrefix);

  writeFlows(project, integration);
  writeComponentRegistry(project, usedComponents, registryPrefix);
  const { includesUserLevel } = writeConfigPages(project, integration);
  const { includesScopedConfigVars } = writeScopedConfigVars(project, integration);

  writeIndex(project, integration, { includesUserLevel, includesScopedConfigVars });

  await project.save();

  return {
    project,
    usedComponents,
  };
}

export async function writePackageJson(
  name: string,
  usedComponents: Record<string, UsedComponent>,
) {
  const manifests: Record<string, string> = {};

  for (const [key, value] of Object.entries(usedComponents)) {
    const packageName = `${value.registryPrefix}/${key}`;
    // @TODO: If we can get access to the signature in the YAML export, we can
    // eventually support resolving the package version for them here.
    manifests[packageName] = "*";
  }

  await updatePackageJson({
    name: kebabCase(name),
    path: "package.json",
    scripts: {
      build: "webpack",
      import: "npm run build && prism integrations:import",
      test: "jest",
      lint: "eslint --ext .ts .",
      "lint-fix": "eslint --fix --quiet --ext .ts .",
      format: "prettier . --write",
    },
    eslintConfig: {
      root: true,
      extends: ["@prismatic-io/eslint-config-spectral"],
    },
    dependencies: {
      "@prismatic-io/spectral": "*",
    },
    devDependencies: {
      ...manifests,
      "@prismatic-io/eslint-config-spectral": "2.0.1",
      "@types/jest": "29.5.12",
      "copy-webpack-plugin": "12.0.2",
      jest: "29.7.0",
      prettier: "3.4.2",
      "ts-jest": "29.1.2",
      "ts-loader": "9.5.1",
      typescript: "5.5.3",
      webpack: "5.91.0",
      "webpack-cli": "5.1.4",
    },
  });
}

function writeIndex(
  project: Project,
  integration: IntegrationObjectFromYAML,
  options: { includesUserLevel?: boolean; includesScopedConfigVars?: boolean },
) {
  const { includesScopedConfigVars, includesUserLevel } = options;
  const file = project.createSourceFile(path.join("src", "index.ts"), undefined, {
    scriptKind: ScriptKind.TS,
  });

  file.addImportDeclarations([
    {
      moduleSpecifier: "@prismatic-io/spectral",
      namedImports: ["integration"],
    },
    {
      moduleSpecifier: "./flows",
      defaultImport: "flows",
    },
    {
      moduleSpecifier: "./configPages",
      namedImports: ["configPages", ...(includesUserLevel ? ["userLevelConfigPages"] : [])],
    },
    {
      moduleSpecifier: "./componentRegistry",
      namedImports: ["componentRegistry"],
    },
    ...(includesScopedConfigVars
      ? [
          {
            moduleSpecifier: "./scopedConfigVars",
            namedImports: ["scopedConfigVars"],
          },
        ]
      : []),
  ]);

  file.addExportDeclarations([
    {
      moduleSpecifier: "./configPages",
      namedExports: ["configPages", ...(includesUserLevel ? ["userLevelConfigPages"] : [])],
    },
    {
      moduleSpecifier: "./componentRegistry",
      namedExports: ["componentRegistry"],
    },
    ...(includesScopedConfigVars
      ? [
          {
            moduleSpecifier: "./scopedConfigVars",
            namedExports: ["scopedConfigVars"],
          },
        ]
      : []),
  ]);

  const integrationVarName = `${camelCase(integration.name)}Integration`;

  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: integrationVarName,
        initializer: (writer) => {
          writer
            .writeLine("integration({")
            .writeLine(`name: "${integration.name}",`)
            .writeLine(`description: ${formatInputValue(integration.description) || ""},`)
            .writeLine(`iconPath: "icon.png",`)
            .writeLine("componentRegistry,")
            .writeLine("flows,")
            .writeLine("configPages,")
            .conditionalWriteLine(includesUserLevel, "userLevelConfigPages,")
            .conditionalWriteLine(includesScopedConfigVars, "scopedConfigVars,")
            .writeLine("});")
            .writeLine(`export default ${integrationVarName}`);
        },
      },
    ],
  });
}

function writeFlows(project: Project, integration: IntegrationObjectFromYAML) {
  const flowKeys: Array<string> = [];
  integration.flows.forEach((parsedFlow) => {
    try {
      const file = project.createSourceFile(
        path.join("src", "flows", `${camelCase(parsedFlow.name)}.ts`),
        undefined,
        {
          scriptKind: ScriptKind.TS,
        },
      );

      const flow = formatFlow(parsedFlow, file);
      flowKeys.push(flow.key);

      file.addImportDeclarations([
        {
          moduleSpecifier: "@prismatic-io/spectral",
          namedImports: ["flow"],
        },
      ]);

      file.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: flow.key,
            initializer: (writer) => {
              writer
                .writeLine("flow({")
                .writeLine(`name: "${flow.name}",`)
                .writeLine(`stableKey: "${flow.stableKey}",`)
                .writeLine(`description: ${formatInputValue(flow.description)},`)
                .conditionalWriteLine(
                  Boolean(flow.isSynchronous),
                  `isSynchronous: ${flow.isSynchronous},`,
                )
                .conditionalWriteLine(
                  flow.endpointSecurityType !== undefined,
                  `endpointSecurityType: "${flow.endpointSecurityType}",`,
                );

              if (flow.trigger.schedule && flow.trigger.schedule.meta?.scheduleType !== "none") {
                writer
                  .writeLine("schedule: {")
                  .conditionalWriteLine(
                    flow.trigger.schedule.type === "configVar",
                    `configVar: "${flow.trigger.schedule.value}",`,
                  )
                  .conditionalWriteLine(
                    flow.trigger.schedule.type !== "configVar",
                    `value: "${flow.trigger.schedule.value}",`,
                  )
                  .conditionalWriteLine(
                    Boolean(flow.trigger.schedule?.timezone),
                    `timezone: "${flow.trigger.schedule.timezone}",`,
                  )
                  .writeLine("},");
              } else if (
                flow.trigger.action.component.key === "webhook-triggers" &&
                flow.trigger.action.key === "webhook"
              ) {
                // No-op. Do not write anything and fall back to default trigger.
              } else {
                writer
                  .writeLine("onTrigger: {")
                  .writeLine(`component: "${camelCase(flow.trigger.action.component.key)}",`)
                  .writeLine(`key: "${flow.trigger.action.key}",`)
                  .writeLine("values: {")
                  .conditionalWriteLine(
                    Boolean(flow.trigger.formattedInputs),
                    flow.trigger.formattedInputs as string,
                  )
                  .writeLine("},")
                  .writeLine("},");
              }

              writer
                .writeLine("onExecution: async (context, params) => {")
                .writeLine("const { configVars } = context;");

              flow.steps.forEach((step) => {
                writer
                  .conditionalWriteLine(Boolean(step.loopString), step.loopString || "")
                  .conditionalWriteLine(Boolean(step.branchString), step.branchString || "")
                  .conditionalWriteLine(
                    !step.loopString && !step.branchString,
                    `const ${camelCase(step.name)} = await context.components.${camelCase(
                      step.action.component.key,
                    )}.${camelCase(step.action.key)}({${step.formattedInputs}});`,
                  );
              });

              writer.writeLine(`return { data: ${flow.result} };`).writeLine("},");

              writer.writeLine("})");
            },
          },
        ],
      });

      file.addExportAssignment({
        isExportEquals: false,
        expression: flow.key,
      });
    } catch (e) {
      // If we hit an error generating a flow, we just want to skip that flow rather than
      // abort the entire generation process.
      console.error(`${e}`);
    }
  });

  const indexFile = project.createSourceFile(path.join("src", "flows", "index.ts"), undefined, {
    scriptKind: ScriptKind.TS,
  });

  indexFile.addImportDeclarations(
    flowKeys.map((key) => {
      return {
        moduleSpecifier: `./${key}`,
        namedImports: [key],
      };
    }),
  );

  indexFile.addExportAssignment({
    isExportEquals: false,
    expression: (writer) => {
      writer.writeLine(`[ ${flowKeys.join(", ")} ]`);
    },
  });
}

function writeComponentRegistry(
  project: Project,
  components: Record<string, UsedComponent>,
  prefix?: string,
) {
  const file = project.createSourceFile(path.join("src", "componentRegistry.ts"), undefined, {
    scriptKind: ScriptKind.TS,
  });
  const componentImports: ImportDeclaration[] = [];

  file.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: "componentRegistry",
        initializer: (writer) => {
          writer.writeLine("componentManifests({");

          for (const [key, value] of Object.entries(components)) {
            componentImports.push({
              moduleSpecifier: `${value.registryPrefix}/${key}`,
              defaultImport: camelCase(key),
            });
            writer.writeLine(`${camelCase(key)},`);
          }

          writer.writeLine("})");
        },
      },
    ],
  });

  file.addImportDeclarations([
    {
      moduleSpecifier: "@prismatic-io/spectral",
      namedImports: ["componentManifests"],
    },
    ...componentImports,
  ]);

  return file;
}

const MAX_HTML_STABLEKEY_LENGTH = 100;

function writeConfigPages(project: Project, integration: IntegrationObjectFromYAML) {
  try {
    const formattedPages = formatConfigPages(
      integration.configPages,
      integration.requiredConfigVars,
    );
    const configPages: FormattedConfigPages = [];
    const userConfigPages: FormattedConfigPages = [];

    formattedPages.forEach((page) => {
      if (page.userLevelConfigured) {
        userConfigPages.push(page);
      } else {
        configPages.push(page);
      }
    });

    const file = project.createSourceFile(path.join("src", "configPages.ts"), undefined, {
      scriptKind: ScriptKind.TS,
    });

    const configPageIncludes = generateConfigPages(file, configPages);
    const userConfigIncludes = generateConfigPages(file, userConfigPages, true);

    const includes = {
      configPage: true,
      configVar: configPageIncludes.configVar || userConfigIncludes.configVar,
      connectionConfigVar:
        configPageIncludes.connectionConfigVar || userConfigIncludes.connectionConfigVar,
      dataSourceConfigVar:
        configPageIncludes.dataSourceConfigVar || userConfigIncludes.dataSourceConfigVar,
    };

    file.addImportDeclarations([
      {
        moduleSpecifier: "@prismatic-io/spectral",
        namedImports: Object.keys(includes).reduce<Array<string>>((accum, key) => {
          if (includes[key as keyof typeof includes]) {
            accum.push(key);
          }

          return accum;
        }, []),
      },
    ]);

    return { includesUserLevel: userConfigPages.length > 0 };
  } catch (e) {
    console.error("Error generating config page:", e);
    return { includesUserLevel: false };
  }
}

function generateConfigPages(
  file: SourceFile,
  configPages: FormattedConfigPages,
  isUserLevel = false,
) {
  const includes: {
    configVar?: boolean;
    connectionConfigVar?: boolean;
    dataSourceConfigVar?: boolean;
  } = {};

  if (configPages.length > 0) {
    file.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: `${isUserLevel ? "userLevelConfigPages" : "configPages"}`,
          initializer: (writer) => {
            writer.writeLine("{");
            configPages.forEach((page) => {
              writer
                .writeLine(`"${page.name}": configPage({`)
                .writeLine(`tagline: "${page.tagline}",`)
                .writeLine("elements: {");

              page.configVars.forEach((configVar) => {
                if ("connection" in configVar && configVar.connection) {
                  includes.connectionConfigVar = true;
                  writer
                    .writeLine(`"${configVar.name}": connectionConfigVar({`)
                    .writeLine(`stableKey: "${camelCase(configVar.key)}",`)
                    .writeLine(`dataType: "${configVar.dataType}",`)
                    .writeLine("connection: {")
                    .writeLine(`component: "${camelCase(configVar.connection.component.key)}",`)
                    .writeLine(`key: "${configVar.connection.key}",`)
                    .writeLine("values: {");

                  configVar.inputs.forEach((input) => {
                    writer
                      .writeLine(`${formatInputValue(input.name)}: {`)
                      .conditionalWriteLine(
                        input.type === "configVar",
                        `configVar: "${input.value}",`,
                      )
                      .conditionalWriteLine(
                        input.type !== "configVar",
                        `value: ${formatInputValue(input.value, {
                          boolean: false,
                          number: true,
                        })},`,
                      )
                      .conditionalWriteLine(
                        Boolean(input.meta.permissionAndVisibilityType),
                        `permissionAndVisibilityType: "${input.meta.permissionAndVisibilityType}",`,
                      )
                      .conditionalWriteLine(
                        Boolean(input.meta.writeOnly),
                        `writeOnly: ${input.meta.writeOnly},`,
                      )
                      .conditionalWriteLine(
                        input.meta.visibleToOrgDeployer !== undefined,
                        `visibleToOrgDeployer: ${input.meta.visibleToOrgDeployer},`,
                      )
                      .writeLine("},");
                  });

                  writer.writeLine("},").writeLine("},").writeLine("}),");
                } else if ("dataSource" in configVar && configVar.dataSource) {
                  includes.dataSourceConfigVar = true;
                  writer
                    .writeLine(`"${configVar.name}": dataSourceConfigVar({`)
                    .writeLine(`stableKey: "${camelCase(configVar.key)}",`)
                    .writeLine(`dataType: "${configVar.dataType}",`)
                    .writeLine("dataSource: {")
                    .writeLine(`component: "${camelCase(configVar.dataSource.component.key)}",`)
                    .writeLine(`key: "${configVar.dataSource.key}",`)
                    .writeLine("values: {");

                  configVar.inputs.forEach((input) => {
                    writer
                      .writeLine(`${formatInputValue(input.name)}: {`)
                      .conditionalWriteLine(
                        input.type === "configVar",
                        `configVar: "${input.value}",`,
                      )
                      .conditionalWriteLine(
                        input.type !== "configVar",
                        `value: ${formatInputValue(input.value)},`,
                      )
                      .writeLine("},");
                  });

                  writer.writeLine("},").writeLine("},").writeLine("}),");
                } else {
                  includes.configVar = true;
                  writer
                    .writeLine(`"${escapeText(configVar.name)}": configVar({`)
                    .writeLine(
                      `stableKey: "${
                        configVar.dataType === "htmlElement"
                          ? crypto
                              .createHash("sha256")
                              .update(camelCase(configVar.key))
                              .digest("hex")
                          : camelCase(configVar.key)
                      }",`,
                    )
                    .writeLine(`dataType: "${configVar.dataType}",`)
                    .writeLine(`description: ${formatInputValue(configVar.description)},`)
                    .conditionalWriteLine(
                      Boolean(configVar.meta?.permissionAndVisibilityType),
                      `permissionAndVisibilityType: "${configVar.meta?.permissionAndVisibilityType}",`,
                    )
                    .conditionalWriteLine(
                      configVar.meta?.visibleToOrgDeployer !== undefined,
                      `visibleToOrgDeployer: ${configVar.meta?.visibleToOrgDeployer},`,
                    )
                    .conditionalWriteLine(
                      Boolean(configVar.collectionType),
                      `collectionType: "${configVar.collectionType}", defaultValue: ${configVar.defaultValue},`,
                    )
                    .conditionalWriteLine(
                      Boolean(!configVar.collectionType && configVar.defaultValue),
                      `defaultValue: ${formatInputValue(configVar.defaultValue || "")},`,
                    )
                    .writeLine("}),");
                }
              });

              writer.writeLine("},").writeLine("}),");
            });
            writer.writeLine("}");
          },
        },
      ],
    });
  }

  return includes;
}

function writeScopedConfigVars(project: Project, integration: IntegrationObjectFromYAML) {
  try {
    const scopedConfigVars = integration.requiredConfigVars.filter((cv) => {
      return cv.useScopedConfigVar;
    });

    if (scopedConfigVars.length > 0) {
      const file = project.createSourceFile(path.join("src", "scopedConfigVars.ts"), undefined, {
        scriptKind: ScriptKind.TS,
      });

      /** There is currently no way to differentiate between customer-activated and org-activated
       *  connections via YAML. As of spectral@10.5, the customerActivatedConnection and
       *  organizationActivatedConnection methods actually do the same thing, so there's no harm
       *  in using either function for either case, other than just being confusing.
       */
      file.addStatements((writer) => {
        writer
          .writeLine(
            "// NOTE - You may want to double check if this integration is using org-activated or",
          )
          .writeLine(
            "// customer-activated connection config vars. If customer-activated, you may use the",
          )
          .writeLine("// customerActivatedConnection function.");
      });

      file.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "scopedConfigVars",
            initializer: (writer) => {
              writer.writeLine("{");
              scopedConfigVars.forEach((scv) => {
                writer
                  .writeLine(`"${scv.key}": organizationActivatedConnection({`)
                  .writeLine(`stableKey: "${scv.useScopedConfigVar}",`)
                  .writeLine("}),");
              });
              writer.writeLine("}");
            },
          },
        ],
      });

      file.addImportDeclarations([
        {
          moduleSpecifier: "@prismatic-io/spectral",
          namedImports: ["organizationActivatedConnection"],
        },
      ]);

      return { includesScopedConfigVars: true };
    } else {
      return { includesScopedConfigVars: false };
    }
  } catch (e) {
    console.error(`Error writing scoped config vars: ${e}`);
    return { includesScopedConfigVars: false };
  }
}

/* Format a parsed flow object into data that can be consumed by the writer. */
function formatFlow(flow: FlowObjectFromYAML, file: SourceFile) {
  const { name, description, isSynchronous, endpointSecurityType } = flow;
  const steps: Array<ActionObjectFromYAML> = [];
  let formattedStep: ActionObjectFromYAML;
  let trigger: ActionObjectFromYAML | undefined;

  flow.steps.forEach((step) => {
    formattedStep = step;

    if (step.action.component.key === "loop") {
      formattedStep.loopString = writeLoopString(formattedStep, file, trigger, step);
    } else if (getBranchKind(step) === "branch") {
      formattedStep.branchString = writeBranchString(formattedStep, file, trigger);
    } else {
      formattedStep.formattedInputs = createFlowInputsString(step, trigger);
    }

    if (step.isTrigger) {
      trigger = formattedStep;
    } else {
      steps.push(formattedStep);
    }
  });

  if (!trigger) {
    throw `Unable to find a trigger step for flow: ${flow.name}. Skipping file generation step.`;
  }

  return {
    key: camelCase(name),
    name,
    stableKey: kebabCase(name),
    description,
    isSynchronous,
    endpointSecurityType,
    trigger,
    steps,
    result: camelCase(steps.at(-1)?.name ?? "null"),
  };
}

/* Format parsed config page & config var objects into data that can be consumed by the writer. */
function formatConfigPages(
  configPages: Array<ConfigPageObjectFromYAML>,
  requiredConfigVars: Array<ConfigVarObjectFromYAML>,
) {
  return configPages.map((configPage) => {
    const { name, tagline, elements, userLevelConfigured } = configPage;

    const configVars = elements.map((element) => {
      const foundConfigVar = requiredConfigVars?.find((configVar) => {
        return configVar.key === element.value;
      });

      return foundConfigVar
        ? {
            name: element.value,
            ...foundConfigVar,
            inputs: formatConfigVarInputs(foundConfigVar),
            meta: {
              ...foundConfigVar.meta,
              permissionAndVisibilityType: getPermissionAndVisibilityType({
                ...foundConfigVar.meta,
                orgOnly: foundConfigVar.orgOnly,
              }),
            },
          }
        : {
            // Non-required config vars will be pretty sparse.
            key: camelCase(element.value),
            name: element.value,
            collectionType: undefined,
            connection: undefined,
            dataSource: undefined,
            dataType: element.type,
            defaultValue: undefined,
            description: undefined,
            inputs: [],
            meta: undefined,
          };
    });

    return {
      name,
      tagline,
      configVars,
      userLevelConfigured,
    };
  });
}
