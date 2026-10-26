import { describe, expect, it } from "vitest";
import { planTenantLogin, planTenantSwitch, type Tenant, tenantAccess } from "./tenants.js";

const active: Tenant = {
  tenantId: "current",
  orgName: "Current",
  url: "https://example.com",
  awsRegion: "us-east-1",
  systemSuspended: false,
};
const other = { ...active, tenantId: "other" };
const suspended = { ...active, systemSuspended: true };

it("distinguishes current membership from available selections", () => {
  expect(tenantAccess([suspended, other], "current")).toEqual({
    tenants: [suspended, other],
    currentTenantId: "current",
    current: suspended,
    currentSuspended: true,
    active: [other],
  });
});

for (const [name, plan] of [
  ["login", planTenantLogin],
  ["switch", planTenantSwitch],
] as const) {
  describe(name, () => {
    it.each([
      { scenario: "no memberships", tenants: [], expected: { kind: "keep" } },
      { scenario: "only the current tenant", tenants: [active], expected: { kind: "keep" } },
      {
        scenario: "multiple available tenants",
        tenants: [active, other],
        expected: { kind: "prompt" },
      },
      {
        scenario: "suspended current tenant",
        tenants: [suspended, other],
        expected: { kind: "prompt" },
      },
    ])("plans $scenario", ({ tenants, expected }) => {
      expect(plan(tenantAccess(tenants, "current"), {})).toEqual(expected);
    });

    it("selects an explicitly requested active tenant without prompting", () => {
      expect(
        plan(tenantAccess([active, other], "current"), { tenantId: "other", nonInteractive: true }),
      ).toEqual({ kind: "select", tenantId: "other" });
    });

    it.each([
      "missing",
      "current",
    ])("rejects unavailable tenant %s before selecting", (tenantId) => {
      expect(() => plan(tenantAccess([suspended, other], "current"), { tenantId })).toThrow(
        `Tenant '${tenantId}' is not available to this profile.`,
      );
    });

    it("requires an explicit choice when a noninteractive session has multiple tenants", () => {
      expect(() =>
        plan(tenantAccess([active, other], "current"), { nonInteractive: true }),
      ).toThrow(/--tenant-id/);
    });
  });
}

it("honors an explicit switch when the sole active tenant differs from the current one", () => {
  expect(planTenantSwitch(tenantAccess([other], "current"), { tenantId: "other" })).toEqual({
    kind: "select",
    tenantId: "other",
  });
});
