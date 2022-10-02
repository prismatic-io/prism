import { gql, gqlRequest } from "../../graphql";

interface User {
  name: string;
  email: string;
  org?: {
    name: string;
  };
  customer?: {
    name: string;
  };
}

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
            name
          }
        }
      }
    `,
  });
  return authenticatedUser;
};
