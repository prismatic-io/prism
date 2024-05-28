import { Command, Args, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";
import { configVar } from "@prismatic-io/spectral";

export default class UpdateCommand extends Command {
  static description = "Update Config Variables on an Instance";
  static args = {
    instance: Args.string({
      required: true,
      description: "ID of an instance",
    }),
  };


  static flags = {
    configVar: Flags.string({
      char: "l",
      description: "a set of config variables to apply to the instance",
      multiple: true }),
  };

  async run() {
    const {
      args: { instance },
      flags: { configVar },
    } = await this.parse(UpdateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation updateInstanceConfigVariables(
          $id: ID!
          $configVariables: [InputInstanceConfigVariable]
        ) {
          updateInstanceConfigVariables(
            input: {
              id: $id
              configVariables: $configVariables
            }
          ) {
          instance {
            id
            configVariables {
              nodes {
                requiredConfigVariable {
                  key
                }
                value
                inputs {
                  nodes {
                    name
                    value
                  }
                }
              }
            }
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
        configVariables: configVar,
      },
    });

    this.log(result.updateInstance.instance.id);

  }
}
