// b_path:: packages/b_parsers/src/utils/function-dispatcher.test.ts
import { describe, expect, it } from "vitest";
import { parseComplexFunction } from "./function-dispatcher";
import { extractFunctionFromValue } from "@b/utils";

function parseFunction(input: string) {
  return parseComplexFunction(extractFunctionFromValue(input));
}

describe("parseComplexFunction", () => {
  describe("Math functions", () => {
    it("should dispatch calc()", () => {
      const result = parseFunction("calc(10px + 5px)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("calc");
    });

    it("should dispatch min()", () => {
      const result = parseFunction("min(10px, 20px)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("min");
    });

    it("should dispatch max()", () => {
      const result = parseFunction("max(10px, 20px)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("max");
    });

    it("should dispatch clamp()", () => {
      const result = parseFunction("clamp(10px, 50px, 100px)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("clamp");
    });
  });

  describe("RGB color functions", () => {
    it("should dispatch rgb()", () => {
      const result = parseFunction("rgb(255 0 0)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("rgb");
    });

    it("should dispatch rgba()", () => {
      const result = parseFunction("rgba(255 0 0 / 0.5)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("rgb");
    });
  });

  describe("HSL color functions", () => {
    it("should dispatch hsl()", () => {
      const result = parseFunction("hsl(0 100% 50%)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("hsl");
    });

    it("should dispatch hsla()", () => {
      const result = parseFunction("hsla(0 100% 50% / 0.5)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("hsl");
    });
  });

  describe("HWB color functions", () => {
    it("should dispatch hwb()", () => {
      const result = parseFunction("hwb(0 0% 0%)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("hwb");
    });
  });

  describe("Lab color functions", () => {
    it("should dispatch lab()", () => {
      const result = parseFunction("lab(50% 0 0)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("lab");
    });

    it("should dispatch lch()", () => {
      const result = parseFunction("lch(50% 0 0)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("lch");
    });
  });

  describe("OKLab color functions", () => {
    it("should dispatch oklab()", () => {
      const result = parseFunction("oklab(0.5 0 0)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("oklab");
    });

    it("should dispatch oklch()", () => {
      const result = parseFunction("oklch(0.5 0 0)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
      expect(result?.value?.kind).toBe("oklch");
    });
  });

  describe("Case insensitivity", () => {
    it("should handle mixed case calc", () => {
      const result = parseFunction("CaLc(10px + 5px)");
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
    });
  });

  describe("Unknown functions", () => {
    it("should return null for linear-gradient()", () => {
      const result = parseFunction("linear-gradient(red, blue)");
      expect(result).toBeNull();
    });

    it("should return null for radial-gradient()", () => {
      const result = parseFunction("radial-gradient(red, blue)");
      expect(result).toBeNull();
    });

    it("should return null for unknown function", () => {
      const result = parseFunction("unknown(value)");
      expect(result).toBeNull();
    });
  });
});
