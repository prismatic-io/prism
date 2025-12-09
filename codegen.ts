import type { CodegenConfig } from "@graphql-codegen/cli";

const schemaUrl = new URL("/api", process.env.PRISMATIC_URL).toString();

const config: CodegenConfig = {
  overwrite: true,
  emitLegacyCommonJSImports: false,
  schema: [
    {
      [schemaUrl]: {
        headers: {
          Authorization: `Bearer ${process.env.GRAPHQL_AUTH_KEY}`,
        },
      },
    },
  ],
  documents: ["src/**/*.graphql"],
  generates: {
    // Base schema types only
    "src/generated/graphql.ts": {
      plugins: ["typescript"],
    },
    // Operation types + documents co-located with .graphql files
    "src/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".generated.ts",
        baseTypesPath: "generated/graphql.js",
      },
      plugins: ["typescript-operations", "typed-document-node"],
    },
  },
};

export default config;
