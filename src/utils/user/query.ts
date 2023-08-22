import { gql, gqlRequest } from "../../graphql";

interface OrgUser {
  userType: "org";
  name: string;
  email: string;
  org: {
    name: string;
  };
  customer: undefined;
}

interface CustomerUser {
  userType: "customer";
  name: string;
  email: string;
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
