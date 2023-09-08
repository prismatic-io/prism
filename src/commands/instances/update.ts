import { Command, Args, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class UpdateCommand extends Command {
  // TODO: Add more flags once optional updates are implemented
  static description = "Update an Instance";
  static args = {
    instance: Args.string({
      required: true,
      description: "ID of an instance",
    }),
  };

  static flags = {
    name: Flags.string({
      char: "n",
      description: "Name of the instance",
    }),
    description: Flags.string({
      char: "d",
      description: "Description for the instance",
    }),
    version: Flags.string({
      char: "v",
      description: "ID of integration version",
    }),
    deploy: Flags.boolean({
      description: "Deploy the instance after updating",
    }),
  };

  async run() {
    const {
      args: { instance },
      flags: { name, description, version, deploy },
    } = await this.parse(UpdateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation updateInstance(
          $id: ID!
          $name: String
          $description: String
          $version: ID
        ) {
          updateInstance(
            input: {
              id: $id
              name: $name
              description: $description
              integration: $version
            }
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
        name,
        description,
        version,
      },
    });

    if (!deploy) {
      this.log(result.updateInstance.instance.id);
      return;
    }

    const deployResult = await gqlRequest({
      document: gql`
        mutation deployInstance($id: ID!) {
          deployInstance(input: { id: $id }) {
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
      },
    });

    this.log(deployResult.deployInstance.instance.id);
  }
}
