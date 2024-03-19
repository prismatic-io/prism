import { InputFieldType } from "@prismatic-io/spectral";
import * as path from "path";
import { Project, SourceFile } from "ts-morph";
import { initializeProject } from "./sourceFile.js";
import { generateActions } from "./action.js";

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

export const generate = async ({
  projectRoot,
  projectTemplateName,
  projectTemplatePath,
}: GenerateParams): Promise<void> => {
  const project = initializeProject(projectRoot, projectTemplateName, projectTemplatePath);
  const { componentProject } = project;

  await generateActions(project);

  componentProject.getSourceFile(path.join(projectRoot, "src", "index.test.ts"))?.delete();

  await componentProject.save();
};
