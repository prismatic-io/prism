import { describe, test, expect } from "bun:test";
import { isLegacyConfiguration, isMultiTenantConfiguration, writeConfig } from "./config.js";

describe("Multi-tenant configuration type guards", () => {
  test("should correctly identify legacy configuration", async () => {
    const legacyConfig = {
      accessToken: "test-token",
      expiresIn: 3600,
      refreshToken: "test-refresh",
      scope: "openid",
      tokenType: "Bearer",
    };

    expect(isLegacyConfiguration(legacyConfig)).toBe(true);
    expect(isMultiTenantConfiguration(legacyConfig)).toBe(false);
  });

  test("should correctly identify multi-tenant configuration", async () => {
    const multiTenantConfig = {
      "https://app.prismatic.io": {
        accessToken: "test-token-1",
        expiresIn: 3600,
        refreshToken: "test-refresh-1",
        scope: "openid",
        tokenType: "Bearer",
      },
      "https://custom.prismatic.io": {
        accessToken: "test-token-2",
        expiresIn: 7200,
        refreshToken: "test-refresh-2",
        scope: "openid profile",
        tokenType: "Bearer",
      },
    };

    expect(isLegacyConfiguration(multiTenantConfig)).toBe(false);
    expect(isMultiTenantConfiguration(multiTenantConfig)).toBe(true);
  });

  test("should handle null and undefined values", async () => {
    expect(isLegacyConfiguration(null)).toBe(false);
    expect(isLegacyConfiguration(undefined)).toBe(false);
    expect(isMultiTenantConfiguration(null)).toBe(false);
    expect(isMultiTenantConfiguration(undefined)).toBe(false);
  });

  test("should handle invalid objects", async () => {
    const invalidConfig = { someOtherProperty: "value" };

    expect(isLegacyConfiguration(invalidConfig)).toBe(false);
    expect(isMultiTenantConfiguration(invalidConfig)).toBe(true);
  });

  test("should handle writeConfig with automatic legacy detection", async () => {
    const testConfig = {
      accessToken: "test",
      expiresIn: 3600,
      refreshToken: "refresh",
      scope: "openid",
      tokenType: "Bearer",
    };

    expect(() => writeConfig(testConfig)).not.toThrow();
  });
});
