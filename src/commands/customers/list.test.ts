import { runCommand } from "../../test-command.js";
import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { TEST_PRISMATIC_URL } from "../../../vitest.setup.js";
import Command from "./list.js";

const requests: Array<{ after?: string | null; first?: number }> = [];
const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);
const server = setupServer(
  api.query("listCustomers", ({ variables }) => {
    requests.push(variables);
    const second = variables.after === "cursor-1";
    return HttpResponse.json({
      data: {
        customers: {
          nodes: [
            {
              id: second ? "customer-2" : "customer-1",
              name: second ? "Second" : "First",
              externalId: null,
              description: "",
            },
          ],
          pageInfo: second
            ? { hasNextPage: false, endCursor: null }
            : { hasNextPage: true, endCursor: "cursor-1" },
        },
      },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  requests.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

describe("customers:list pagination", () => {
  it("returns one bounded, resumable page by default in agent mode", async () => {
    await expect(runCommand(Command, ["--agent", "--first", "1"])).resolves.toEqual({
      items: [{ id: "customer-1", externalId: "", name: "First", description: "" }],
      pageInfo: { hasNextPage: true, endCursor: "cursor-1" },
    });
    expect(requests).toEqual([{ after: "", first: 1 }]);
  });

  it("fetches all pages only when an agent explicitly requests --all", async () => {
    const result = await runCommand(Command, ["--agent", "--all", "--first", "1"]);
    expect(result).toMatchObject({
      items: [{ name: "First" }, { name: "Second" }],
    });
    expect(requests).toEqual([
      { after: "", first: 1 },
      { after: "cursor-1", first: 1 },
    ]);
  });

  it("resumes from --after", async () => {
    await runCommand(Command, ["--agent", "--after", "cursor-1"]);
    expect(requests).toEqual([{ after: "cursor-1" }]);
  });
});
