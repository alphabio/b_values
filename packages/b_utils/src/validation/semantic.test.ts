// b_path:: packages/b_utils/src/validation/semantic.test.ts

import { describe, expect, it } from "vitest";
import type { CssValue } from "@b/types";
import {
  checkAlpha,
  checkHue,
  checkLiteralRange,
  checkPercentage,
  checkRGBComponent,
  collectWarnings,
} from "./semantic";

// Helper to create literal values
const lit = (value: number, unit?: string): CssValue => ({
  kind: "literal",
  value,
  unit,
});

// Helper to create variable references
const varRef = (name: string): CssValue => ({
  kind: "variable",
  name,
});

describe("checkLiteralRange", () => {
  it("should warn for values below minimum", () => {
    const warning = checkLiteralRange(lit(-10), 0, 255, { field: "test" });
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe("warning");
    expect(warning?.code).toBe("invalid-value");
    expect(warning?.message).toContain("out of valid range");
    expect(warning?.message).toContain("-10");
    expect(warning?.path).toEqual(["test"]);
  });

  it("should warn for values above maximum", () => {
    const warning = checkLiteralRange(lit(300), 0, 255, { field: "test" });
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("300");
    expect(warning?.message).toContain("0-255");
  });

  it("should not warn for values in range", () => {
    expect(checkLiteralRange(lit(0), 0, 255, { field: "test" })).toBeUndefined();
    expect(checkLiteralRange(lit(128), 0, 255, { field: "test" })).toBeUndefined();
    expect(checkLiteralRange(lit(255), 0, 255, { field: "test" })).toBeUndefined();
  });

  it("should not warn for non-literal values", () => {
    expect(checkLiteralRange(varRef("--color"), 0, 255, { field: "test" })).toBeUndefined();
  });

  it("should include unit in message", () => {
    const warning = checkLiteralRange(lit(150), 0, 100, {
      field: "saturation",
      unit: "%",
    });
    expect(warning?.message).toContain("150%");
    expect(warning?.message).toContain("0-100%");
  });

  it("should include type name in message", () => {
    const warning = checkLiteralRange(lit(300), 0, 255, {
      field: "r",
      typeName: "RGBColor",
    });
    expect(warning?.message).toContain("RGBColor");
  });

  it("should provide helpful suggestion", () => {
    const warning = checkLiteralRange(lit(300), 0, 255, { field: "r" });
    expect(warning?.suggestion).toContain("between 0 and 255");
  });
});

