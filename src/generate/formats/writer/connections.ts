import { OAuth2Type } from "@prismatic-io/spectral";
import { sortBy } from "lodash-es";
import {
  CodeBlockWriter,
  Project,
  ScriptKind,
  SourceFile,
  StructureKind,
  VariableDeclarationKind,
  VariableDeclarationStructure,
} from "ts-morph";
import { Connection, ConnectionInput, cleanIdentifier, escapeText } from "../utils.js";
import path from "path";

const writeInput = (
  writer: CodeBlockWriter,
  key: string,
  {
    label,
    type,
    comments,
    default: defaultValue,
    example,
    placeholder,
    shown,
    required,
  }: ConnectionInput,
): CodeBlockWriter =>
  writer
    .writeLine(`${key}: {`)
    .writeLine(`label: "${label}",`)
    .writeLine(`type: "${type}",`)
    .conditionalWriteLine(required !== undefined, `required: ${required},`)
    .conditionalWriteLine(shown !== undefined, `shown: ${shown},`)
    .conditionalWriteLine(placeholder !== undefined, `placeholder: "${placeholder}",`)
    .conditionalWriteLine(defaultValue !== undefined, `default: "${defaultValue}",`)
    .conditionalWriteLine(example !== undefined, `example: "${example}",`)
    .conditionalWriteLine(comments !== undefined, `comments: "${escapeText(comments)}",`)
    .writeLine("},");

const buildConnectionDeclaration = ({
  key,
  display,
  oauth2Type,
  inputs,
}: Connection): VariableDeclarationStructure => {
  const { label, description, icons } = display;
  const connectionFn = oauth2Type === undefined ? "connection" : "oauth2Connection";

  return {
    kind: StructureKind.VariableDeclaration,
    name: key,
    leadingTrivia: (writer) => writer.blankLine(),
    trailingTrivia: (writer) => writer.blankLine(),
    initializer: (writer) =>
      writer
        .writeLine(`${connectionFn}({`)
        .writeLine(`key: "${key}",`)
        .write("display: ")
        .block(() => {
          writer
            .writeLine(`label: "${label}",`)
            .writeLine(`description: "${escapeText(description)}",`)
            .write("icons: ")
            .block(() => {
              writer
                .conditionalWriteLine(
                  icons?.avatarPath !== undefined,
                  `avatarPath: "${icons?.avatarPath}",`,
                )
                .conditionalWriteLine(
                  icons?.oauth2ConnectionIconPath !== undefined,
                  `oauth2ConnectionIconPath: "${icons?.oauth2ConnectionIconPath}",`,
                );
            });
        })
        .writeLine(",")
        .conditionalWriteLine(oauth2Type !== undefined, () => {
          if (oauth2Type === OAuth2Type.AuthorizationCode) {
            return "oauth2Type: OAuth2Type.AuthorizationCode,";
          }
          if (oauth2Type === OAuth2Type.ClientCredentials) {
            return "oauth2Type: OAuth2Type.ClientCredentials,";
          }
          throw new Error(`Unexpected OAuth2Type: ${oauth2Type}`);
        })
        .write("inputs: ")
        .block(() =>
          Object.entries(inputs).forEach(([key, input]) => writeInput(writer, key, input)),
        )
        .writeLine("})"),
  };
};

export const writeConnections = (project: Project, connections: Connection[]): SourceFile => {
  const file = project.createSourceFile(path.join("src", "connections.ts"), undefined, {
    scriptKind: ScriptKind.TS,
  });

  const namedImports: string[] = [];

  const hasNonOAuth2Connection = connections.some(({ oauth2Type }) => oauth2Type === undefined);
  if (hasNonOAuth2Connection) {
    namedImports.push("connection");
  }

  const hasOAuth2Connection = connections.some(({ oauth2Type }) => oauth2Type !== undefined);
  if (hasOAuth2Connection) {
    namedImports.push("oauth2Connection", "OAuth2Type");
  }

  file.addImportDeclaration({
    moduleSpecifier: "@prismatic-io/spectral",
    namedImports,
  });

  for (const connection of connections) {
    connection.key = cleanIdentifier(connection.key);
  }

  const sortedConnectionKeys = sortBy(connections, ({ orderPriority }) => orderPriority).map(
    ({ key }) => key,
  );

  const declarations = connections.map(buildConnectionDeclaration);
  file.addVariableStatements(
    declarations.map((decl) => ({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [decl],
      isExported: true,
    })),
  );

  file.addExportAssignment({
    isExportEquals: false,
    expression: (writer) => writer.write("[").write(sortedConnectionKeys.join(", ")).write("]"),
  });

  return file;
};
