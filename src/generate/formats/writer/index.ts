import { outputFile } from "fs-extra";
import { minBy } from "lodash-es";
import path from "path";
import { Project, ScriptKind, type SourceFile } from "ts-morph";
import { getWorkingDirectory } from "../../../command-context.js";
import {
  type Action,
  type Component,
  type Connection,
  createDescription,
  type Input,
  type Result,
} from "../utils.js";
import { writeActions } from "./actions.js";
import { writeConnections } from "./connections.js";

const writeComponentIndex = (
  project: Project,
  key: string,
  isPublic: boolean,
  { display: { label, description, iconPath } }: Component,
): SourceFile => {
  const documentationUrl = new URL(
    `/docs/components/${encodeURIComponent(key)}/`,
    "https://prismatic.io",
  );
  const file = project.createSourceFile(path.join("src", "index.ts"), undefined, {
    scriptKind: ScriptKind.TS,
  });

  file.addImportDeclarations([
    { moduleSpecifier: "@prismatic-io/spectral", namedImports: ["component"] },
    {
      moduleSpecifier: "@prismatic-io/spectral/dist/clients/http",
      namedImports: ["handleErrors"],
    },
    {
      moduleSpecifier: "./actions",
      defaultImport: "actions",
    },
    {
      moduleSpecifier: "./connections",
      defaultImport: "connections",
    },
  ]);

  file.addExportAssignment({
    isExportEquals: false,
    expression: (writer) =>
      writer
        .writeLine("component({")
        .writeLine(`key: "${key}",`)
        .conditionalWriteLine(isPublic, "public: true,")
        .conditionalWriteLine(isPublic, `documentationUrl: "${documentationUrl}",`)
        .writeLine("display: {")
        .writeLine(`label: "${label}",`)
        .writeLine(`description: "${createDescription(description)}",`)
        .conditionalWriteLine(isPublic, `category: "Application Connectors",`)
        .writeLine(`iconPath: "${iconPath}",`)
        .writeLine("},")
        .writeLine("hooks: { error: handleErrors },")
        .writeLine("actions,")
        .writeLine("connections,")
        .writeLine("})"),
  });

  return file;
};

const writeTests = (
  project: Project,
  key: string,
  connections: Connection[],
  [{ key: actionKey, inputs }]: Action[],
): SourceFile => {
  const connection = minBy(connections, ({ orderPriority }) => orderPriority);
  const connectionKey = connection?.key;

  const file = project.createSourceFile(path.join("src", "component.test.ts"), (writer) =>
    writer
      .writeLine(`import { testing } from "@prismatic-io/spectral";`)
      .conditionalWriteLine(
        Boolean(connectionKey),
        `import { ${connectionKey} } from "./connections";`,
      )
      .writeLine(`import component from ".";`)
      .blankLine()
      .writeLine(`describe("${key}", () => {`)
      .writeLine("const harness = testing.createHarness(component);")
      .conditionalWriteLine(
        Boolean(connectionKey),
        `const connection = harness.connectionValue(${connectionKey});`,
      )
      .blankLine()
      .writeLine(`it("should invoke action", async () => {`)
      .writeLine(`const result = await harness.action("${actionKey}", `)
      .block(() => {
        writer.conditionalWriteLine(Boolean(connectionKey), "connection,");
        Object.entries(inputs).forEach(([key, input]) => {
          const value = JSON.stringify((input as Input).default) ?? "undefined";
          writer.conditionalWriteLine(key !== "connection", `${key}: ${value},`);
        });
      })
      .writeLine(");")
      .writeLine("expect(result?.data).toBeDefined();")
      .writeLine("});")
      .writeLine("});"),
  );

  return file;
};

// These helpers return TypeScript source for the generated client's HTTP options.
const renderApiKeyOptions = ({ in: location, name }: NonNullable<Connection["apiKey"]>): string => {
  const value = "util.types.toString(connection.fields.apiKey)";
  switch (location) {
    case "query":
      return `params: { ${JSON.stringify(name)}: ${value} }`;
    case "cookie":
      return `headers: { Cookie: ${JSON.stringify(`${name}=`)} + encodeURIComponent(${value}) }`;
    case "header":
      return `headers: { ${JSON.stringify(name)}: ${value} }`;
  }
};

const renderAuthenticationOptions = (connection: Connection): string => {
  if (connection.apiKey) return renderApiKeyOptions(connection.apiKey);

  if (connection.oauth2Type) {
    return 'headers: { Authorization: "Bearer " + util.types.toString(connection.token?.access_token) }';
  }

  if ("username" in connection.inputs) {
    const username = "util.types.toString(connection.fields.username)";
    const password = "util.types.toString(connection.fields.password)";
    const credentials = `Buffer.from(${username} + ":" + ${password}).toString("base64")`;
    return `headers: { Authorization: "Basic " + ${credentials} }`;
  }

  return 'headers: { Authorization: "Bearer " + util.types.toString(connection.fields.apiKey) }';
};

const renderClientCase = (connection: Connection): string => {
  const options = renderAuthenticationOptions(connection);
  return `case ${JSON.stringify(connection.key)}: return createHttpClient({ baseUrl, responseType: "json", ${options} });`;
};

const writeClient = (project: Project, baseUrl: string, connections: Connection[]): SourceFile => {
  const branches = connections.map(renderClientCase);
  return project.createSourceFile(
    path.join("src", "client.ts"),
    `
import { Buffer } from "node:buffer";
import { Connection, ConnectionError, util } from "@prismatic-io/spectral";
import { HttpClient, createClient as createHttpClient } from "@prismatic-io/spectral/dist/clients/http";
export const baseUrl = ${JSON.stringify(baseUrl)};
export const createClient = async (connection?: Connection): Promise<HttpClient> => {
  if (!connection) return createHttpClient({ baseUrl, responseType: "json" });
  switch (connection.key) {
    ${branches.join("\n")}
    default: throw new ConnectionError(connection, "Received unexpected connection type: " + connection.key);
  }
};`,
    { scriptKind: ScriptKind.TS },
  );
};

const writeDocumentationFiles = (
  project: Project,
  component: Component,
  connections: Connection[],
): SourceFile[] => {
  project.createDirectory("documentation");

  const descriptionFile = project.createSourceFile(
    path.join("documentation", "description.mdx"),
    (writer) => writer.writeLine(component.display.description),
  );

  if (connections.length > 0) {
    project.createDirectory(path.join("documentation", "connections"));
  }

  const connectionFiles = connections.map((connection) =>
    project.createSourceFile(
      path.join("documentation", "connections", `${connection.key}.mdx`),
      (writer) => writer.blankLine(),
    ),
  );

  return [descriptionFile, ...connectionFiles];
};

export const write = async (
  key: string,
  isPublic: boolean,
  { baseUrl, component, actions, connections }: Result,
): Promise<Project> => {
  const project = new Project({ useInMemoryFileSystem: true });
  project.createDirectory("src");

  writeConnections(project, connections);
  writeActions(project, actions);
  writeClient(project, baseUrl, connections);
  writeComponentIndex(project, key, isPublic, component);
  writeTests(project, key, connections, actions);

  if (isPublic) {
    writeDocumentationFiles(project, component, connections);
  }

  await project.save();
  const virtualRoot = project.getFileSystem().getCurrentDirectory();
  await Promise.all(
    project
      .getSourceFiles()
      .map((file) =>
        outputFile(
          path.resolve(getWorkingDirectory(), path.relative(virtualRoot, file.getFilePath())),
          file.getFullText(),
        ),
      ),
  );

  return project;
};
