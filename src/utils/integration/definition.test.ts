import { describe, it, expect } from "vitest";
import {
  buildConnectionConfigVar,
  buildStep,
  defaultDefinition,
  ComponentTestInfo,
} from "./definition.js";
import { Expression } from "./export.js";

describe("buildConnectionConfigVar", () => {
  it("should build connection config var for public component", () => {
    const result = buildConnectionConfigVar(
      { key: "slack", isPublic: true },
      {
        key: "oauth2",
        values: {
          clientId: { type: "value", value: "abc" },
          clientSecret: { type: "value", value: "xyz" },
        },
      },
    );

    expect(result).toEqual({
      key: "testConnection",
      description: "Test Connection",
      dataType: "connection",
      connection: {
        component: {
          key: "slack",
          isPublic: true,
          version: "LATEST",
        },
        key: "oauth2",
      },
      inputs: {
        clientId: { type: "value", value: "abc" },
        clientSecret: { type: "value", value: "xyz" },
      },
    });
  });

  it("should build connection config var for private component", () => {
    const result = buildConnectionConfigVar(
      { key: "custom-component", isPublic: false },
      {
        key: "basic-auth",
        values: {
          username: { type: "value", value: "abc" },
          password: { type: "value", value: "xyz" },
        },
      },
    );

    expect(result.connection?.component.isPublic).toBe(false);
    expect(result.connection?.component.key).toBe("custom-component");
  });

  it("should include all connection input values", () => {
    const values: Record<string, Expression> = {
      apiKey: { type: "value", value: "abc123" },
      baseUrl: { type: "value", value: "https://api.example.com" },
      timeout: { type: "value", value: "30000" },
    };
    const result = buildConnectionConfigVar(
      { key: "api-client", isPublic: true },
      { key: "apiKey", values },
    );

    expect(result.inputs).toEqual(values);
  });
});

describe("buildStep", () => {
  it("should build step for public component action", () => {
    const result = buildStep(
      { key: "http", isPublic: true },
      { key: "httpGet", values: { url: { type: "value", value: "https://example.com" } } },
    );

    expect(result).toEqual({
      name: "Test Step",
      action: {
        component: {
          key: "http",
          isPublic: true,
          version: "LATEST",
        },
        key: "httpGet",
      },
      inputs: { url: { type: "value", value: "https://example.com" } },
    });
  });

  it("should build step for private component action", () => {
    const result = buildStep(
      { key: "my-private-component", isPublic: false },
      { key: "customAction", values: { param: { type: "value", value: "value" } } },
    );

    expect(result.action.component.isPublic).toBe(false);
    expect(result.action.key).toBe("customAction");
  });

  it("should always use LATEST version", () => {
    const result = buildStep({ key: "any", isPublic: true }, { key: "action", values: {} });

    expect(result.action.component.version).toBe("LATEST");
  });
});

describe("defaultDefinition", () => {
  const baseTestInfo: ComponentTestInfo = {
    integrationInfo: { name: "Test Integration" },
    componentInfo: { key: "test-component", isPublic: true },
    actionInfo: { key: "testAction", values: { input: { type: "value", value: "value" } } },
  };

  it("should create definition with correct structure", () => {
    const result = defaultDefinition(baseTestInfo);

    expect(result.definitionVersion).toBe(6);
    expect(result.name).toBe("Test Integration");
    expect(result.description).toBe("Test Harness for the test-component Component");
    expect(result.category).toBe("Component Development");
  });

  it("should create flow with trigger and test step", () => {
    const result = defaultDefinition(baseTestInfo);

    expect(result.flows).toHaveLength(1);
    expect(result.flows[0].name).toBe("Flow 1");
    expect(result.flows[0].steps).toHaveLength(2);

    // First step should be webhook trigger
    const triggerStep = result.flows[0].steps[0];
    expect(triggerStep.name).toBe("Trigger");
    expect(triggerStep.isTrigger).toBe(true);
    expect(triggerStep.action.component.key).toBe("webhook-triggers");
    expect(triggerStep.action.key).toBe("webhook");

    // Second step should be the test step
    const testStep = result.flows[0].steps[1];
    expect(testStep.name).toBe("Test Step");
    expect(testStep.action.component.key).toBe("test-component");
    expect(testStep.action.key).toBe("testAction");
  });

  it("should include connection config var when connectionInfo is provided", () => {
    const testInfoWithConnection: ComponentTestInfo = {
      ...baseTestInfo,
      connectionInfo: { key: "oauth", values: { token: { type: "value", value: "abc" } } },
    };

    const result = defaultDefinition(testInfoWithConnection);

    expect(result.requiredConfigVars).toHaveLength(1);

    if (result.requiredConfigVars?.length) {
      // Placing in block to make typechecker happy; we won't hit this if the previous test fails
      expect(result.requiredConfigVars[0].key).toBe("testConnection");
      expect(result.requiredConfigVars[0].connection?.key).toBe("oauth");
    }
  });

  it("should have empty requiredConfigVars when no connectionInfo", () => {
    const result = defaultDefinition(baseTestInfo);

    expect(result.requiredConfigVars).toEqual([]);
  });
});
