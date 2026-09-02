import { commandOutput, defineCommand, type CommandContext } from "../../command.js";
import { getAuthContext } from "../../context.js";
import { whoAmI } from "../../utils/user/query.js";

export default defineCommand({
  description: "Print your user profile information",
  async run(_context: CommandContext) {
    const authContext = await getAuthContext();
    const me = await whoAmI();
    const { name, email, org, customer, tenantId } = me;
    commandOutput.log("Name:", name);
    commandOutput.log("Email:", email);
    if (org) {
      commandOutput.log("Organization:", org.name);
      commandOutput.log("Organization ID:", org.id);
    } else if (customer) {
      commandOutput.log("Customer:", customer.name);
    }
    if (tenantId) {
      commandOutput.log("Tenant ID:", tenantId);
    }
    commandOutput.log("Endpoint URL:", authContext.url);
    commandOutput.log(
      "Authentication:",
      authContext.source === "environment" ? "Environment" : "Profile",
    );
    if (authContext.profileName) {
      commandOutput.log("Profile:", authContext.profileName);
    }
  },
});
