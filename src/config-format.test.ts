import { describe, expect, it } from "vitest";
import {
  decodeConfig,
  encodeConfig,
  getProfile,
  type Profile,
  type SavedProfiles,
} from "./config.js";
import { dumpYaml, loadYaml } from "./utils/serialize.js";

const credentials = {
  accessToken: "access-token",
  expiresIn: 3600,
  refreshToken: "refresh-token",
  scope: "read write",
  tokenType: "Bearer",
  tenantId: "tenant-1",
};
const profile: Profile = { ...credentials, prismaticUrl: "https://saved.example.com" };
const state: SavedProfiles = { defaultProfile: "production", profiles: { production: profile } };
const options = { legacyUrl: "https://legacy.example.com", path: "/config/prism.yml" };

const decode = (value: unknown) => decodeConfig(dumpYaml(value), options);

describe("configuration format", () => {
  it.each([
    null,
    "",
    "  \n",
    "null",
  ])("treats missing or empty configuration %j as absent", (contents) =>
    expect(decodeConfig(contents, options)).toBeNull());

  it("decodes the current format without exposing its disk version", () => {
    expect(decode({ version: 1, ...state })).toEqual(state);
  });

  it("decodes legacy credentials into the default profile using the supplied URL", () => {
    const contents = dumpYaml(credentials);
    expect(decodeConfig(contents, options)).toEqual({
      defaultProfile: "default",
      profiles: { default: { ...credentials, prismaticUrl: options.legacyUrl } },
    });
    expect(
      decodeConfig(contents, { ...options, legacyUrl: "https://another.example.com" })?.profiles
        .default.prismaticUrl,
    ).toBe("https://another.example.com");
  });

  it("keeps a current profile's stored URL independent of the legacy URL", () => {
    expect(decode({ version: 1, ...state })?.profiles.production.prismaticUrl).toBe(
      profile.prismaticUrl,
    );
  });

  it("encodes only the current format, including after legacy decoding", () => {
    expect(loadYaml(encodeConfig(state))).toEqual({ version: 1, ...state });
    const legacy = decode(credentials);
    if (!legacy) throw new Error("Expected legacy credentials to decode");
    expect(loadYaml(encodeConfig(legacy))).toEqual({
      version: 1,
      defaultProfile: "default",
      profiles: { default: { ...credentials, prismaticUrl: options.legacyUrl } },
    });
  });

  it.each([
    0,
    2,
    "1",
  ])("rejects unsupported version %j instead of treating it as legacy", (version) => {
    expect(() => decode({ ...credentials, ...state, version })).toThrow(
      "Prism could not read the configuration at /config/prism.yml",
    );
  });

  it("does not reinterpret a malformed profile document as legacy credentials", () => {
    expect(() => decode({ ...credentials, profiles: {} })).toThrow("could not read");
  });

  it.each([
    { ...credentials, accessToken: "" },
    { ...credentials, expiresIn: -1 },
    { ...credentials, refreshToken: null },
    { ...credentials, tenantId: "" },
  ])("validates legacy credentials %j", (invalid) => {
    expect(() => decode(invalid)).toThrow("could not read");
  });

  it("rejects a missing default profile on both decode and encode", () => {
    const invalid = { ...state, defaultProfile: "missing" };
    expect(() => decode({ version: 1, ...invalid })).toThrow("The default profile does not exist");
    expect(() => encodeConfig(invalid)).toThrow("The default profile does not exist");
  });

  it.each([
    null,
    [],
    "profiles",
    { "": profile },
  ])("rejects invalid profile dictionaries %j", (profiles) => {
    expect(() => decode({ version: 1, ...state, profiles })).toThrow("could not read");
  });

  it("validates profiles before encoding", () => {
    expect(() =>
      encodeConfig({ ...state, profiles: { production: { ...profile, accessToken: "" } } }),
    ).toThrow("Prism could not save its configuration");
  });

  it("retains file-path context for malformed YAML", () => {
    expect(() => decodeConfig("profiles: [", options)).toThrow(
      "Failed to parse configuration at /config/prism.yml",
    );
  });

  it("strips unknown fields at the format boundary", () => {
    const extra = {
      ...state,
      unrelated: true,
      profiles: { production: { ...profile, unrelated: true } },
    };
    expect(decode({ version: 1, ...extra })).toEqual(state);
    expect(loadYaml(encodeConfig(extra))).toEqual({ version: 1, ...state });
  });
});

describe("saved profile lookup", () => {
  it.each([
    "missing",
    "toString",
    "constructor",
    "__proto__",
  ])("does not treat inherited property %s as a saved profile", (name) =>
    expect(getProfile(state, name)).toBeNull());

  it.each([
    "toString",
    "constructor",
    "__proto__",
  ])("allows an explicitly saved profile named %s", (name) => {
    const named = { defaultProfile: name, profiles: { [name]: profile } };
    expect(getProfile(decode({ version: 1, ...named }), name)).toEqual(profile);
    const roundTrip = decodeConfig(encodeConfig(named), options);
    expect(roundTrip).toEqual(named);
    expect(getProfile(roundTrip, name)).toEqual(profile);
    expect(Object.getPrototypeOf(roundTrip?.profiles)).toBe(Object.prototype);
  });

  it("returns null when there is no saved state", () => {
    expect(getProfile(null, "default")).toBeNull();
  });
});
