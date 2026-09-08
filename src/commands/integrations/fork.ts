import type { ResultOf } from "@graphql-typed-document-node/core";
import { ForkIntegrationDocument as FORK_INTEGRATION } from "../../graphql/operations/forkIntegration.generated.js";
import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gqlRequest } from "../../graphql.js";

export default class ForkCommand extends PrismaticBaseCommand {
  static description = "Fork an Integration";

  static flags = {
    name: Flags.string({
      char: "n",
      required: true,
      description: "name of the forked integration",
    }),
    description: Flags.string({
      char: "d",
      required: true,
      description: "longer description of the forked integration",
    }),
  };

  static args = {
    parent: Args.string({
      required: true,
      description: "ID of the Integration to fork",
    }),
  };

  async run() {
    const {
      flags: { name, description },
      args: { parent },
    } = await this.parse(ForkCommand);

    const result: ResultOf<typeof FORK_INTEGRATION> = await gqlRequest({
      document: FORK_INTEGRATION,
      variables: {
        parentID: parent,
        name,
        description,
      },
    });

    this.log(result.forkIntegration?.integration?.id ?? this.error("Integration was not forked"));
  }
}
