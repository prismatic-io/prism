import { Command } from "@oclif/core";
import { prismaticUrl } from "../../auth";
import { whoAmI } from "../../utils/user/query";

export default class WhoAmICommand extends Command {
  static description = "Print your user profile information";

  async run() {
    const me = await whoAmI();
    const { name, email, org, customer } = me;
    this.log("Name:", name);
    this.log("Email:", email);
    if (org) {
      this.log("Organization:", org.name);
    } else if (customer) {
      this.log("Customer:", customer.name);
    }
    this.log("Endpoint URL:", prismaticUrl);
  }
}
