import type { ResultOf } from "@graphql-typed-document-node/core";
import { CreateOrganizationUserDocument as CREATE_ORGANIZATION_USER } from "../../../graphql/operations/createOrganizationUser.generated.js";
import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";

export default class CreateCommand extends PrismaticBaseCommand {
  static description = "Create a User for your Organization";

  static examples = [
    {
      description: "Get the ID of the 'Integrator' role:",
      command:
        "ROLE_ID=$(prism organization:users:roles --columns id --no-header --filter 'name=^Integrator$')",
    },
    {
      description: "Create an organization user and assign the role:",
      command:
        // biome-ignore lint/suspicious/noTemplateCurlyInString: TODO
        "<%= config.bin %> <%= command.id %> --email 'foo@email.com' --name 'Susan Foo' --role ${ROLE_ID}",
    },
  ];

  static flags = {
    name: Flags.string({ char: "n", description: "name of the user" }),
    email: Flags.string({
      char: "e",
      required: true,
      description: "email address of the user",
    }),
    role: Flags.string({
      char: "r",
      required: true,
      description: "role the user should assume",
    }),
  };

  async run() {
    const {
      flags: { name, email, role },
    } = await this.parse(CreateCommand);

    const result: ResultOf<typeof CREATE_ORGANIZATION_USER> = await gqlRequest({
      document: CREATE_ORGANIZATION_USER,
      variables: {
        name,
        email,
        role,
      },
    });

    this.log(
      result.createOrganizationUser?.user?.id ?? this.error("Organization user was not created"),
    );
  }
}