describe("checkRGBComponent", () => {
  it("should warn for negative values", () => {
    const warning = checkRGBComponent(lit(-255), "r", "RGBColor");
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe("warning");
    expect(warning?.message).toContain("out of valid range");
    expect(warning?.message).toContain("-255");
    expect(warning?.path).toEqual(["r"]);
  });

  it("should warn for values over 255", () => {
    const warning = checkRGBComponent(lit(500), "r", "RGBColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("500");
    expect(warning?.message).toContain("0-255");
  });

  it("should not warn for valid integer values", () => {
    expect(checkRGBComponent(lit(0), "r")).toBeUndefined();
    expect(checkRGBComponent(lit(128), "g")).toBeUndefined();
    expect(checkRGBComponent(lit(255), "b")).toBeUndefined();
  });

  it("should not warn for variables", () => {
    expect(checkRGBComponent(varRef("--r"), "r")).toBeUndefined();
  });

  it("should check percentage range (0-100%)", () => {
    const warning = checkRGBComponent(lit(150, "%"), "r", "RGBColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("150%");
    expect(warning?.message).toContain("0-100%");
  });

  it("should not warn for valid percentages", () => {
    expect(checkRGBComponent(lit(0, "%"), "r")).toBeUndefined();
    expect(checkRGBComponent(lit(50, "%"), "g")).toBeUndefined();
    expect(checkRGBComponent(lit(100, "%"), "b")).toBeUndefined();
  });
});

describe("checkAlpha", () => {
  it("should warn for negative alpha", () => {
    const warning = checkAlpha(lit(-0.5), "alpha", "RGBColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("-0.5");
    expect(warning?.message).toContain("0-1");
  });

  it("should warn for alpha over 1", () => {
    const warning = checkAlpha(lit(1.5), "alpha", "RGBColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("1.5");
    expect(warning?.message).toContain("0-1");
  });

  it("should not warn for valid alpha values", () => {
    expect(checkAlpha(lit(0), "alpha")).toBeUndefined();
    expect(checkAlpha(lit(0.5), "alpha")).toBeUndefined();
    expect(checkAlpha(lit(1), "alpha")).toBeUndefined();
  });

  it("should check percentage range (0-100%)", () => {
    const warning = checkAlpha(lit(150, "%"), "alpha", "RGBColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("150%");
    expect(warning?.message).toContain("0-100%");
  });

  it("should not warn for valid percentage alpha", () => {
    expect(checkAlpha(lit(0, "%"), "alpha")).toBeUndefined();
    expect(checkAlpha(lit(50, "%"), "alpha")).toBeUndefined();
    expect(checkAlpha(lit(100, "%"), "alpha")).toBeUndefined();
  });

  it("should not warn for variables", () => {
    expect(checkAlpha(varRef("--alpha"), "alpha")).toBeUndefined();
  });
});

describe("checkHue", () => {
  it("should not warn for typical hue values", () => {
    expect(checkHue(lit(0), "h")).toBeUndefined();
    expect(checkHue(lit(180), "h")).toBeUndefined();
    expect(checkHue(lit(360), "h")).toBeUndefined();
  });

  it("should warn for unusually large positive values", () => {
    const warning = checkHue(lit(900, "deg"), "h", "HSLColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("unusually large");
    expect(warning?.message).toContain("900deg");
  });

  it("should warn for unusually large negative values", () => {
    const warning = checkHue(lit(-500, "deg"), "h", "HSLColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("unusually large");
  });

  it("should allow values in extended range (wrapping)", () => {
    expect(checkHue(lit(-180), "h")).toBeUndefined();
    expect(checkHue(lit(450), "h")).toBeUndefined();
  });

  it("should warn for unsupported units", () => {
    const warning = checkHue(lit(180, "px"), "h", "HSLColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("unsupported unit");
    expect(warning?.message).toContain("px");
    expect(warning?.suggestion).toContain("deg, rad, grad, or turn");
  });

  it("should accept all valid angle units", () => {
    expect(checkHue(lit(180, "deg"), "h")).toBeUndefined();
    expect(checkHue(lit(3.14, "rad"), "h")).toBeUndefined();
    expect(checkHue(lit(200, "grad"), "h")).toBeUndefined();
    expect(checkHue(lit(0.5, "turn"), "h")).toBeUndefined();
  });

  it("should not warn for variables", () => {
    expect(checkHue(varRef("--hue"), "h")).toBeUndefined();
  });
});

describe("checkPercentage", () => {
  it("should warn for negative percentages", () => {
    const warning = checkPercentage(lit(-10, "%"), "saturation", "HSLColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("-10%");
    expect(warning?.message).toContain("0-100%");
  });

  it("should warn for percentages over 100", () => {
    const warning = checkPercentage(lit(150, "%"), "saturation", "HSLColor");
    expect(warning).toBeDefined();
    expect(warning?.message).toContain("150%");
  });

  it("should not warn for valid percentages", () => {
    expect(checkPercentage(lit(0, "%"), "s")).toBeUndefined();
    expect(checkPercentage(lit(50, "%"), "l")).toBeUndefined();
    expect(checkPercentage(lit(100, "%"), "s")).toBeUndefined();
  });

  it("should not warn for variables", () => {
    expect(checkPercentage(varRef("--saturation"), "s")).toBeUndefined();
  });
});

describe("collectWarnings", () => {
  it("should filter out undefined values", () => {
    const warning1 = checkRGBComponent(lit(-255), "r");
    const warning2 = undefined;
    const warning3 = checkRGBComponent(lit(500), "b");

    const warnings = collectWarnings(warning1, warning2, warning3);

    expect(warnings).toHaveLength(2);
    expect(warnings[0]?.path).toEqual(["r"]);
    expect(warnings[1]?.path).toEqual(["b"]);
  });

  it("should return empty array when all undefined", () => {
    const warnings = collectWarnings(undefined, undefined, undefined);
    expect(warnings).toHaveLength(0);
  });

  it("should handle mixed validators", () => {
    const warnings = collectWarnings(
      checkRGBComponent(lit(255), "r"), // Valid - undefined
      checkRGBComponent(lit(500), "g"), // Invalid - warning
      checkAlpha(lit(0.5), "alpha"), // Valid - undefined
      checkAlpha(lit(2), "alpha"), // Invalid - warning
    );

    expect(warnings).toHaveLength(2);
    expect(warnings[0]?.path).toEqual(["g"]);
    expect(warnings[1]?.path).toEqual(["alpha"]);
  });
});
