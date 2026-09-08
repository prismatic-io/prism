import { z } from "incur";
import { commandOutput, defineCommand } from "../../command.js";
import { getAuthContext } from "../../context.js";
import { resultOutput, warningsOutput } from "../../output.js";
import { whoAmI } from "../../utils/user/query.js";

export default defineCommand({
  output: z.object({
    ...warningsOutput,
    name: z.string(),
    email: z.string(),
    organization: z.object({ id: z.string(), name: z.string() }).optional(),
    customer: z.object({ id: z.string(), name: z.string() }).optional(),
    tenantId: z.string().optional(),
    endpointUrl: z.string(),
    authentication: z.enum(["environment", "profile"]),
    profile: z.string().optional(),
  }),
  description: "Print your user profile information",
  async run(_context) {
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
    return resultOutput(_context, {
      name,
      email,
      organization: org,
      customer,
      tenantId,
      endpointUrl: authContext.url,
      authentication: authContext.source,
      profile: authContext.profileName,
    });
  },
});
