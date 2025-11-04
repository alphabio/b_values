// b_path:: packages/b_generators/src/color/color.test.ts
import { describe, expect, it } from "vitest";
import type * as Type from "@b/types";
import * as Color from "./color";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("color generator (dispatcher)", () => {
  it("should generate hex color", () => {
    const color: Type.HexColor = { kind: "hex", value: "#ff0000" };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("#ff0000");
    }
  });

  it("should generate named color", () => {
    const color: Type.NamedColor = { kind: "named", name: "red" };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("red");
    }
  });

  it("should generate RGB color", () => {
    const color: Type.RGBColor = { kind: "rgb", r: lit(255), g: lit(0), b: lit(0) };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0)");
    }
  });

  it("should generate HSL color", () => {
    const color: Type.HSLColor = { kind: "hsl", h: lit(120), s: lit(100), l: lit(50) };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(120 100 50)");
    }
  });

  it("should generate HWB color", () => {
    const color: Type.HWBColor = {
      kind: "hwb",
      h: lit(240),
      w: { kind: "literal", value: 20, unit: "%" },
      b: { kind: "literal", value: 30, unit: "%" },
    };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hwb(240 20% 30%)");
    }
  });

  it("should generate LAB color", () => {
    const color: Type.LABColor = { kind: "lab", l: lit(50), a: lit(20), b: lit(30) };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("lab(50 20 30)");
    }
  });

  it("should generate LCH color", () => {
    const color: Type.LCHColor = { kind: "lch", l: lit(50), c: lit(40), h: lit(180) };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("lch(50 40 180)");
    }
  });

  it("should generate OKLab color", () => {
    const color: Type.OKLabColor = { kind: "oklab", l: lit(0.5), a: lit(0.1), b: lit(0.2) };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("oklab(0.5 0.1 0.2)");
    }
  });

  it("should generate OKLCH color", () => {
    const color: Type.OKLCHColor = { kind: "oklch", l: lit(0.5), c: lit(0.2), h: lit(180) };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("oklch(0.5 0.2 180)");
    }
  });

  it("should generate special color (currentColor)", () => {
    const color: Type.SpecialColor = { kind: "special", keyword: "currentcolor" };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("currentcolor");
    }
  });

  it("should generate color() function", () => {
    const color: Type.ColorFunction = {
      kind: "color",
      colorSpace: "srgb",
      channels: [lit(1), lit(0), lit(0)],
    };
    const result = Color.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("color(srgb 1 0 0)");
    }
  });

  describe("Error cases", () => {
    it("should return error for null", () => {
      const result = Color.generate(null as unknown as Type.Color);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("missing-required-field");
      }
    });

    it("should return error for undefined", () => {
      const result = Color.generate(undefined as unknown as Type.Color);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("missing-required-field");
      }
    });

    it("should return error for non-object", () => {
      const result = Color.generate("red" as unknown as Type.Color);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("missing-required-field");
      }
    });

    it("should return error for missing kind field", () => {
      const result = Color.generate({} as unknown as Type.Color);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("missing-required-field");
      }
    });

    it("should return error for unknown color kind", () => {
      const result = Color.generate({ kind: "unknown" } as unknown as Type.Color);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("unsupported-kind");
      }
    });
  });
});
