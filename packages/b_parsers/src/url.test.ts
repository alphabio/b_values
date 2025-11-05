// b_path:: packages/b_parsers/src/url.test.ts
import { describe, expect, it } from "vitest";
import { parseUrl } from "./url";

describe("parseUrl", () => {
  it("should parse url without quotes", () => {
    const result = parseUrl("url(image.png)");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe("url");
    expect(result.value.value).toBe("image.png");
  });

  it("should parse url with double quotes", () => {
    const result = parseUrl('url("image.png")');

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value).toBe("image.png");
  });

  it("should parse url with single quotes", () => {
    const result = parseUrl("url('image.png')");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value).toBe("image.png");
  });

  it("should parse url with path", () => {
    const result = parseUrl("url(/assets/images/bg.jpg)");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value).toBe("/assets/images/bg.jpg");
  });

  it("should parse url with absolute URL", () => {
    const result = parseUrl("url(https://example.com/image.png)");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value).toBe("https://example.com/image.png");
  });

  it("should handle whitespace", () => {
    const result = parseUrl("  url(  image.png  )  ");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value).toBe("image.png");
  });

  it("should fail for non-url input", () => {
    const result = parseUrl("image.png");

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.issues[0]?.message).toContain("Expected url() function");
  });

  it("should fail for missing closing parenthesis", () => {
    const result = parseUrl("url(image.png");

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.issues[0]?.message).toContain("missing closing parenthesis");
  });

  it("should fail for empty url", () => {
    const result = parseUrl("url()");

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.issues[0]?.message).toContain("Empty url()");
  });

  it("should handle mismatched quotes as unquoted string", () => {
    const result = parseUrl("url(\"image.png')");

    // Treated as unquoted since quotes don't match
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value).toBe("\"image.png'");
  });
});
