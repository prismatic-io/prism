import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gqlRequest, gql } from "../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an On-Premise Resource";
  static args = {
    resource: Args.string({
      required: true,
      description: "ID of the On-Premise Resource to delete",
    }),
  };

  async run() {
    const {
      args: { resource },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: gql`
        mutation deleteOnPremiseResource($id: ID!) {
          deleteOnPremiseResource(input: { id: $id }) {
            onPremiseResource {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        id: resource,
      },
    });
  }
}
