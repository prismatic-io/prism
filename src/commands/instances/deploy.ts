import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

export default class DeployCommand extends PrismaticBaseCommand {
  static description = "Deploy an Instance";
  static args = {
    instance: Args.string({
      required: true,
      description: "ID of an instance",
    }),
  };
  static flags = {
    force: Flags.boolean({
      char: "f",
      description:
        "Force deployment even when there are certain conditions that would normally prevent it",
    }),
  };

  async run() {
    const {
      args: { instance },
      flags: { force },
    } = await this.parse(DeployCommand);

    const result = await gqlRequest({
      document: gql`
        mutation deployInstance($id: ID!, $force: Boolean) {
          deployInstance(input: { id: $id, force: $force }) {
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
        force,
      },
    });

    this.log(result.deployInstance.instance.id);
  }
}
