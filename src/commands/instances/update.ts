import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

export default class UpdateCommand extends PrismaticBaseCommand {
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
    label: Flags.string({
      char: "l",
      description: "a label or set of labels to apply to the instance",
      multiple: true,
    }),
  };

  async run() {
    const {
      args: { instance },
      flags: { name, description, version, deploy, label },
    } = await this.parse(UpdateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation updateInstance(
          $id: ID!
          $name: String
          $description: String
          $version: ID
          $labels: [String]
        ) {
          updateInstance(
            input: {
              id: $id
              name: $name
              description: $description
              integration: $version
              labels: $labels
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
        labels: label,
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
