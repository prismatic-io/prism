import { Command, Args } from "@oclif/core";
import { promises as fs } from "fs";
import { runGenerator } from "../../../yeoman";
import { VALID_NAME_REGEX } from "../../../utils/generate";

export default class InitializeIntegration extends Command {
  static description = "Initialize a new Code Native Integration";
  static args = {
    name: Args.string({
      required: true,
      description:
        "Name of the new integration to create (alphanumeric characters, hyphens, and underscores)",
    }),
  };

  async run() {
    const {
      args: { name },
    } = await this.parse(InitializeIntegration);

    if (!VALID_NAME_REGEX.test(name)) {
      this.error(
        `'${name}' contains invalid characters. Please select an integration name that starts and ends with alphanumeric characters, and contains only alphanumeric characters, hyphens, and underscores. See https://regex101.com/?regex=${encodeURIComponent(
          VALID_NAME_REGEX.source
        )}`,
        { exit: 1 }
      );
    }

    this.log(`Creating directory for "${name}"...`);

    await fs.mkdir(name);

    const cwd = process.cwd();
    process.chdir(name);

    // Legacy code paths (mostly; keep the component generator call)
    await runGenerator(
      "integration",
      process.env.NODE_ENV === "test"
        ? {
            name,
            description: "Prism-generated Integration",
            skipInstall: true,
          }
        : { name, skipInstall: false }
    );

    // Pop back out.
    process.chdir(cwd);

    this.log(`
"${name}" is ready for development.
To install dependencies, run either "npm install" or "yarn install"
To run unit tests for the integration, run "npm run test" or "yarn test"
To build the integration, run "npm run build" or "yarn build"
To import the integration, run "prism integrations:import"

For documentation on writing Code Native Integrations, visit https://prismatic.io/docs/code-native-integrations/
    `);
  }
}
