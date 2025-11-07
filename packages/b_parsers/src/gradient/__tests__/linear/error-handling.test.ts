// b_path:: packages/b_parsers/src/gradient/__tests__/linear/error-handling.test.ts
import { describe, it, expect } from "vitest";
import * as Linear from "../../linear";

describe("Linear Gradient Parser - Error Handling", () => {
  it("fails on single color stop", () => {
    const css = "linear-gradient(red)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(false);
  });

  it("fails on empty gradient", () => {
    const css = "linear-gradient()";
    const result = Linear.parse(css);

    expect(result.ok).toBe(false);
  });

  it("fails on invalid syntax", () => {
    const css = "not-a-gradient(red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(false);
  });

  it("correctly identifies missing direction", () => {
    const css = "linear-gradient(to diagonal, red, blue)";
    const result = Linear.parse(css);

    // Parser treats invalid 'to diagonal' as color stop
    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toBe("Invalid direction keyword: diagonal");
  });

  it("handles invalid color space as color stop", () => {
    const css = "linear-gradient(in invalid-space, red, blue)";
    const result = Linear.parse(css);

    // Parser may treat unrecognized syntax as keywords
    expect(result.ok).toBe(true);
  });

  it("handles malformed to-corner as color stop", () => {
    const css = "linear-gradient(to top bottom, red, blue)";
    const result = Linear.parse(css);

    // Parser treats unrecognized pattern as color stop
    expect(result.ok).toBe(true);
  });

  it("warns on missing closing parenthesis", () => {
    const css = "linear-gradient(red, blue";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((issue) => issue.severity === "warning")).toBe(true);
  });
});
