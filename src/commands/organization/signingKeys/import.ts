import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { readFile } from "node:fs/promises";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description:
    "Import a RSA public key for use with embedded marketplace.\nYou can use openssl to generate a new RSA key pair and import the public key.",
  examples: [
    {
      description: "Generate an RSA private key using openssl:",
      command: "openssl genrsa -out my-private-key.pem 4096",
    },
    {
      description: "Generate the associated RSA public key:",
      command: "openssl rsa -in my-private-key.pem -pubout > my-public-key.pub",
    },
    {
      description: "Import the public key:",
      command: "<%= config.bin %> <%= command.id %> -p my-public-key.pub",
    },
  ],
  options: {
    "public-key-file": option.string({
      char: "p",
      required: true,
      description: "public key file",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { "public-key-file": publicKeyFile },
    } = commandInput();

    const publicKey = await readFile(publicKeyFile, {
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

    commandOutput.log(result.importOrganizationSigningKey.organizationSigningKey.id);
  },
});
