import type { ListCustomersQuery } from "./graphql/customers/listCustomers.generated.js";
import { CreateCustomerDocument } from "./graphql/operations/createCustomer.generated.js";
import { gqlRequest } from "./graphql.js";

// Compile-only assertions for the generated document boundary.
export const checkGraphQLTypes = async () => {
  const result = await gqlRequest({
    document: CreateCustomerDocument,
    variables: { name: "Widgets" },
  });
  const id: string | undefined = result.createCustomer?.customer?.id;
  // @ts-expect-error The generated result has no arbitrary fields.
  result.nonexistent;
  // @ts-expect-error Customer names must be strings.
  await gqlRequest({ document: CreateCustomerDocument, variables: { name: 123 } });
  return id;
};

export const checkCustomerListTypes = (result: ListCustomersQuery) => {
  const names: string[] = result.customers.nodes.map(({ name }) => name);
  // @ts-expect-error Customer connections contain non-null nodes.
  result.customers.nodes.push(null);
  return names;
};
