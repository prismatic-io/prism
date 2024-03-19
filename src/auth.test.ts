import { describe, it, expect } from "bun:test";
import { Authenticate, createRequestParams } from "./auth.js";
import axios from "axios";

const domain = "prismatic-io-dev.auth0.com";
const clientId = "R3uA27LbxqyanGVXjKpXgQo5A4TK44s7";
const audience = "https://prismatic.io/api";
const successRedirectUri = "https://prismatic.io";

describe("createRequestParams", () => {
  it("handles empty collection", () => {
    expect(createRequestParams({})).toBe("");
  });

  it("handles collection with one item", () => {
    const input = { someId: "123456:7890" };
    const expected = "someId=123456%3A7890";
    expect(createRequestParams(input)).toStrictEqual(expected);
  });

  it("handles collection with more than one item", () => {
    const input = { hello: "world", another: "17" };
    const expected = "hello=world&another=17";
    expect(createRequestParams(input)).toStrictEqual(expected);
  });

  it("should not start with question mark", () => {
    // This is due to the reuse of the method for form data
    const [firstCharacter] = createRequestParams({ foo: "bar" });
    expect(firstCharacter).not.toBe("?");
  });
});

// Skip the auth tests since they're more for convenience testing auth
// rather than actual good unit tests to run due to their side effects.
describe.skip("auth", () => {
  it("should work", async () => {
    expect.assertions(1);
    const auth = new Authenticate({
      domain,
      clientId,
      audience,
      scopes: ["token", "email"],
      successRedirectUri,
    });
    const response = await auth.login();
    expect(response.accessToken).toBeDefined();
  });

  it("should retrieve email", async () => {
    expect.assertions(1);
    const auth = new Authenticate({
      domain,
      clientId,
      audience,
      scopes: ["token", "openid", "email", "offline_access"],
      successRedirectUri,
    });
    const { accessToken } = await auth.login();
    const { data } = await axios({
      method: "get",
      url: `https://${domain}/userinfo`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(data.email).toBeDefined();
  });
});
