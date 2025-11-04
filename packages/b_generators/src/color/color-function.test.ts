// b_path:: packages/b_generators/src/color/color-function.test.ts
import { describe, expect, it } from "vitest";
import type { ColorFunction } from "@b/types";
import * as ColorFunctionGenerator from "./color-function";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("color-function generator", () => {
  it("should generate color() with sRGB", () => {
    const color: ColorFunction = {
      kind: "color",
      colorSpace: "srgb",
      channels: [lit(1), lit(0.5), lit(0)],
    };
    const result = ColorFunctionGenerator.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("color(srgb 1 0.5 0)");
    }
  });

  it("should generate color() with alpha", () => {
    const color: ColorFunction = {
      kind: "color",
      colorSpace: "display-p3",
      channels: [lit(0.8), lit(0.2), lit(0.1)],
      alpha: lit(0.75),
    };
    const result = ColorFunctionGenerator.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("color(display-p3 0.8 0.2 0.1 / 0.75)");
    }
  });

  it("should generate color() with rec2020", () => {
    const color: ColorFunction = {
      kind: "color",
      colorSpace: "rec2020",
      channels: [lit(0), lit(1), lit(0.5)],
    };
    const result = ColorFunctionGenerator.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("color(rec2020 0 1 0.5)");
    }
  });

  it("should generate color() with prophoto-rgb", () => {
    const color: ColorFunction = {
      kind: "color",
      colorSpace: "prophoto-rgb",
      channels: [lit(0.3), lit(0.6), lit(0.9)],
    };
    const result = ColorFunctionGenerator.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("color(prophoto-rgb 0.3 0.6 0.9)");
    }
  });

  it("should generate color() with xyz space", () => {
    const color: ColorFunction = {
      kind: "color",
      colorSpace: "xyz",
      channels: [lit(0.4), lit(0.2), lit(0.3)],
    };
    const result = ColorFunctionGenerator.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("color(xyz 0.4 0.2 0.3)");
    }
  });

  it("should generate color() with none keyword", () => {
    const color: ColorFunction = {
      kind: "color",
      colorSpace: "srgb",
      channels: [{ kind: "keyword", value: "none" }, lit(0.5), lit(0)],
    };
    const result = ColorFunctionGenerator.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("color(srgb none 0.5 0)");
    }
  });

  describe("Error cases", () => {
    it("should return error for null", () => {
      const result = ColorFunctionGenerator.generate(null as unknown as ColorFunction);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("invalid-ir");
      }
    });

    it("should return error for undefined", () => {
      const result = ColorFunctionGenerator.generate(undefined as unknown as ColorFunction);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("invalid-ir");
      }
    });

    it("should return error for non-object", () => {
      const result = ColorFunctionGenerator.generate("invalid" as unknown as ColorFunction);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("invalid-ir");
      }
    });

    it("should return error for missing colorSpace", () => {
      const result = ColorFunctionGenerator.generate({
        kind: "color",
        channels: [lit(1), lit(0), lit(0)],
      } as unknown as ColorFunction);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("missing-required-field");
      }
    });

    it("should return error for missing channels", () => {
      const result = ColorFunctionGenerator.generate({
        kind: "color",
        colorSpace: "srgb",
      } as unknown as ColorFunction);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("missing-required-field");
      }
    });
  });
});
