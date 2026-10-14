import { readFile } from "node:fs/promises";
import { parse } from "graphql";
import { glob } from "tinyglobby";
import { describe, expect, it } from "vitest";

const readFiles = async (patterns: string[], ignore: string[] = []) =>
  Promise.all(
    (await glob(patterns, { ignore: ["**/temp/**", ...ignore] })).map(async (path) => ({
      path,
      source: await readFile(path, "utf8"),
    })),
  );

describe("GraphQL document generation", () => {
  it("keeps every static production operation in a separate document", async () => {
    const sources = await readFiles(
      ["src/**/*.ts"],
      ["src/**/*.test.ts", "src/**/*.generated.ts", "src/graphql.ts"],
    );

    for (const { path, source } of sources) {
      expect(source, `${path} contains an inline GraphQL document`).not.toContain("gql`");
      expect(source, `${path} imports a raw GraphQL document`).not.toMatch(
        /from ["'][^"']+\.graphql["']/,
      );
    }
  });

  it("gives every document one uniquely named operation and generated typed node", async () => {
    const documents = await readFiles(["src/graphql/**/*.graphql"]);
    const names = new Map<string, string>();

    for (const { path, source } of documents) {
      const operations = parse(source).definitions.filter(
        (definition) => definition.kind === "OperationDefinition",
      );
      expect(operations, path).toHaveLength(1);
      const name = operations[0]?.name?.value;
      expect(name, `${path} has an anonymous operation`).toBeTruthy();
      expect(names.get(name ?? ""), `${name} is also declared in ${names.get(name ?? "")}`).toBe(
        undefined,
      );
      names.set(name ?? "", path);

      const generated = await readFile(path.replace(/\.graphql$/, ".generated.ts"), "utf8");
      expect(generated, `${path} has no typed document node`).toContain("TypedDocumentNode");
      expect(generated, `${path} leaks the legacy Scalars lookup`).not.toContain("Scalars[");
    }
  });

  it("does not expose generated scalar lookup types to application code", async () => {
    const sources = await readFiles(["src/**/*.ts"], ["src/**/*.test.ts", "src/**/*.generated.ts"]);
    for (const { path, source } of sources) {
      expect(source, path).not.toContain("Scalars[");
    }
  });
});
