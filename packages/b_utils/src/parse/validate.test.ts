// b_path:: packages/b_utils/src/parse/validate.test.ts
import { describe, expect, it } from "vitest";
import { validate, validateDeclaration } from "./validate";

describe("validate", () => {
  it("should not report warnings for valid CSS", () => {
    const css = "color: red; margin: 10px;";
    const result = validate(css);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should report warnings for invalid property values", () => {
    const css = "color: notacolor;";
    const result = validate(css);

    expect(result.ok).toBe(true); // ok only checks syntax errors
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]?.property).toBe("color");
  });

  it("should skip validation for declarations with var()", () => {
    const css = "color: var(--my-color); background: var(--bg);";
    const result = validate(css);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0); // Should not warn about var()
  });

  it("should skip validation for declarations with calc()", () => {
    const css = "width: calc(100% - 20px); margin: calc(1em + 5px);";
    const result = validate(css);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0); // Should not warn about calc()
  });

  it("should skip validation for complex gradients with var() and calc()", () => {
    const css = `
      background-image: repeating-conic-gradient(
        from var(--angle) at 25% 25%,
        var(--color-1) calc(5 * var(--angle)) 5%,
        var(--color-4) 5% 10%
      );
    `;
    const result = validate(css);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0); // Should not warn about dynamic values
  });

  it("should skip validation for min/max/clamp functions", () => {
    const css = `
      width: min(100%, 500px);
      height: max(200px, 50vh);
      font-size: clamp(1rem, 2vw, 2rem);
    `;
    const result = validate(css);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should report syntax errors", () => {
    const css = "color: red; margin: {{{ invalid;";
    const result = validate(css);

    expect(result.ok).toBe(false); // Syntax errors set ok to false
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validateDeclaration", () => {
  it("should skip validation for var() in wrapped declaration", () => {
    // validateDeclaration wraps: `.class {color: var(--my-color);}`
    const result = validateDeclaration("var(--my-color)", "color");

    expect(result.warnings).toHaveLength(0);
  });
});
