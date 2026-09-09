import { Cli, z } from "incur";
import { writeCommandStatus } from "../../command.js";
import { getAuthContext } from "../../context.js";
import { warningsOutput } from "../../output.js";
import { whoAmI } from "../../utils/user/query.js";

export default Cli.command({
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
    const me = await whoAmI(authContext);
    const { name, email, org, customer, tenantId } = me;
    writeCommandStatus(["Name:", name].map(String).join(" "));
    writeCommandStatus(["Email:", email].map(String).join(" "));
    if (org) {
      writeCommandStatus(["Organization:", org.name].map(String).join(" "));
      writeCommandStatus(["Organization ID:", org.id].map(String).join(" "));
    } else if (customer) {
      writeCommandStatus(["Customer:", customer.name].map(String).join(" "));
    }
    if (tenantId) {
      writeCommandStatus(["Tenant ID:", tenantId].map(String).join(" "));
    }
    writeCommandStatus(["Endpoint URL:", authContext.url].map(String).join(" "));
    writeCommandStatus(
      ["Authentication:", authContext.source === "environment" ? "Environment" : "Profile"]
        .map(String)
        .join(" "),
    );
    if (authContext.source === "profile") {
      writeCommandStatus(["Profile:", authContext.profileName].map(String).join(" "));
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
