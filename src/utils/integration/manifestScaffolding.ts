import { readdir, rm, rmdir } from "node:fs/promises";
import path from "node:path";
import { IndentationText, Node, Project, QuoteKind, type SourceFile, SyntaxKind } from "ts-morph";
import { ValidationError } from "../../errors.js";
import { exists } from "../../fs.js";
import { REGISTRY_FILE } from "./componentRegistry.js";
import { manifestDirectory, manifestsDirectory } from "./manifests.js";

function fail(message: string): never {
  throw new ValidationError({ message });
}

export const validateManifestKeys = (keys: string[]) => {
  for (const key of keys) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(key)) {
      fail(`Invalid manifest key '${key}'. Use a component key without path separators.`);
    }
  }
};

const within = (file: string, directory: string) => {
  const relative = path.relative(directory, file);
  return !path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`);
};

const openProject = (root: string) => {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Double,
      useTrailingCommas: true,
    },
  });
  project.addSourceFilesAtPaths([
    path.join(root, "**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"),
    path.join(root, ".spectral/**/*.ts"),
    `!${path.join(root, "node_modules/**")}`,
    `!${path.join(root, "dist/**")}`,
    `!${path.join(root, "build/**")}`,
  ]);
  return project;
};

const integrationObject = (source: SourceFile) => {
  const imported = source
    .getImportDeclarations()
    .find(
      (i) =>
        i.getModuleSpecifierValue() === "@prismatic-io/spectral" ||
        i.getModuleSpecifierValue() === "@prismatic-io/spectral/integration",
    )
    ?.getNamedImports()
    .find((i) => i.getName() === "integration");
  const name = imported?.getAliasNode()?.getText() ?? imported?.getName();
  const calls = source
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((call) => call.getExpression().getText() === name);
  const argument = calls.length === 1 ? calls[0].getArguments()[0] : undefined;
  if (!Node.isObjectLiteralExpression(argument))
    return fail(
      "Cannot update src/index.ts: expected one integration({...}) call. Wire manifest support manually before adding manifests.",
    );
  return argument;
};

/** Prepare in memory so unsupported source layouts fail before generation or edits. */
export const prepareManifestScaffolding = async (root: string): Promise<() => Promise<void>> => {
  if (await exists(path.join(root, REGISTRY_FILE))) return async () => {};
  const project = openProject(root);
  const entry = project.getSourceFile(path.join(root, "src/index.ts"));
  const types = project.getSourceFile(path.join(root, ".spectral/index.ts"));
  if (!entry || !types)
    return fail(
      "Cannot enable manifests: expected src/index.ts and .spectral/index.ts. Add the registry, integration componentRegistry property, and Spectral type augmentation manually.",
    );
  const definition = integrationObject(entry);
  if (
    definition.getProperty("componentRegistry") ||
    /\bcomponentRegistry\b/.test(entry.getText()) ||
    /\b(?:ComponentRegistry|TComponentRegistry|IntegrationDefinitionComponentRegistry|componentRegistry)\b/.test(
      types.getText(),
    )
  ) {
    return fail(
      "Manifest wiring already exists without src/componentRegistry.ts. Repair that wiring before adding a manifest.",
    );
  }
  const augmentation = types.getModule('"@prismatic-io/spectral"');
  if (!augmentation)
    return fail("Cannot enable manifests: .spectral/index.ts has no Spectral module augmentation.");
  entry.addImportDeclaration({
    moduleSpecifier: "./componentRegistry",
    namedImports: ["componentRegistry"],
  });
  entry.addExportDeclaration({
    moduleSpecifier: "./componentRegistry",
    namedExports: ["componentRegistry"],
  });
  definition.addShorthandPropertyAssignment({ name: "componentRegistry" });
  types.addImportDeclaration({
    moduleSpecifier: "../src",
    namedImports: ["componentRegistry"],
    isTypeOnly: true,
  });
  types.addTypeAlias({ name: "TComponentRegistry", type: "typeof componentRegistry" });
  augmentation.addInterface({
    name: "IntegrationDefinitionComponentRegistry",
    extends: ["TComponentRegistry"],
  });
  const registry = project.createSourceFile(
    path.join(root, REGISTRY_FILE),
    'import { componentManifests } from "@prismatic-io/spectral";\n\nexport const componentRegistry = componentManifests({});\n',
  );
  return async () => {
    await registry.save();
    await entry.save();
    await types.save();
  };
};

const removeNamedImport = (source: SourceFile, name: string) => {
  const eligibleImports = () =>
    source
      .getImportDeclarations()
      .filter((declaration) =>
        (name === "ComponentManifest"
          ? ["@prismatic-io/spectral"]
          : ["./componentRegistry", "../src"]
        ).includes(declaration.getModuleSpecifierValue()),
      );
  // Remove the optional-import directive emitted by older scaffolds as well.
  const directives = eligibleImports().flatMap((declaration) =>
    declaration
      .getNamedImports()
      .filter((specifier) => specifier.getName() === name && !specifier.getAliasNode())
      .flatMap((specifier) =>
        specifier
          .getLeadingCommentRanges()
          .filter((comment) => comment.getText().trim() === "// @ts-ignore")
          .map((comment) => [comment.getPos(), comment.getEnd()] as const),
      ),
  );
  for (const [start, end] of directives.reverse()) source.replaceText([start, end], "");
  for (const declaration of eligibleImports()) {
    const matches = declaration
      .getNamedImports()
      .filter((specifier) => specifier.getName() === name && !specifier.getAliasNode());
    if (!matches.length) continue;
    for (const specifier of matches) specifier.remove();
    if (
      !declaration.getNamedImports().length &&
      !declaration.getDefaultImport() &&
      !declaration.getNamespaceImport()
    )
      declaration.remove();
  }
};

/** Remove selected local manifests only after all source edits and usage checks succeed. */
export const removeManifests = async (root: string, keys: string[]) => {
  validateManifestKeys(keys);
  keys = [...new Set(keys)];
  const directories = keys.map((key) => manifestDirectory(root, key));
  for (const directory of directories) {
    if (!(await exists(path.join(directory, "index.ts"))))
      fail(`No installed manifest exists at ${path.relative(root, directory)}.`);
  }
  const project = openProject(root);
  const registry = project.getSourceFile(path.join(root, REGISTRY_FILE));
  const aliases = new Set<string>();
  if (registry) {
    const declaration = registry.getVariableDeclaration("componentRegistry");
    const call = declaration?.getInitializer();
    const object = Node.isCallExpression(call) ? call.getArguments()[0] : undefined;
    if (
      !Node.isCallExpression(call) ||
      call.getExpression().getText() !== "componentManifests" ||
      call.getArguments().length !== 1 ||
      !Node.isObjectLiteralExpression(object) ||
      object
        .getProperties()
        .some(
          (p) =>
            (!Node.isPropertyAssignment(p) && !Node.isShorthandPropertyAssignment(p)) ||
            ((Node.isPropertyAssignment(p) || Node.isShorthandPropertyAssignment(p)) &&
              Node.isComputedPropertyName(p.getNameNode())),
        )
    )
      fail(
        "Cannot safely remove manifests from a customized componentRegistry. Remove its references manually first.",
      );
    for (const key of keys) {
      const imports = registry.getImportDeclarations().filter(
        (i) =>
          i
            .getModuleSpecifierValue()
            .replace(/\.(js|ts)$/, "")
            .replace(/\/index$/, "") === `./manifests/${key}`,
      );
      for (const imported of imports) {
        const local = imported.getDefaultImport()?.getText();
        if (!local || imported.getNamedImports().length || imported.getNamespaceImport())
          fail(`Cannot safely remove the customized import for '${key}'.`);
        for (const property of object.getProperties()) {
          if (
            (Node.isShorthandPropertyAssignment(property) && property.getName() === local) ||
            (Node.isPropertyAssignment(property) && property.getInitializer()?.getText() === local)
          ) {
            aliases.add(property.getName().replace(/^["']|["']$/g, ""));
            property.remove();
          }
        }
        imported.remove();
        if (registry.getDescendantsOfKind(SyntaxKind.Identifier).some((n) => n.getText() === local))
          fail(`Manifest '${key}' is still used in componentRegistry.ts.`);
      }
    }
  }
  // Check direct imports, re-exports, require/dynamic imports, and registry action references.
  for (const source of project.getSourceFiles()) {
    if (directories.some((dir) => within(source.getFilePath(), dir))) continue;
    if (
      source !== registry &&
      ![path.join(root, "src/index.ts"), path.join(root, ".spectral/index.ts")].includes(
        path.normalize(source.getFilePath()),
      ) &&
      source
        .getImportDeclarations()
        .some((declaration) =>
          declaration
            .getNamedImports()
            .some((specifier) => specifier.getName() === "componentRegistry"),
        )
    )
      fail(
        `A componentRegistry reference remains in ${path.relative(root, source.getFilePath())}. Remove it before removing manifests.`,
      );
    for (const literal of source.getDescendantsOfKind(SyntaxKind.StringLiteral)) {
      const value = literal.getLiteralValue();
      const resolved = value.startsWith(".")
        ? path.resolve(path.dirname(source.getFilePath()), value)
        : "";
      if (
        directories.some(
          (dir) => within(resolved, dir) || resolved === `${dir}.ts` || resolved === `${dir}.js`,
        ) ||
        keys.some((key) => value.includes(`/manifests/${key}`))
      )
        fail(
          `Manifest is still referenced in ${path.relative(root, source.getFilePath())}. Remove its usages before removing the manifest.`,
        );
    }
    for (const property of source.getDescendantsOfKind(SyntaxKind.PropertyAssignment)) {
      const value = property.getInitializer();
      if (
        property.getName() === "component" &&
        Node.isStringLiteral(value) &&
        aliases.has(value.getLiteralValue())
      )
        fail(
          `Manifest '${value.getLiteralValue()}' is still referenced in ${path.relative(root, source.getFilePath())}.`,
        );
    }
    for (const binding of source.getDescendantsOfKind(SyntaxKind.BindingElement)) {
      if ((binding.getPropertyNameNode()?.getText() ?? binding.getName()) === "components")
        fail(
          `Destructured components remain in ${path.relative(root, source.getFilePath())}. Remove manifest usages before removal.`,
        );
    }
    for (const access of source.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)) {
      if (
        access.getName() === "components" &&
        !Node.isPropertyAccessExpression(access.getParent()) &&
        !Node.isElementAccessExpression(access.getParent())
      )
        fail(
          `A components reference remains in ${path.relative(root, source.getFilePath())}. Remove manifest usages before removal.`,
        );
      if (
        aliases.has(access.getName()) &&
        /(?:components|componentRegistry)$/.test(access.getExpression().getText())
      )
        fail(
          `Manifest '${access.getName()}' is still used in ${path.relative(root, source.getFilePath())}.`,
        );
    }
    for (const access of source.getDescendantsOfKind(SyntaxKind.ElementAccessExpression)) {
      const arg = access.getArgumentExpression();
      if (
        /(?:components|componentRegistry)$/.test(access.getExpression().getText()) &&
        (!Node.isStringLiteral(arg) || aliases.has(arg.getLiteralValue()))
      )
        fail(
          `A manifest registry lookup remains in ${path.relative(root, source.getFilePath())}. Remove it before removing manifests.`,
        );
    }
  }
  const declaration = registry?.getVariableDeclaration("componentRegistry");
  const call = declaration?.getInitializer();
  const object = Node.isCallExpression(call) ? call.getArguments()[0] : undefined;
  const otherDirectories = (await readdir(manifestsDirectory(root))).filter(
    (name) => !keys.includes(name),
  );
  const cleanup =
    !!registry &&
    Node.isObjectLiteralExpression(object) &&
    object.getProperties().length === 0 &&
    otherDirectories.length === 0;
  const changed: SourceFile[] = registry ? [registry] : [];
  if (cleanup) {
    const statements = registry.getStatements();
    if (
      statements.some(
        (s) => !Node.isImportDeclaration(s) && s !== declaration?.getVariableStatement(),
      ) ||
      registry.getVariableDeclarations().length !== 1 ||
      registry
        .getImportDeclarations()
        .some(
          (i) =>
            i.getModuleSpecifierValue() !== "@prismatic-io/spectral" ||
            i.getNamedImports().some((n) => n.getName() !== "componentManifests"),
        )
    )
      fail(
        "The empty registry contains custom code. Move that code before removing the final manifest.",
      );
    const entry = project.getSourceFile(path.join(root, "src/index.ts"));
    const types = project.getSourceFile(path.join(root, ".spectral/index.ts"));
    if (!entry || !types)
      fail("Cannot clean up manifest scaffolding: src/index.ts or .spectral/index.ts is missing.");
    const property = integrationObject(entry).getProperty("componentRegistry");
    if (
      property &&
      !Node.isShorthandPropertyAssignment(property) &&
      (!Node.isPropertyAssignment(property) ||
        property.getInitializer()?.getText() !== "componentRegistry")
    )
      fail(
        "The integration uses a customized componentRegistry property. Remove it manually first.",
      );
    property?.remove();
    removeNamedImport(entry, "componentRegistry");
    for (const exp of entry.getExportDeclarations()) {
      for (const specifier of exp.getNamedExports())
        if (specifier.getName() === "componentRegistry" && !specifier.getAliasNode())
          specifier.remove();
      if (!exp.getNamedExports().length && exp.getModuleSpecifierValue() === "./componentRegistry")
        exp.remove();
    }
    const augmentation = types.getModule('"@prismatic-io/spectral"');
    const iface = augmentation?.getInterface("IntegrationDefinitionComponentRegistry");
    if (iface?.getMembers().length)
      fail("The manifest type augmentation has custom members. Remove them manually first.");
    if (
      iface
        ?.getExtends()
        .some((base) => !["TComponentRegistry", "ComponentRegistry"].includes(base.getText()))
    )
      fail("The manifest type augmentation has custom base types. Remove them manually first.");
    iface?.remove();
    for (const name of ["TComponentRegistry", "ComponentRegistry"]) {
      const alias = types.getTypeAlias(name);
      if (!alias) continue;
      const type = alias.getTypeNode()?.getText().replace(/\s/g, "");
      if (
        type !== "typeofcomponentRegistry" &&
        type !==
          "IsAny<typeofcomponentRegistry>extendstrue?{[key:string]:ComponentManifest}:typeofcomponentRegistry"
      )
        fail(`The ${name} type has been customized. Remove it manually first.`);
      alias.remove();
    }
    removeNamedImport(types, "componentRegistry");
    removeNamedImport(types, "ComponentManifest");
    for (const source of project.getSourceFiles()) {
      if (source === registry || directories.some((dir) => within(source.getFilePath(), dir)))
        continue;
      if (
        /\b(?:componentRegistry|ComponentRegistry|TComponentRegistry|IntegrationDefinitionComponentRegistry|ComponentManifest)\b/.test(
          source.getText(),
        )
      )
        fail(
          `Manifest scaffolding is still referenced in ${path.relative(root, source.getFilePath())}. Remove those references first.`,
        );
    }
    changed.push(entry, types);
  }
  for (const source of changed) if (!cleanup || source !== registry) await source.save();
  for (const directory of directories) await rm(directory, { recursive: true });
  if (cleanup) await rm(path.join(root, REGISTRY_FILE));
  if ((await readdir(manifestsDirectory(root))).length === 0) await rmdir(manifestsDirectory(root));
  return {
    items: keys.map((key) => ({ key, path: path.relative(root, manifestDirectory(root, key)) })),
    scaffoldingRemoved: cleanup,
  };
};
