import { Project, SourceFile } from "ts-morph";
import { ProjectStructure } from "./index.js";
import * as path from "path";
import { camelCase } from "lodash-es";

const initializeActionFile = (componentProject: Project, projectRoot: string): SourceFile => {
  const actionFile = componentProject.createSourceFile(
    path.join(projectRoot, "src", "actions.ts"),
    undefined,
    { overwrite: true },
  );
  actionFile.addImportDeclaration({
    moduleSpecifier: "@prismatic-io/spectral",
    namedImports: [{ name: "action" }],
  });
  return actionFile;
};

const initializeInputsFile = (componentProject: Project, projectRoot: string): SourceFile => {
  const inputsFile = componentProject.createSourceFile(
    path.join(projectRoot, "src", "inputs.ts"),
    undefined,
    { overwrite: true },
  );

  inputsFile.addImportDeclaration({
    moduleSpecifier: "@prismatic-io/spectral",
    namedImports: [{ name: "input" }],
  });

  return inputsFile;
};
const copyTemplateFileToProject = (
  componentProject: Project,
  projectRoot: string,
  projectTemplatePath: string,
  fileName: string,
) => {
  componentProject.addSourceFileAtPath(projectTemplatePath);
  const templateFile = componentProject.getSourceFileOrThrow(projectTemplatePath);
  templateFile.copy(path.join(process.cwd(), projectRoot, fileName));
};

const initializeWSDL = ({
  projectRoot,
  projectTemplateName,
  projectTemplatePath,
  componentProject,
  actionFile,
}: ProjectStructure): string => {
  const wsdlProjectLocation = path.join(projectRoot, `${projectTemplateName}.wsdl`);

  // Copy the wsdl used for generation to the project root
  copyTemplateFileToProject(
    componentProject,
    projectRoot,
    projectTemplatePath,
    `${projectTemplateName}.wsdl`,
  );

  actionFile.addImportDeclaration({
    defaultImport: "* as path",
    moduleSpecifier: "path",
  });
  // Return the relative path of the WSDL
  return path.relative(path.join(projectRoot, "src"), wsdlProjectLocation);
};

const projectTypeSetup = (project: ProjectStructure) => {
  const wsdlPath = initializeWSDL(project);
  // Update the WSDL Path to be in our component project
  project.projectTemplatePath = wsdlPath;
};

export const initializeProject = (
  projectRoot: string,
  projectTemplateName: string,
  projectTemplatePath: string,
): ProjectStructure => {
  const componentProject = new Project({
    tsConfigFilePath: path.join(projectRoot, "tsconfig.json"),
  });

  componentProject.addSourceFilesAtPaths(path.join(projectRoot, "**/*"));

  const actionFile = initializeActionFile(componentProject, projectRoot);

  const inputsFile = initializeInputsFile(componentProject, projectRoot);

  const project: ProjectStructure = {
    projectRoot,
    projectTemplateName: camelCase(projectTemplateName),
    definitionDirectory: camelCase(projectTemplateName).toLowerCase(),
    projectTemplatePath,
    componentProject,
    actionFile,
    inputsFile,
  };

  // Setup type specific project details
  projectTypeSetup(project);

  return project;
};
