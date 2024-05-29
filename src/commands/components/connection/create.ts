import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql.js";
import { parseJsonOrUndefined } from "../../../fields.js";

export default class CreateCommand extends Command {
  static description = "Create a Connection Template";
  static flags = {
    connection: Flags.string({
      char: "c",
      required: true,
      description: "The Connection from which this template is structured",
    }),
    name: Flags.string({
      char: "n",
      required: true,
      description: "Name of your Connection Template",
    }),
    presets: Flags.string({
      required: true,
      char: "p",
      description: "The input presets associated with this template",
    }),
    clientMutationId: Flags.string({
      char: "m",
      required: false,
      description: "A unique identifier for the client performing the mutation",
    }),
  };

  async run() {
    const {
      flags: { name, connection, clientMutationId, presets },
    } = await this.parse(CreateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation createConnectionTemplate(
          $connection: ID!
          $name: String!
          $presets: [ConnectionTemplateField]!
          $clientMutationId: String
        ) {
          createConnectionTemplate(
            input: {
              connection: $connection
              name: $name
              presets: $presets
              clientMutationId: $clientMutationId
            }
          ) {
            connectionTemplate {
              id
            }
            clientMutationId
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        connection,
        name,
        presets: parseJsonOrUndefined(presets),
        clientMutationId,
      },
    });

    this.log(result.createConnectionTemplate.connectionTemplate.id);
  }
}
