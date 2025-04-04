import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { load, dump } from "js-yaml";
import { existsSync } from "node:fs";
import { camelCase } from "lodash-es";
import { writeFileSync } from "fs-extra";

const DEFAULT_DEFINITION_VERSION = 7;

export default class IntegrationDownloadYamlCommand extends PrismaticBaseCommand {
  static description = "Download the YAML for an integration.";

  static flags = {
    version: Flags.boolean({
      char: "v",
      description: "Definition version.",
    }),
    filename: Flags.boolean({
      char: "f",
      description: "Filename to write to.",
    }),
  };

  static args = {
    integration: Args.string({
      required: true,
      description: "ID of an integration",
    }),
  };

  async run() {
    const {
      flags,
      args: { integration },
    } = await this.parse(IntegrationDownloadYamlCommand);

    const result = await gqlRequest({
      document: gql`
        query getIntegrationDefinition($integrationId: ID!, $version: Int!) {
          integration(id: $integrationId) {
            id
            name
            definition(version: $version)
          }
        }
      `,
      variables: {
        integrationId: integration,
        version: flags.version || DEFAULT_DEFINITION_VERSION,
      },
    });

    const definitionObject = load(result.integration.definition) as object;
    const definitionYaml = dump(definitionObject, { lineWidth: -1 });
    const fileName = `${
      flags.filename || camelCase(result.integration.name) || result.integration.id
    }.yaml`;

    const fileExists = existsSync(fileName);
    if (fileExists) {
      throw `
A file named ${fileName} already exists in this folder.
Rename it or use the -f flag to specify a different name for your downloaded YAML definition file.`;
    }

    writeFileSync(fileName, definitionYaml);
    console.log(`
YAML definition successfully downloaded to ${fileName}.`);
  }
}
