import * as path from "path";
import {
  Project,
  MethodSignature,
  SourceFile,
  ParameterDeclaration,
} from "ts-morph";
import { ProjectStructure } from ".";
import camelCase from "camelcase";

interface ServiceMethods {
  [k: string]: MethodSignature[];
}
const getWSDLClientMethods = (
  clientPath: string,
  clientInterface: string,
  componentProject: Project
) => {
  try {
    const wsdlClientSource = componentProject.getSourceFileOrThrow(clientPath);
    // Gather all the methods being translated to actions
    const wsdlClientInterface =
      wsdlClientSource.getInterfaceOrThrow(clientInterface);

    return wsdlClientInterface?.getMethods();
  } catch (error) {
    console.error("Unable to find methods for Action Generation.");
    process.exit(1);
  }
};

export const getParamTypeDefinition = (
  project: ProjectStructure,
  parameter: ParameterDeclaration
): SourceFile | undefined => {
  const { componentProject, projectRoot, definitionDirectory } = project;

  const paramName = parameter.getName();
  return componentProject.getSourceFile(
    path.join(
      projectRoot,
      definitionDirectory,
      "definitions",
      `${camelCase(
        !paramName.includes("Param") ? paramName : paramName.split("Param")[0],
        {
          pascalCase: true,
        }
      )}.ts`
    )
  );
};

// Gather the methods that will be translated to actions
export const getActionMethods = (
  projectStructure: ProjectStructure
): ServiceMethods => {
  const {
    projectRoot,
    componentProject,
    projectTemplateName,
    definitionDirectory,
  } = projectStructure;

  return {
    createClientAsync: getWSDLClientMethods(
      path.join(projectRoot, definitionDirectory, "client.ts"),
      `${camelCase(projectTemplateName, { pascalCase: true })}Client`,
      componentProject
    ),
  };
};
