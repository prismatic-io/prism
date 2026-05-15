import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PRISMATIC_URL, getDefaultConfigFilePath, getEnv } from "./env.js";

describe("getEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe.each([
    { key: "PRISM_ACCESS_TOKEN" },
    { key: "PRISM_REFRESH_TOKEN" },
    { key: "PRISMATIC_TENANT_ID" },
  ] as const)("$key (optional)", ({ key }) => {
    it.each([
      { label: "unset", input: undefined, expected: undefined },
      { label: "empty string", input: "", expected: undefined },
      { label: "whitespace-only", input: "   ", expected: undefined },
      { label: "real value", input: "some-value", expected: "some-value" },
    ])("$label → $expected", ({ input, expected }) => {
      vi.stubEnv(key, input);
      expect(getEnv()[key]).toBe(expected);
    });
  });

  describe("PRISMATIC_URL (defaulted)", () => {
    it.each([
      { label: "unset", input: undefined, expected: DEFAULT_PRISMATIC_URL },
      { label: "empty string", input: "", expected: DEFAULT_PRISMATIC_URL },
      { label: "whitespace-only", input: "   ", expected: DEFAULT_PRISMATIC_URL },
      {
        label: "explicit value",
        input: "https://custom.example.com",
        expected: "https://custom.example.com",
      },
    ])("$label → $expected", ({ input, expected }) => {
      vi.stubEnv("PRISMATIC_URL", input);
      expect(getEnv().PRISMATIC_URL).toBe(expected);
    });
  });

  describe("PRISM_CONFIG_FILE (defaulted)", () => {
    it.each([
      { label: "unset", input: undefined, expected: getDefaultConfigFilePath() },
      { label: "empty string", input: "", expected: getDefaultConfigFilePath() },
      { label: "whitespace-only", input: "   ", expected: getDefaultConfigFilePath() },
      { label: "explicit value", input: "/tmp/custom.yml", expected: "/tmp/custom.yml" },
    ])("$label → $expected", ({ input, expected }) => {
      vi.stubEnv("PRISM_CONFIG_FILE", input);
      expect(getEnv().PRISM_CONFIG_FILE).toBe(expected);
    });
  });

  describe("partial configurations", () => {
    const clearAll = () => {
      vi.stubEnv("PRISMATIC_URL", undefined);
      vi.stubEnv("PRISM_CONFIG_FILE", undefined);
      vi.stubEnv("PRISM_ACCESS_TOKEN", undefined);
      vi.stubEnv("PRISM_REFRESH_TOKEN", undefined);
      vi.stubEnv("PRISMATIC_TENANT_ID", undefined);
    };

    it("returns defaults / undefined when nothing is set", () => {
      clearAll();
      expect(getEnv()).toEqual({
        PRISMATIC_URL: DEFAULT_PRISMATIC_URL,
        PRISM_CONFIG_FILE: getDefaultConfigFilePath(),
        PRISM_ACCESS_TOKEN: undefined,
        PRISM_REFRESH_TOKEN: undefined,
        PRISMATIC_TENANT_ID: undefined,
      });
    });

    it("supports only PRISMATIC_URL + PRISM_REFRESH_TOKEN set", () => {
      clearAll();
      vi.stubEnv("PRISMATIC_URL", "https://custom.example.com");
      vi.stubEnv("PRISM_REFRESH_TOKEN", "rt-123");
      expect(getEnv()).toEqual({
        PRISMATIC_URL: "https://custom.example.com",
        PRISM_CONFIG_FILE: getDefaultConfigFilePath(),
        PRISM_ACCESS_TOKEN: undefined,
        PRISM_REFRESH_TOKEN: "rt-123",
        PRISMATIC_TENANT_ID: undefined,
      });
    });

    it("ignores empty values while honoring set ones", () => {
      clearAll();
      vi.stubEnv("PRISMATIC_URL", "https://custom.example.com");
      vi.stubEnv("PRISM_REFRESH_TOKEN", "rt-123");
      vi.stubEnv("PRISMATIC_TENANT_ID", "");
      vi.stubEnv("PRISM_ACCESS_TOKEN", "   ");
      expect(getEnv()).toEqual({
        PRISMATIC_URL: "https://custom.example.com",
        PRISM_CONFIG_FILE: getDefaultConfigFilePath(),
        PRISM_ACCESS_TOKEN: undefined,
        PRISM_REFRESH_TOKEN: "rt-123",
        PRISMATIC_TENANT_ID: undefined,
      });
    });
  });
});
