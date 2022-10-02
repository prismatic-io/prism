import { Command, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class UpdateCommand extends Command {
  // TODO: Add more flags once optional updates are implemented
  static description = "Update an Instance";
  static args = [
    {
      name: "instance",
      required: true,
      description: "ID of an instance",
    },
  ];

  static flags = {
    name: Flags.string({
      char: "n",
      description: "Name of the instance",
    }),
    description: Flags.string({
      char: "d",
      description: "Description for the instance",
    }),
  };

  async run() {
    const {
      args: { instance },
      flags: { name, description },
    } = await this.parse(UpdateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation updateInstance($id: ID!, $name: String, $description: String) {
          updateInstance(
            input: { id: $id, name: $name, description: $description }
          ) {
            instance {
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
        id: instance,
        name: name,
        description: description,
      },
    });

    this.log(result.updateInstance.instance.id);
  }
}
