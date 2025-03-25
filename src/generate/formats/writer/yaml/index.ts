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
  wrapValue,
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

type UsedComponents = { public: string[]; private: string[] };

type ImportDeclaration = {
  moduleSpecifier: string;
  defaultImport?: string;
  namedImports?: string[];
};

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

  const usedComponents = await extractComponentList(integration.flows);

  writeIndex(project, integration);
  writeFlows(project, integration);
  writeComponentRegistry(project, usedComponents, registryPrefix);
  writeConfigPages(project, integration);

  await project.save();

  return {
    project,
    usedComponents,
  };
}

export async function writePackageJson(
  name: string,
  usedComponents: UsedComponents,
  registryPrefix?: string,
) {
  const manifests: Record<string, string> = {};

  usedComponents.public.forEach((componentKey) => {
    const packageName = `@component-manifests/${componentKey}`;
    manifests[packageName] = "*";
  });

  usedComponents.private.forEach((componentKey) => {
    const packageName = `${registryPrefix ?? "@FIXME-YOUR-CUSTOM-NPM-REGISTRY"}/${componentKey}`;
    manifests[packageName] = "*";
  });

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

function writeIndex(project: Project, integration: IntegrationObjectFromYAML) {
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
      namedImports: ["configPages"],
    },
    {
      moduleSpecifier: "./componentRegistry",
      namedImports: ["componentRegistry"],
    },
  ]);

  file.addExportDeclarations([
    {
      moduleSpecifier: "./configPages",
      namedExports: ["configPages"],
    },
    {
      moduleSpecifier: "./componentRegistry",
      namedExports: ["componentRegistry"],
    },
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
            .writeLine(`description: ${wrapValue(integration.description) || ""},`)
            .writeLine(`iconPath: "icon.png",`)
            .writeLine("flows,")
            .writeLine("configPages,")
            .writeLine("componentRegistry,")
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
                .writeLine(`description: ${wrapValue(flow.description)},`)
                .writeLine(`isSynchronous: ${flow.isSynchronous},`)
                .writeLine(`endpointSecurityType: "${flow.endpointSecurityType}",`);

              if (flow.trigger.schedule) {
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
                    !!flow.trigger.schedule?.timezone,
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
                    !!flow.trigger.formattedInputs,
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
                  .conditionalWriteLine(!!step.loopString, step.loopString as string)
                  .conditionalWriteLine(!!step.branchString, step.branchString as string)
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

      file.formatText();
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

  indexFile.formatText();
}

function writeComponentRegistry(project: Project, components: UsedComponents, prefix?: string) {
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

          components.public.forEach((component) => {
            if (component !== "webhook-triggers") {
              componentImports.push({
                moduleSpecifier: `@component-manifests/${component}`,
                defaultImport: camelCase(component),
              });
              writer.writeLine(`${camelCase(component)},`);
            }
          });

          components.private.forEach((component) => {
            componentImports.push({
              moduleSpecifier: `${prefix ?? "@FIXME-YOUR-CUSTOM-REGISTRY-HERE"}/${component}`,
              defaultImport: camelCase(component),
            });
            writer.writeLine(`${camelCase(component)},`);
          });

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

  file.formatText();

  return file;
}

function writeConfigPages(project: Project, integration: IntegrationObjectFromYAML) {
  try {
    const configPages = formatConfigPages(integration.configPages, integration.requiredConfigVars);

    const file = project.createSourceFile(path.join("src", "configPages.ts"), undefined, {
      scriptKind: ScriptKind.TS,
    });

    const includes = {
      configPage: true,
      configVar: false,
      connectionConfigVar: false,
      dataSourceConfigVar: false,
    };

    file.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "configPages",
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
                    .writeLine(`stableKey: "${configVar.key}",`)
                    .writeLine(`dataType: "${configVar.dataType}",`)
                    .writeLine("connection: {")
                    .writeLine(`component: "${camelCase(configVar.connection.component.key)}",`)
                    .writeLine(`key: "${configVar.connection.key}",`)
                    .writeLine("values: {");

                  configVar.inputs.forEach((input) => {
                    writer
                      .writeLine(`"${input.name}": {`)
                      .conditionalWriteLine(
                        input.type === "configVar",
                        `configVar: "${input.value}",`,
                      )
                      .conditionalWriteLine(
                        input.type !== "configVar",
                        `value: ${wrapValue(input.value, true)},`,
                      )
                      .conditionalWriteLine(
                        !!input.meta.permissionAndVisibilityType,
                        `permissionAndVisibilityType: "${input.meta.permissionAndVisibilityType}",`,
                      )
                      .conditionalWriteLine(
                        !!input.meta.writeOnly,
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
                    .writeLine(`stableKey: "${configVar.key}",`)
                    .writeLine(`dataType: "${configVar.dataType}",`)
                    .writeLine("dataSource: {")
                    .writeLine(`component: "${camelCase(configVar.dataSource.component.key)}",`)
                    .writeLine(`key: "${configVar.dataSource.key}",`)
                    .writeLine("values: {");

                  configVar.inputs.forEach((input) => {
                    writer
                      .writeLine(`"${input.name}": {`)
                      .conditionalWriteLine(
                        input.type === "configVar",
                        `configVar: "${input.value}",`,
                      )
                      .conditionalWriteLine(
                        input.type !== "configVar",
                        `value: ${wrapValue(input.value, true)},`,
                      )
                      .writeLine("},");
                  });

                  writer.writeLine("},").writeLine("},").writeLine("}),");
                } else {
                  includes.configVar = true;
                  writer
                    .writeLine(`"${configVar.name}": configVar({`)
                    .writeLine(`stableKey: "${configVar.key}",`)
                    .writeLine(`dataType: "${configVar.dataType}",`)
                    .writeLine(`description: ${wrapValue(configVar.description)},`)
                    .conditionalWriteLine(
                      !!configVar.meta?.permissionAndVisibilityType,
                      `permissionAndVisibilityType: "${configVar.meta?.permissionAndVisibilityType}",`,
                    )
                    .conditionalWriteLine(
                      configVar.meta?.visibleToOrgDeployer !== undefined,
                      `visibleToOrgDeployer: ${configVar.meta?.visibleToOrgDeployer},`,
                    )
                    .conditionalWriteLine(
                      !!configVar.collectionType,
                      `collectionType: "${configVar.collectionType}", defaultValue: ${configVar.defaultValue},`,
                    )
                    .conditionalWriteLine(
                      !configVar.collectionType && !!configVar.defaultValue,
                      `defaultValue: ${wrapValue(configVar.defaultValue || "")},`,
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

    file.formatText();
  } catch (e) {
    console.error("Error generating config page:", e);
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
    result: camelCase(steps.at(-1)?.name ?? ""),
  };
}

/* Format parsed config page & config var objects into data that can be consumed by the writer. */
function formatConfigPages(
  configPages: Array<ConfigPageObjectFromYAML>,
  requiredConfigVars: Array<ConfigVarObjectFromYAML>,
) {
  return configPages.map((configPage) => {
    const { name, tagline, elements } = configPage;
    const configVars = elements.map((element) => {
      const foundConfigVar = requiredConfigVars.find((configVar) => {
        return configVar.key === element.value;
      });

      return foundConfigVar
        ? {
            name: element.value,
            ...foundConfigVar,
            inputs: formatConfigVarInputs(foundConfigVar),
            meta: {
              ...foundConfigVar.meta,
              permissionAndVisibilityType: getPermissionAndVisibilityType(
                foundConfigVar.meta,
                foundConfigVar.orgOnly,
              ),
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
    };
  });
}
