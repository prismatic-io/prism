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
});
