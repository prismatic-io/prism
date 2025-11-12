import { gql, gqlRequest } from "../../graphql.js";

interface OrgUser {
  userType: "org";
  name: string;
  email: string;
  tenantId?: string;
  org: {
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
  const { authenticatedUser } = await gqlRequest<{ authenticatedUser: User }>({
    document: gql`
      query whoami {
        authenticatedUser {
          name
          email
          tenantId
          org {
            name
          }
          customer {
            id
            name
          }
        }
      }
    `,
  });
  authenticatedUser.userType = authenticatedUser.org ? "org" : "customer";
  return authenticatedUser;
};
