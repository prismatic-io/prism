import type { CodegenConfig } from "@graphql-codegen/cli";

const schemaUrl = new URL("/api", process.env.PRISMATIC_URL).toString();

const config: CodegenConfig = {
  overwrite: true,
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
    "src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
    },
  },
};

export default config;
