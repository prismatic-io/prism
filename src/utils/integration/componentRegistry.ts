import path from "node:path";
import { IndentationText, NewLineKind, Node, Project, QuoteKind, type SourceFile } from "ts-morph";
import { exists } from "../../fs.js";
import { cleanIdentifier, isIdentifier } from "../identifier.js";

export const REGISTRY_FILE = path.join("src", "componentRegistry.ts");

export type RegistrationOutcome = "registered" | "unchanged" | "unsupported";

export interface RegistryLines {
  importLine: string;
  propertyLine: string;
}

export const manifestModuleSpecifier = (componentKey: string) => `./manifests/${componentKey}`;

export const registryLines = (componentKey: string): RegistryLines => {
  const localName = cleanIdentifier(componentKey);
  const property = localName === componentKey ? localName : `"${componentKey}": ${localName}`;
  return {
    importLine: `import ${localName} from "${manifestModuleSpecifier(componentKey)}";`,
    propertyLine: `${property},`,
  };
};

const openRegistry = async (projectDir: string): Promise<SourceFile | undefined> => {
  const file = path.join(projectDir, REGISTRY_FILE);
  if (!(await exists(file))) return undefined;
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Double,
      useTrailingCommas: true,
    },
  });
  const source = project.addSourceFileAtPath(file);
  if (source.getFullText().includes("\r\n")) {
    project.manipulationSettings.set({ newLineKind: NewLineKind.CarriageReturnLineFeed });
  }
  return source;
};

const registryObject = (source: SourceFile) => {
  const declaration = source.getVariableDeclaration("componentRegistry");
  const initializer = declaration?.getInitializer();
  if (!Node.isCallExpression(initializer)) return undefined;
  const [argument] = initializer.getArguments();
  if (!Node.isObjectLiteralExpression(argument)) return undefined;
  return argument;
};

const propertyKey = (property: Node): string | undefined => {
  if (Node.isShorthandPropertyAssignment(property)) return property.getName();
  if (Node.isPropertyAssignment(property)) {
    const name = property.getNameNode();
    if (Node.isStringLiteral(name)) return name.getLiteralValue();
    return property.getName();
  }
  return undefined;
};

export const registeredManifestKeys = async (
  projectDir: string,
): Promise<Set<string> | undefined> => {
  const source = await openRegistry(projectDir);
  if (!source) return undefined;
  const object = registryObject(source);
  if (!object) return undefined;
  const keys = new Set<string>();
  for (const property of object.getProperties()) {
    const key = propertyKey(property);
    if (key) keys.add(key);
  }
  return keys;
};

export const registerManifest = async (
  projectDir: string,
  componentKey: string,
): Promise<RegistrationOutcome> => {
  const source = await openRegistry(projectDir);
  if (!source) return "unsupported";
  const object = registryObject(source);
  if (!object) return "unsupported";

  const properties = object.getProperties();
  if (properties.some((property) => propertyKey(property) === componentKey)) return "unchanged";

  const specifier = manifestModuleSpecifier(componentKey);
  const currentImport = source.getImportDeclaration(
    (declaration) => declaration.getModuleSpecifierValue() === specifier,
  );
  const reusedName = currentImport?.getDefaultImport()?.getText();
  if (currentImport && (reusedName === undefined || currentImport.isTypeOnly())) {
    return "unsupported";
  }
  const localName = reusedName ?? cleanIdentifier(componentKey);
  if (!isIdentifier(localName)) return "unsupported";
  if (!currentImport) {
    if (source.getLocal(localName)) return "unsupported";
    source.addImportDeclaration({ defaultImport: localName, moduleSpecifier: specifier });
  }

  if (properties.length === 0) {
    for (const element of object.getPropertiesWithComments()) {
      if (Node.isCommentNode(element)) element.remove();
    }
  }
  if (localName === componentKey) {
    object.addShorthandPropertyAssignment({ name: localName });
  } else {
    object.addPropertyAssignment({ name: `"${componentKey}"`, initializer: localName });
  }

  await source.save();
  return "registered";
};
