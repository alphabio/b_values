// b_path:: packages/b_generators/src/color/rgb.test.ts
import { describe, expect, it } from "vitest";
import type { RGBColor } from "@b/types";
import * as RGB from "./rgb";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("rgb generator", () => {
  it("should generate opaque RGB color", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255), g: lit(0), b: lit(0) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0)");
    }
  });

  it("should generate RGB color with alpha", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255), g: lit(0), b: lit(0), alpha: lit(0.5) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0 / 0.5)");
    }
  });

  it("should omit alpha when fully opaque", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255), g: lit(0), b: lit(0), alpha: lit(1) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0 / 1)");
    }
  });

  it("should round RGB values to integers", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255.7), g: lit(128.3), b: lit(64.9) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255.7 128.3 64.9)");
    }
  });

  it("should return error for null color", () => {
    const result = RGB.generate(null as unknown as RGBColor);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("invalid-ir");
      expect(result.issues[0]?.message).toContain("Invalid RGBColor");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "rgb", r: lit(255) } as RGBColor;
    const result = RGB.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("invalid-ir");
      expect(result.issues[0]?.message).toContain("Invalid RGBColor");
    }
  });

  it("should generate black", () => {
    const color: RGBColor = { kind: "rgb", r: lit(0), g: lit(0), b: lit(0) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(0 0 0)");
    }
  });

  it("should generate white", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255), g: lit(255), b: lit(255) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 255 255)");
    }
  });

  describe("CssValue variants", () => {
    it("should generate RGB with variable", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: { kind: "variable", name: "--red" },
        g: lit(128),
        b: lit(64),
      };
      const result = RGB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("rgb(var(--red) 128 64)");
      }
    });

    it("should generate RGB with variables in all channels", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: { kind: "variable", name: "--r" },
        g: { kind: "variable", name: "--g" },
        b: { kind: "variable", name: "--b" },
      };
      const result = RGB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("rgb(var(--r) var(--g) var(--b))");
      }
    });

    it("should generate RGB with variable fallback", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: { kind: "variable", name: "--red", fallback: lit(255) },
        g: lit(128),
        b: lit(64),
      };
      const result = RGB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("rgb(var(--red, 255) 128 64)");
      }
    });

    it("should generate RGB with keyword", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: { kind: "keyword", value: "none" },
        g: lit(128),
        b: lit(64),
      };
      const result = RGB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("rgb(none 128 64)");
      }
    });

    it("should generate RGB with calc", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(100),
            right: lit(20),
          },
        },
        g: lit(128),
        b: lit(64),
      };
      const result = RGB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("rgb(calc(100 + 20) 128 64)");
      }
    });

    it("should generate RGB with calc and variable", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(100),
            right: { kind: "variable", name: "--offset" },
          },
        },
        g: lit(128),
        b: lit(64),
      };
      const result = RGB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("rgb(calc(100 + var(--offset)) 128 64)");
      }
    });

    it("should generate RGB with mixed CssValue types", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: { kind: "variable", name: "--r" },
        g: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "*",
            left: lit(2),
            right: lit(64),
          },
        },
        b: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--alpha" },
      };
      const result = RGB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("rgb(var(--r) calc(2 * 64) none / var(--alpha))");
      }
    });

    it("should generate RGB with variable alpha", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: lit(255),
        g: lit(128),
        b: lit(64),
        alpha: { kind: "variable", name: "--opacity" },
      };
      const result = RGB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("rgb(255 128 64 / var(--opacity))");
      }
    });
  });
});
