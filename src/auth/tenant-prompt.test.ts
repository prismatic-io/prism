import inquirer from "inquirer";
import { describe, expect, it, vi } from "vitest";
import { selectTenant } from "./tenant-prompt.js";
import type { Tenant } from "./tenants.js";

vi.mock("inquirer", () => ({ default: { prompt: vi.fn() } }));

const makeTenant = (id: string, overrides: Partial<Tenant> = {}): Tenant => ({
  tenantId: id,
  url: `https://${id}.example.com`,
  orgName: `Org ${id}`,
  awsRegion: "us-west-2",
  systemSuspended: false,
  ...overrides,
});

describe("selectTenant", () => {
  it("logs an error and returns undefined when every tenant is suspended", async () => {
    const outputSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const tenants = [
      makeTenant("a", { systemSuspended: true }),
      makeTenant("b", { systemSuspended: true }),
    ];

    const result = await selectTenant(tenants, { currentTenantId: "a" });

    expect(result).toBeUndefined();
    expect(inquirer.prompt).not.toHaveBeenCalled();
    expect(outputSpy).toHaveBeenCalledWith(expect.stringContaining("no active tenants"));
  });

  it("filters suspended tenants out of the choice list", async () => {
    let capturedChoices: Array<{ value: string }> = [];
    vi.mocked(inquirer.prompt).mockImplementationOnce(async (questions) => {
      capturedChoices = (questions as Array<{ choices: typeof capturedChoices }>)[0].choices;
      return { tenantId: "b" };
    });
    const tenants = [
      makeTenant("a", { systemSuspended: true }),
      makeTenant("b"),
      makeTenant("c", { systemSuspended: true }),
      makeTenant("d"),
    ];

    await selectTenant(tenants);

    expect(capturedChoices.map((c) => c.value)).toEqual(["b", "d"]);
  });

  it("omits the suspended current tenant from the prompt default", async () => {
    let capturedDefault: string | undefined;
    vi.mocked(inquirer.prompt).mockImplementationOnce(async (questions) => {
      capturedDefault = (questions as Array<{ default?: string }>)[0].default;
      return { tenantId: "b" };
    });
    const tenants = [makeTenant("a", { systemSuspended: true }), makeTenant("b")];

    await selectTenant(tenants, { currentTenantId: "a" });

    expect(capturedDefault).toBeUndefined();
  });

  it("passes the active current tenant through as the prompt default", async () => {
    let capturedDefault: string | undefined;
    vi.mocked(inquirer.prompt).mockImplementationOnce(async (questions) => {
      capturedDefault = (questions as Array<{ default?: string }>)[0].default;
      return { tenantId: "a" };
    });
    const tenants = [makeTenant("a"), makeTenant("b")];

    await selectTenant(tenants, { currentTenantId: "a" });

    expect(capturedDefault).toBe("a");
  });
});
