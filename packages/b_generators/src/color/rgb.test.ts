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
      expect(["invalid-ir", "invalid-union"]).toContain(result.issues[0]?.code);
      expect(result.issues[0]?.message).toContain("expected object");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "rgb", r: lit(255) } as RGBColor;
    const result = RGB.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(["invalid-ir", "invalid-union"]).toContain(result.issues[0]?.code);
      // Zod reports first missing field
      expect(result.issues[0]?.message).toContain("Expected");
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

  describe("Semantic validation", () => {
    it("should warn for out-of-range RGB components", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: lit(-255),
        g: lit(128),
        b: lit(500),
      };
      const result = RGB.generate(color);

      expect(result.ok).toBe(true); // Still generates!
      if (result.ok) {
        expect(result.value).toBe("rgb(-255 128 500)");
      }
      expect(result.issues).toHaveLength(2); // r and b warnings

      expect(result.issues[0]).toMatchObject({
        severity: "warning",
        code: "invalid-value",
        message: expect.stringContaining("out of valid range"),
        path: ["r"],
        suggestion: expect.stringContaining("between 0 and 255"),
      });

      expect(result.issues[1]).toMatchObject({
        severity: "warning",
        code: "invalid-value",
        message: expect.stringContaining("out of valid range"),
        path: ["b"],
      });
    });

    it("should not warn for valid RGB components", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: lit(255),
        g: lit(128),
        b: lit(0),
      };
      const result = RGB.generate(color);

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0); // No warnings
    });

    it("should warn for out-of-range alpha", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: lit(255),
        g: lit(128),
        b: lit(0),
        alpha: lit(2),
      };
      const result = RGB.generate(color);

      expect(result.ok).toBe(true); // Still generates
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toMatchObject({
        severity: "warning",
        code: "invalid-value",
        message: expect.stringContaining("out of valid range"),
        path: ["alpha"],
      });
    });

    it("should not warn for variables", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: { kind: "variable", name: "--r" },
        g: lit(128),
        b: lit(0),
      };
      const result = RGB.generate(color);

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0); // Can't validate variables
    });

    it("should handle boundary values correctly", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: lit(0),
        g: lit(255),
        b: lit(128),
      };
      const result = RGB.generate(color);

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0); // No warnings for boundaries
    });

    it("should warn for slightly out-of-range values", () => {
      const color: RGBColor = {
        kind: "rgb",
        r: lit(256), // Just over the limit
        g: lit(128),
        b: lit(-1), // Just under the limit
      };
      const result = RGB.generate(color);

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(2);
    });
  });
});
