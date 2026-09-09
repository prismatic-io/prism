import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { endpoint, successfulCli, verifyIdentity } from "./cli.js";

describe.skipIf(process.env.PRISM_AUDIT_MUTATIONS !== "true")("live customer lifecycle", () => {
  beforeAll(async () => {
    expect(
      endpoint().hostname.endsWith(".prismatic-dev.io"),
      "Mutations require a development stack",
    ).toBe(true);
    await verifyIdentity();
  });

  it.each([
    { ported: false, label: "published" },
    { ported: true, label: "candidate" },
  ])("$label creates, updates and removes a temporary customer", async ({ ported, label }) => {
    const suffix = randomUUID();
    const externalId = `prism-incur-audit-${suffix}-${label}`;
    const name = `Prism incur audit ${suffix} ${label}`;
    const machine = ported ? ["--agent", "--yes", "--json"] : [];
    let id: string | undefined;
    let deleted = false;
    try {
      const created = await successfulCli(ported, [
        "customers:create",
        ...machine,
        "--name",
        name,
        "--externalId",
        externalId,
        "--label",
        "Compatibility A",
        "Compatibility B",
      ]);
      const value = ported ? JSON.parse(created).customerId : created;
      expect(
        typeof value === "string" && value.length > 0 && !value.includes("\n"),
        "No created customer ID",
      ).toBe(true);
      const customerId = String(value);
      id = customerId;
      const query =
        "query AuditCustomer($id: ID!) { customer(id: $id) { name externalId labels description } }";
      const read = async () =>
        JSON.parse(
          await successfulCli(ported, ["graphql:query", query, "-v", JSON.stringify({ id })]),
        ).customer;
      const original = await read();
      expect(original.name).toBe(name);
      expect(original.externalId).toBe(externalId);
      expect([...original.labels].sort()).toEqual(["compatibility a", "compatibility b"]);
      const updatedName = `${name} updated`;
      await successfulCli(ported, [
        "customers:update",
        customerId,
        ...machine,
        `-n=${updatedName}`,
        "--description",
        "Compatibility audit; safe to remove",
      ]);
      const updated = await read();
      expect(updated.name).toBe(updatedName);
      expect(updated.description).toBe("Compatibility audit; safe to remove");
      await successfulCli(ported, ["customers:delete", customerId, ...machine]);
      deleted = true;
    } finally {
      if (id) await cleanupCustomer(ported, id, machine, externalId, deleted);
    }
  });
});

async function cleanupCustomer(
  ported: boolean,
  id: string,
  machine: string[],
  externalId: string,
  deleted: boolean,
) {
  try {
    if (!deleted) await successfulCli(ported, ["customers:delete", id, ...machine]);
    const remaining = JSON.parse(
      await successfulCli(ported, [
        "customers:list",
        "--columns",
        "id",
        "--filter",
        `externalId=^${externalId}$`,
        "--output",
        "json",
      ]),
    );
    expect(remaining).toEqual([]);
  } catch (cause) {
    throw new Error(`Cleanup required for customer ${id} on ${endpoint().origin}`, { cause });
  }
}
