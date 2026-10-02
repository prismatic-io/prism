import { beforeEach, expect, it, vi } from "vitest";
import { commandSignal } from "../../command.js";
import { gqlRequest } from "../../graphql.js";
import { SectionLabelResolver } from "./flows.js";

vi.mock("../../graphql.js", () => ({ gqlRequest: vi.fn() }));
vi.mock("../../command.js", () => ({ commandSignal: vi.fn(), requireInteractiveInput: vi.fn() }));
beforeEach(() => {
  vi.mocked(gqlRequest).mockReset();
  vi.mocked(commandSignal).mockReset();
});

it("deduplicates lookups, caches labels, retries missing sections, and isolates executions", async () => {
  const resolver = new SectionLabelResolver("execution-1");
  const logs = [{ sectionId: "a" }, { sectionId: "a" }, { sectionId: "b" }, {}];
  vi.mocked(gqlRequest)
    .mockResolvedValueOnce({
      executionSections: { nodes: [null, { sectionId: "a", label: "First" }] },
    })
    .mockResolvedValueOnce({ executionSections: { nodes: [{ sectionId: "b", label: "Second" }] } });
  await resolver.resolve(logs);
  expect(vi.mocked(gqlRequest).mock.calls[0][0].variables).toEqual({
    executionId: "execution-1",
    sectionIds: ["a", "b"],
  });
  expect(logs.map((log) => resolver.sectionName(log))).toEqual(["First", "First", "b", null]);
  await resolver.resolve(logs);
  expect(vi.mocked(gqlRequest).mock.calls[1][0].variables).toEqual({
    executionId: "execution-1",
    sectionIds: ["b"],
  });
  await resolver.resolve(logs);
  expect(gqlRequest).toHaveBeenCalledTimes(2);
  expect(resolver.sectionName({ sectionId: "b" })).toBe("Second");
  expect(new SectionLabelResolver("execution-2").sectionName({ sectionId: "a" })).toBe("a");
});

it("skips unsectioned logs and returns recoverable lookup warnings", async () => {
  const resolver = new SectionLabelResolver("execution");
  await resolver.resolve([{}, { sectionId: null }]);
  expect(gqlRequest).not.toHaveBeenCalled();
  vi.mocked(gqlRequest).mockRejectedValueOnce(new Error("unavailable"));
  await expect(resolver.resolve([{ sectionId: "a" }])).resolves.toContain("unavailable");
  expect(resolver.sectionName({ sectionId: "a" })).toBe("a");
  vi.mocked(gqlRequest).mockResolvedValueOnce({
    executionSections: { nodes: [{ sectionId: "a", label: "Recovered" }] },
  });
  await resolver.resolve([{ sectionId: "a" }]);
  expect(resolver.sectionName({ sectionId: "a" })).toBe("Recovered");
});

it("propagates cancellation during a lookup", async () => {
  const controller = new AbortController();
  vi.mocked(commandSignal).mockReturnValue(controller.signal);
  vi.mocked(gqlRequest).mockImplementationOnce(async () => {
    controller.abort(new Error("cancelled"));
    throw controller.signal.reason;
  });
  await expect(new SectionLabelResolver("execution").resolve([{ sectionId: "a" }])).rejects.toThrow(
    "cancelled",
  );
});

it("resolves batches larger than the API page limit", async () => {
  const logs = Array.from({ length: 101 }, (_, index) => ({ sectionId: `section-${index}` }));
  vi.mocked(gqlRequest)
    .mockResolvedValueOnce({
      executionSections: {
        nodes: logs.slice(0, 100).map((log) => ({ ...log, label: "First batch" })),
      },
    })
    .mockResolvedValueOnce({
      executionSections: { nodes: [{ ...logs[100], label: "Last batch" }] },
    });
  const resolver = new SectionLabelResolver("execution");
  await resolver.resolve(logs);
  expect(
    vi.mocked(gqlRequest).mock.calls.map(([request]) => request.variables.sectionIds.length),
  ).toEqual([100, 1]);
  expect(resolver.sectionName(logs[100])).toBe("Last batch");
});
