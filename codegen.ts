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
  documents: ["src/graphql/**/*.ts"],
  generates: {
    // Base schema types (enums, scalars, input types)
    "src/graphql/schema.generated.ts": {
      plugins: ["typescript"],
    },
    // Operation types co-located with query files
    "src/graphql/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".generated.ts",
        baseTypesPath: "schema.generated.js",
      },
      plugins: ["typescript-operations"],
    },
  },
};

export default config;
