import { InputFieldType } from "@prismatic-io/spectral";
import * as path from "path";
import { Project, SourceFile } from "ts-morph";
import { initializeProject } from "./sourceFile";
import { generateActions } from "./action";
import prettier from "prettier";
import { readJson, writeFile } from "fs-extra";

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
  const project = initializeProject(
    projectRoot,
    projectTemplateName,
    projectTemplatePath
  );
  const { componentProject } = project;

  await generateActions(project);

  componentProject
    .getSourceFile(path.join(projectRoot, "src", "index.test.ts"))
    ?.delete();

  await componentProject.save();
};

interface UpdatePackageJsonParams {
  path: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export const updatePackageJson = async ({
  path,
  dependencies = {},
  devDependencies = {},
}: UpdatePackageJsonParams) => {
  const contents = await readJson(path, { encoding: "utf-8" });
  Object.assign(contents.dependencies, dependencies);
  Object.assign(contents.devDependencies, devDependencies);

  const formatted = prettier.format(JSON.stringify(contents, null, 2), {
    parser: "json",
  });
  await writeFile(path, formatted);
};
