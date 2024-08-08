import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { readFileSync } from "fs";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ImportCommand extends PrismaticBaseCommand {
  static description = "Import a RSA public key for use with embedded marketplace";

  static flags = {
    "public-key-file": Flags.string({
      char: "p",
      required: true,
      description: "public key file",
    }),
  };

  async run() {
    const {
      flags: { "public-key-file": publicKeyFile },
    } = await this.parse(ImportCommand);

    const publicKey = await readFileSync(publicKeyFile, {
      encoding: "utf-8",
      flag: "r",
    });

    const result = await gqlRequest({
      document: gql`
        mutation importPublicKey($publicKey: String!) {
          importOrganizationSigningKey(input: { publicKey: $publicKey }) {
            organizationSigningKey {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: { publicKey },
    });

    this.log(result.importOrganizationSigningKey.organizationSigningKey.id);
  }
}
