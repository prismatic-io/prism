import { promises as fs } from "fs";
import { createDescription } from "./util";

const getComplexDescription = async () =>
  (
    await fs.readFile("src/generate/fixtures/complex_description.txt")
  ).toString();

describe("createDescription", () => {
  it("should handle undefined", async () => {
    expect(createDescription(undefined)).toBe("");
  });

  it("should reduce complex description", async () => {
    const description = await getComplexDescription();
    expect(createDescription(description)).toBe(
      "Register for access to the API via OAuth2"
    );
  });

  it("should replace backticks", () => {
    const text = "This is `some` backtick `code`.";
    expect(createDescription(text)).toBe("This is 'some' backtick 'code'");
  });

  it("should strip out HTML", () => {
    const text = "<p><b>This</b> is a simplified example.</p>";
    expect(createDescription(text)).toBe("This is a simplified example");
  });

  it("should strip out HTML and summarize", () => {
    const text =
      '<p>With <a href="/docs/connect">Connect</a>, you can delete accounts you manage.</p>\n\n<p>Accounts created using test-mode keys can be deleted at any time. Custom or Express accounts created using live-mode keys can only be deleted once all balances are zero.</p>\n\n<p>If you want to delete your own account, use the <a href="https://dashboard.stripe.com/account">account information tab in your account settings</a> instead.</p>';
    expect(createDescription(text)).toBe(
      "With Connect, you can delete accounts you manage"
    );
  });

  it("should allow arbitrary punctuation", () => {
    const exclamation = "This is text! Another sentence.";
    expect(createDescription(exclamation)).toBe("This is text");

    const burgundy = "This is text? Another sentence.";
    expect(createDescription(burgundy)).toBe("This is text");
  });
});
