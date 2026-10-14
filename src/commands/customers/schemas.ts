import { z } from "incur";

export const nonBlank = z.string().regex(/\S/, "Must not be blank");
export const pageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
});

// Column selection makes fields optional; values retain their native nullability.
export const customerRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    externalId: z.string().nullable(),
  })
  .partial();
export const customerUserRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    externalId: z.string().nullable(),
  })
  .partial();
export const customerRoleRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  })
  .partial();
