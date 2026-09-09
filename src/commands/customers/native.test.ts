import { describe, expect, it, vi } from "vitest";
import { cli } from "../../cli.js";
import { gqlRequest } from "../../graphql.js";

vi.mock(import("../../graphql.js"), () => ({ gqlRequest: vi.fn() }));

async function invoke(argv: string[]) {
  const writes: string[] = [];
  let exitCode = 0;
  await cli.serve([...argv, "--agent", "--yes", "--json", "--full-output"], {
    stdout: (value) => writes.push(value),
    exit: (code) => {
      exitCode = code;
    },
  });
  return { result: JSON.parse(writes.join("")), exitCode };
}

describe("native customer command results", () => {
  it("returns an explicit resource and a profile-aware follow-up from short flags", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({
      createCustomer: { customer: { id: "customer-1" } },
    } as never);
    const { result, exitCode } = await invoke([
      "customers",
      "create",
      "-n",
      "Acme",
      "-l",
      "Production",
      "-l",
      "Beta",
      "--profile",
      "staging",
    ]);
    expect(exitCode).toBe(0);
    expect(result.data).toEqual({ customerId: "customer-1" });
    expect(gqlRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ name: "Acme", labels: ["Production", "Beta"] }),
      }),
    );
    expect(result.meta.cta.commands[0].command).toContain("customers users list customer-1");
    expect(result.meta.cta.commands[0].command).toContain("--profile staging");
  });

  it.each([
    {
      command: "create",
      args: ["-n", "Acme"],
      response: { createCustomer: { customer: null } },
      code: "CUSTOMER_CREATE_FAILED",
    },
    {
      command: "update",
      args: ["customer-1", "-n", "Acme"],
      response: { updateCustomer: { customer: null } },
      code: "CUSTOMER_UPDATE_FAILED",
    },
  ])("returns native error guidance when $command has no resulting customer", async ({
    command,
    args,
    response,
    code,
  }) => {
    vi.mocked(gqlRequest).mockResolvedValue(response as never);
    const { result, exitCode } = await invoke([
      "customers",
      command,
      ...args,
      "--profile",
      "staging",
    ]);
    expect(exitCode).toBe(2);
    expect(result).toMatchObject({ ok: false, error: { code, retryable: false } });
    expect(result.meta.cta.commands[0].command).toContain("customers list");
    expect(result.meta.cta.commands[0].command).toContain("--profile staging");
  });

  it("offers a bounded next page and stops suggesting it after the last page", async () => {
    vi.mocked(gqlRequest).mockResolvedValueOnce({
      customers: { nodes: [], pageInfo: { hasNextPage: true, endCursor: "cursor-1" } },
    } as never);
    const first = await invoke(["customers", "list", "--first", "2"]);
    expect(first.result.meta.cta.commands[0].command).toContain("--after cursor-1");
    expect(first.result.meta.cta.commands[0].command).toContain("--first 2");
    vi.mocked(gqlRequest).mockResolvedValueOnce({
      customers: { nodes: [], pageInfo: { hasNextPage: false, endCursor: "cursor-2" } },
    } as never);
    const last = await invoke(["customers", "list", "--first", "2", "--after", "cursor-1"]);
    expect(last.result.meta?.cta).toBeUndefined();
    expect(gqlRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ variables: { after: "cursor-1", first: 2 } }),
    );
  });
});
