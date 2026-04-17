import { Command } from "@oclif/core";
import { prismaticUrl } from "../../auth.js";
import { whoAmI } from "../../utils/user/query.js";

export default class WhoAmICommand extends Command {
  static description = "Print your user profile information";

  async run() {
    await this.parse(WhoAmICommand);
    const me = await whoAmI();
    const { name, email, org, customer, tenantId } = me;
    this.log("Name:", name);
    this.log("Email:", email);
    if (org) {
      this.log("Organization:", org.name);
      this.log("Organization ID:", org.id);
    } else if (customer) {
      this.log("Customer:", customer.name);
    }
    if (tenantId) {
      this.log("Tenant ID:", tenantId);
    }
    this.log("Endpoint URL:", prismaticUrl);
  }
}
