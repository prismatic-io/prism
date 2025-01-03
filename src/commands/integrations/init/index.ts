import { Command, Args } from "@oclif/core";
import fs from "fs/promises";
import { VALID_NAME_REGEX } from "../../../utils/generate.js";
import GenerateIntegrationCommand from "./integration.js";
import GenerateIntegrationFromYAMLCommand from "./yaml.js";

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
          VALID_NAME_REGEX.source,
        )}`,
        { exit: 1 },
      );
    }

    await fs.mkdir(name);
    process.chdir(name);

    await GenerateIntegrationCommand.invoke(
      {
        name,
        description: "Prism-generated Integration",
      },
      this.config,
    );
  }
}
