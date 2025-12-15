import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { setupServer } from "msw/node";
import { graphql, HttpResponse } from "msw";
import { exportDefinition } from "./export.js";
import { TEST_PRISMATIC_URL } from "../../../vitest.setup.js";

const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);

const server = setupServer();

// Sample YAML definition that would be returned from the API
const sampleYamlDefinition = `
definitionVersion: 7
name: Test Integration
description: A test integration
category: Test Category
flows:
  - name: Flow 1
    steps:
      - name: Trigger
        isTrigger: true
        action:
          component:
            key: webhook-triggers
            isPublic: true
            version: LATEST
          key: webhook
        inputs: {}
requiredConfigVars: []
`;

describe("export utils", () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  describe("exportDefinition", () => {
    it("should export and parse integration definition", async () => {
      server.use(
        api.query("export", () =>
          HttpResponse.json({
            data: {
              integration: {
                definition: sampleYamlDefinition,
              },
            },
          }),
        ),
      );

      const result = await exportDefinition({ integrationId: "integration-123" });

      expect(result.definitionVersion).toBe(7);
      expect(result.name).toBe("Test Integration");
      expect(result.flows).toHaveLength(1);
      expect(result.flows[0].name).toBe("Flow 1");
    });
  });
});
