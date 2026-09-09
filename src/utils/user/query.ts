import { WhoamiDocument as WHOAMI } from "../../graphql/operations/whoami.generated.js";
import { gqlRequest } from "../../graphql.js";

interface OrgUser {
  userType: "org";
  name: string;
  email: string;
  tenantId?: string;
  org: {
    id: string;
    name: string;
  };
  customer: undefined;
}

interface CustomerUser {
  userType: "customer";
  name: string;
  email: string;
  tenantId: undefined;
  org: undefined;
  customer: {
    id: string;
    name: string;
  };
}

type User = OrgUser | CustomerUser;

export const whoAmI = async (): Promise<User> => {
  const { authenticatedUser } = await gqlRequest({
    document: WHOAMI,
  });
  if (authenticatedUser.org) {
    return {
      ...authenticatedUser,
      userType: "org",
      org: authenticatedUser.org,
      customer: undefined,
    };
  }
  if (authenticatedUser.customer) {
    return {
      ...authenticatedUser,
      userType: "customer",
      customer: authenticatedUser.customer,
      org: undefined,
      tenantId: undefined,
    };
  }
  throw new Error("Authenticated user is not associated with an organization or customer");
};
