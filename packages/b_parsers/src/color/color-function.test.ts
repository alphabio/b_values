// b_path:: packages/b_parsers/src/color/color-function.test.ts
import { describe, expect, it } from "vitest";
import { parseColorFunction } from "./color-function";
import { extractFunctionFromValue } from "../../../b_utils/src/parse/test-utils";

function parseColor(input: string) {
  const func = extractFunctionFromValue(input);
  return parseColorFunction(func);
}

describe("parseColorFunction", () => {
  describe("Valid color spaces", () => {
    it("should parse color(srgb 1 0 0)", () => {
      const result = parseColor("color(srgb 1 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("color");
      expect(result.value?.colorSpace).toBe("srgb");
      expect(result.value?.channels).toHaveLength(3);
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse color(display-p3 0.5 0.5 0.5)", () => {
      const result = parseColor("color(display-p3 0.5 0.5 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.colorSpace).toBe("display-p3");
    });

    it("should parse color(a98-rgb 0.2 0.4 0.6)", () => {
      const result = parseColor("color(a98-rgb 0.2 0.4 0.6)");
      expect(result.ok).toBe(true);
      expect(result.value?.colorSpace).toBe("a98-rgb");
    });

    it("should parse color(prophoto-rgb 0.1 0.2 0.3)", () => {
      const result = parseColor("color(prophoto-rgb 0.1 0.2 0.3)");
      expect(result.ok).toBe(true);
      expect(result.value?.colorSpace).toBe("prophoto-rgb");
    });

    it("should parse color(rec2020 0.3 0.6 0.9)", () => {
      const result = parseColor("color(rec2020 0.3 0.6 0.9)");
      expect(result.ok).toBe(true);
      expect(result.value?.colorSpace).toBe("rec2020");
    });

    it("should parse color(xyz 0.4 0.5 0.6)", () => {
      const result = parseColor("color(xyz 0.4 0.5 0.6)");
      expect(result.ok).toBe(true);
      expect(result.value?.colorSpace).toBe("xyz");
    });

    it("should parse color(xyz-d50 0.4 0.5 0.6)", () => {
      const result = parseColor("color(xyz-d50 0.4 0.5 0.6)");
      expect(result.ok).toBe(true);
      expect(result.value?.colorSpace).toBe("xyz-d50");
    });

    it("should parse color(xyz-d65 0.4 0.5 0.6)", () => {
      const result = parseColor("color(xyz-d65 0.4 0.5 0.6)");
      expect(result.ok).toBe(true);
      expect(result.value?.colorSpace).toBe("xyz-d65");
    });
  });

  describe("With alpha channel", () => {
    it("should parse color(srgb 1 0 0 / 0.5)", () => {
      const result = parseColor("color(srgb 1 0 0 / 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("color");
      expect(result.value?.colorSpace).toBe("srgb");
      expect(result.value?.channels).toHaveLength(3);
      expect(result.value?.alpha).toBeDefined();
    });

    it("should parse color(display-p3 0.5 0.5 0.5 / 0.8)", () => {
      const result = parseColor("color(display-p3 0.5 0.5 0.5 / 0.8)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toBeDefined();
    });

    it("should parse color(srgb 1 1 1 / 1)", () => {
      const result = parseColor("color(srgb 1 1 1 / 1)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toBeDefined();
    });
  });

  describe("Channel values", () => {
    it("should parse literal numbers", () => {
      const result = parseColor("color(srgb 0.5 0.25 0.75)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels[0]?.kind).toBe("literal");
      expect(result.value?.channels[1]?.kind).toBe("literal");
      expect(result.value?.channels[2]?.kind).toBe("literal");
    });

    it("should parse percentages", () => {
      const result = parseColor("color(srgb 50% 25% 75%)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels[0]?.kind).toBe("literal");
      expect(result.value?.channels[1]?.kind).toBe("literal");
      expect(result.value?.channels[2]?.kind).toBe("literal");
    });

    it("should parse mixed values", () => {
      const result = parseColor("color(srgb 0.5 50% 0.75)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels).toHaveLength(3);
    });

    it("should parse calc() in channels", () => {
      const result = parseColor("color(srgb calc(0.5 + 0.5) 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels[0]?.kind).toBe("calc");
    });

    it("should parse var() in channels", () => {
      const result = parseColor("color(srgb var(--red) 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels[0]?.kind).toBe("variable");
    });
  });

  describe("Error handling", () => {
    it("should reject missing color space", () => {
      const result = parseColor("color()");
      expect(result.ok).toBe(false);
    });

    it("should reject only color space without channels", () => {
      const result = parseColor("color(srgb)");
      expect(result.ok).toBe(false);
    });

    it("should reject too few channels", () => {
      const result = parseColor("color(srgb 1 0)");
      expect(result.ok).toBe(false);
    });

    it("should reject invalid color space", () => {
      const result = parseColor("color(invalid 0.5 0.5 0.5)");
      expect(result.ok).toBe(false);
    });
  });

  describe("Boundary values", () => {
    it("should parse all zeros", () => {
      const result = parseColor("color(srgb 0 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels).toHaveLength(3);
    });

    it("should parse all ones", () => {
      const result = parseColor("color(srgb 1 1 1)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels).toHaveLength(3);
    });

    it("should parse negative values", () => {
      const result = parseColor("color(srgb -0.5 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels[0]?.kind).toBe("literal");
    });

    it("should parse values greater than 1", () => {
      const result = parseColor("color(srgb 1.5 2 3)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels[0]?.kind).toBe("literal");
    });
  });

  describe("None keyword", () => {
    it("should parse none in channels", () => {
      const result = parseColor("color(srgb none 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels[0]?.kind).toBe("keyword");
    });

    it("should parse multiple none values", () => {
      const result = parseColor("color(srgb none none none)");
      expect(result.ok).toBe(true);
      expect(result.value?.channels).toHaveLength(3);
    });

    it("should parse none in alpha", () => {
      const result = parseColor("color(srgb 1 0 0 / none)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha?.kind).toBe("keyword");
    });
  });
});
