import { Cli, z } from "incur";
import { writeCommandOutput } from "../../command.js";
import { getAuthContext } from "../../context.js";
import { warningsOutput } from "../../output.js";
import { whoAmI } from "../../utils/user/query.js";

export default Cli.command({
  outputPolicy: "agent-only",
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
    writeCommandOutput(["Name:", name].map(String).join(" "));
    writeCommandOutput(["Email:", email].map(String).join(" "));
    if (org) {
      writeCommandOutput(["Organization:", org.name].map(String).join(" "));
      writeCommandOutput(["Organization ID:", org.id].map(String).join(" "));
    } else if (customer) {
      writeCommandOutput(["Customer:", customer.name].map(String).join(" "));
    }
    if (tenantId) {
      writeCommandOutput(["Tenant ID:", tenantId].map(String).join(" "));
    }
    writeCommandOutput(["Endpoint URL:", authContext.url].map(String).join(" "));
    writeCommandOutput(
      ["Authentication:", authContext.source === "environment" ? "Environment" : "Profile"]
        .map(String)
        .join(" "),
    );
    if (authContext.source === "profile") {
      writeCommandOutput(["Profile:", authContext.profileName].map(String).join(" "));
    }
    return {
      name,
      email,
      organization: org,
      customer,
      tenantId,
      endpointUrl: authContext.url,
      authentication: authContext.source,
      profile: authContext.source === "profile" ? authContext.profileName : undefined,
    };
  },
});
