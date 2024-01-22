import { Command } from "@oclif/core";
import { gqlRequest } from "../../graphql";
import MARKETPLACE_QUERY from "./queries.graphql";

export default class TranslationsCommand extends Command {
  static description = "Generate Dynamic Phrases for Embedded Marketplace";

  async run() {
    this.log("Fetching marketplace integrations");
    const result = await gqlRequest({
      document: MARKETPLACE_QUERY,
    });
  }
}
