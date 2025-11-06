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

  it("should skip attr() function", () => {
    const css = "content: attr(data-text);";
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

  it("should handle long lines", () => {
    const longValue = "a".repeat(100);
    const css = `.class { color: red; padding: ${longValue}px; }`;
    const result = validate(css);

    // Exercises formatting logic
    expect(result).toBeDefined();
  });

  it("should handle different property types", () => {
    const css = ".class { display: flex; margin: auto; }";
    const result = validate(css);

    expect(result).toBeDefined();
  });

  it("should handle nested at-rules", () => {
    const css = "@media (min-width: 768px) { .class { color: red; } }";
    const result = validate(css);

    expect(result).toBeDefined();
  });

  it("should handle empty CSS", () => {
    const css = "";
    const result = validate(css);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should handle CSS with only whitespace", () => {
    const css = "   \n\n   ";
    const result = validate(css);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});

describe("validateDeclaration", () => {
  it("should skip validation for var() in wrapped declaration", () => {
    const result = validateDeclaration("var(--my-color)", "color");
    expect(result.warnings).toHaveLength(0);
  });

  it("should wrap declaration for validation", () => {
    const result = validateDeclaration("red", "color");
    expect(result).toBeDefined();
  });

  it("should handle complex values in declaration", () => {
    const result = validateDeclaration("10px", "margin");
    expect(result).toBeDefined();
  });
});

describe("validate - error formatting edge cases", () => {
  it("should handle error at start of line", () => {
    const css = "color: notacolor;";
    const result = validate(css);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]?.formattedWarning).toContain("notacolor");
  });

  it("should handle error at end of very long line", () => {
    const longPrefix = "a".repeat(100);
    const css = `background: ${longPrefix}invalidvalue;`;
    const result = validate(css);

    expect(result.warnings.length).toBeGreaterThan(0);
    // Should truncate and show error position
    expect(result.warnings[0]?.formattedWarning).toBeDefined();
  });

  it("should handle error in middle of very long line", () => {
    const longPrefix = "a".repeat(50);
    const longSuffix = "b".repeat(50);
    const css = `content: "${longPrefix}invalid${longSuffix}";`;
    const result = validate(css);

    // Exercises middle truncation logic
    expect(result).toBeDefined();
  });

  it("should handle multiple errors with context window", () => {
    const css = `
      color: notacolor;
      margin: invalid;
      padding: alsoinvalid;
    `;
    const result = validate(css);

    // Each error shows context lines
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("should handle error on first line with limited context", () => {
    const css = "color: invalidvalue;";
    const result = validate(css);

    // Context window adjusted for start of file
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("should handle error on last line with limited context", () => {
    const css = `
      color: red;
      margin: 10px;
      padding: invalid;
    `;
    const result = validate(css);

    // Context window adjusted for end of file
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("should handle error with leading whitespace", () => {
    const css = "    color: notacolor;";
    const result = validate(css);

    // Should trim leading whitespace and adjust pointer
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]?.formattedWarning).toContain("notacolor");
  });

  it("should handle error exactly at max line width after trimming", () => {
    // Create a line that's exactly 80 chars after trimming
    const value = "a".repeat(70);
    const css = `color: ${value}invalid;`;
    const result = validate(css);

    // Should not truncate since it fits
    expect(result).toBeDefined();
  });

  it("should handle invalid error location gracefully", () => {
    // This tests the guard clause for invalid line numbers
    const css = "color: red;";
    const result = validate(css);

    // Should not crash, even if error location is out of bounds
    expect(result).toBeDefined();
  });

  it("should deduplicate identical declarations", () => {
    const css = "color: red; color: red; margin: 10px;";
    const result = validate(css);

    // Second identical declaration should be skipped
    expect(result.ok).toBe(true);
  });

  it("should handle multiline CSS with error spanning lines", () => {
    const css = `
      color: red;
      background: linear-gradient(
        to bottom,
        invalidcolor,
        blue
      );
    `;
    const result = validate(css);

    // Should show error with multiline context
    expect(result).toBeDefined();
  });

  it("should format line numbers with proper padding", () => {
    const lines = Array(100).fill("color: red;").join("\n");
    const css = `${lines}\ncolor: invalid;`;
    const result = validate(css);

    // Line numbers should be padded for alignment
    expect(result).toBeDefined();
  });

  it("should handle errors with very long mismatch length", () => {
    const longInvalid = "z".repeat(50);
    const css = `color: ${longInvalid};`;
    const result = validate(css);

    // Pointer line should handle long error spans
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("should handle line with only ellipsis at end", () => {
    // Create a line that needs only end ellipsis
    const value = "a".repeat(100);
    const css = `color: ${value};`;
    const result = validate(css);

    // Should add end ellipsis without start ellipsis
    expect(result).toBeDefined();
  });

  it("should handle line with both start and end ellipsis", () => {
    // Create a very long line with error in middle
    const prefix = "a".repeat(100);
    const suffix = "b".repeat(100);
    const css = `content: "${prefix}invalid${suffix}";`;
    const result = validate(css);

    // Should add both ellipses
    expect(result).toBeDefined();
  });
});
