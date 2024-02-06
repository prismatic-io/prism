import { Command } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";

export default class CreateCommand extends Command {
  static description =
    "Create a short-lived JWT that may be used to perform registration of an On-Premise Resource.";
  static flags = {};

  async run() {
    const result = await gqlRequest({
      document: gql`
        mutation createOnPremiseResourceJWT {
          createOnPremiseResourceJWT(input: {}) {
            result {
              jwt
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {},
    });

    this.log(result.createOnPremiseResourceJWT.result.jwt);
  }
}
