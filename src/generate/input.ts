import {
  VariableDeclarationKind,
  ObjectLiteralExpression,
  Writers,
  ParameterDeclaration,
  SourceFile,
} from "ts-morph";
import { InputFieldType } from "@prismatic-io/spectral";
import { InputPropertyStructure, ProjectStructure } from "./index.js";
import { pascalCase } from "./util.js";

export const getActionMethodInputProperties = (
  parameter: ParameterDeclaration,
  parameterTypeDefinition: SourceFile | undefined,
): InputPropertyStructure[] => {
  const paramName = parameter.getName();
  const propertyStructures: InputPropertyStructure[] = [];
  if (parameterTypeDefinition) {
    const paramDefinition = parameterTypeDefinition.getInterfaceOrThrow(
      pascalCase(!paramName.includes("Param") ? paramName : paramName.split("Param")[0]),
    );

    const paramProperties = paramDefinition.getProperties();

    paramProperties.forEach((property) => {
      // If its a single numeric the import of the input field will fail
      // Assume single character inputs just suck
      // and set it as a modified field
      const [propertyName, modified] =
        property.getName().length !== 1
          ? [property.getName(), false]
          : [`param${property.getName()}`, true];
      const propertyType = property.getType().getText(property);

      const propertyStructure: InputPropertyStructure = {
        propertyName,
        modified,
        originalName: property.getName(),
        type: ["string", "boolean"].includes(propertyType)
          ? (propertyType as InputFieldType)
          : "data",
        required: property.getType().isNullable(),
        inputFieldName: propertyName,
      };
      propertyStructures.push(propertyStructure);
    });
  } else {
    const propertyType = parameter.getType().getText(parameter);
    const propertyStructure: InputPropertyStructure = {
      propertyName: parameter.getName(),
      modified: false,
      originalName: parameter.getName(),
      type: ["string", "boolean"].includes(propertyType)
        ? (propertyType as InputFieldType)
        : "data",
      required: parameter.getType().isNullable(),
      inputFieldName: `${parameter.getName()}InputField`,
    };
    propertyStructures.push(propertyStructure);
  }
  return propertyStructures;
};

export const writeInputs = async (
  { inputsFile }: ProjectStructure,
  inputs: InputPropertyStructure[],
): Promise<void> => {
  inputs.forEach((propertyStructure) => {
    const placeholder = inputsFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name: "genericActionInput", initializer: Writers.object({}) }],
    });
    const object = placeholder.getDeclarations()[0].getInitializer() as ObjectLiteralExpression;

    object.addPropertyAssignments([
      {
        name: "label",
        initializer: `"${pascalCase(propertyStructure.propertyName)}"`,
      },
      {
        name: "type",
        initializer: `"${propertyStructure.type}"`,
      },
      {
        name: "required",
        initializer: `${propertyStructure.required}`,
      },
    ]);

    inputsFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: propertyStructure.propertyName,
          initializer: `input(${object.print()})`,
        },
      ],
      isExported: true,
    });

    placeholder.remove();
  });
};
