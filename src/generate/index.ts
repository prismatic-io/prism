import type { InputFieldType } from "@prismatic-io/spectral";
import * as path from "path";
import { type Project, type SourceFile, SyntaxKind } from "ts-morph";
import { generateActions } from "./action.js";
import { initializeProject } from "./sourceFile.js";

export interface ProjectStructure {
  projectRoot: string;
  projectTemplateName: string;
  definitionDirectory: string;
  projectTemplatePath: string;
  componentProject: Project;
  actionFile: SourceFile;
  inputsFile: SourceFile;
  clientFile?: SourceFile;
  connectionsFile?: SourceFile;
}

export interface InputPropertyStructure {
  propertyName: string;
  modified: boolean;
  originalName: string;
  type: InputFieldType;
  required: boolean;
  inputFieldName: string;
}

interface GenerateParams {
  projectRoot: string;
  projectTemplateName: string;
  projectTemplatePath: string;
}

const REMOVED_SCAFFOLD_FILES = [
  "index.test.ts",
  "actions.test.ts",
  "client.ts",
  "connections.ts",
  "dataSources.ts",
  "dataSources.test.ts",
  "triggers.ts",
  "triggers.test.ts",
];

const REMOVED_COMPONENT_MEMBERS = ["triggers", "dataSources", "connections"];

const pruneComponentIndex = (indexFile: SourceFile): void => {
  for (const member of REMOVED_COMPONENT_MEMBERS) {
    indexFile.getImportDeclaration(`./${member}`)?.remove();
  }

  const componentCall = indexFile
    .getExportAssignmentOrThrow(() => true)
    .getExpressionIfKindOrThrow(SyntaxKind.CallExpression);
  const definition = componentCall
    .getArguments()[0]
    ?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  for (const member of REMOVED_COMPONENT_MEMBERS) {
    definition?.getProperty(member)?.remove();
  }
};

const TYPE_DECLARATION_KINDS = new Set([
  SyntaxKind.InterfaceDeclaration,
  SyntaxKind.TypeAliasDeclaration,
]);

const markTypeOnlyExports = (file: SourceFile): void => {
  for (const declaration of file.getExportDeclarations()) {
    const specifiers = declaration.getNamedExports();
    if (declaration.isTypeOnly() || specifiers.length === 0) {
      continue;
    }
    const typeOnly = specifiers.filter((specifier) => {
      const targets = specifier.getLocalTargetDeclarations();
      return (
        targets.length > 0 &&
        targets.every((target) => TYPE_DECLARATION_KINDS.has(target.getKind()))
      );
    });
    if (typeOnly.length === specifiers.length) {
      declaration.setIsTypeOnly(true);
      continue;
    }
    for (const specifier of typeOnly) {
      specifier.setIsTypeOnly(true);
    }
  }
};

export const generate = async ({
  projectRoot,
  projectTemplateName,
  projectTemplatePath,
}: GenerateParams): Promise<void> => {
  const project = initializeProject(projectRoot, projectTemplateName, projectTemplatePath);
  const { componentProject, definitionDirectory } = project;

  await generateActions(project);

  for (const fileName of REMOVED_SCAFFOLD_FILES) {
    componentProject.getSourceFile(path.join(projectRoot, "src", fileName))?.delete();
  }
  pruneComponentIndex(
    componentProject.getSourceFileOrThrow(path.join(projectRoot, "src", "index.ts")),
  );
  for (const file of componentProject.getSourceFiles(
    path.join(projectRoot, definitionDirectory, "**/*.ts"),
  )) {
    markTypeOnlyExports(file);
  }

  await componentProject.save();
};
