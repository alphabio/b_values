// b_path:: packages/b_generators/src/color/lab.test.ts
import { describe, expect, it } from "vitest";
import type { LABColor } from "@b/types";
import * as LAB from "./lab";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("lab generator", () => {
  it("should generate opaque LAB color", () => {
    const color: LABColor = { kind: "lab", l: lit(50), a: lit(-20), b: lit(30) };
    const result = LAB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("lab(50 -20 30)");
    }
  });

  it("should generate LAB color with alpha", () => {
    const color: LABColor = { kind: "lab", l: lit(50), a: lit(-20), b: lit(30), alpha: lit(0.5) };
    const result = LAB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("lab(50 -20 30 / 0.5)");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "lab", l: lit(50) } as LABColor;
    const result = LAB.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(["invalid-ir", "invalid-union"]).toContain(result.issues[0]?.code);
    }
  });

  describe("CssValue variants", () => {
    it("should generate LAB with variable in l", () => {
      const color: LABColor = {
        kind: "lab",
        l: { kind: "variable", name: "--lightness" },
        a: lit(-20),
        b: lit(30),
      };
      const result = LAB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lab(var(--lightness) -20 30)");
      }
    });

    it("should generate LAB with variables in all channels", () => {
      const color: LABColor = {
        kind: "lab",
        l: { kind: "variable", name: "--l" },
        a: { kind: "variable", name: "--a" },
        b: { kind: "variable", name: "--b" },
      };
      const result = LAB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lab(var(--l) var(--a) var(--b))");
      }
    });

    it("should generate LAB with keyword", () => {
      const color: LABColor = {
        kind: "lab",
        l: lit(50),
        a: { kind: "keyword", value: "none" },
        b: lit(30),
      };
      const result = LAB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lab(50 none 30)");
      }
    });

    it("should generate LAB with calc", () => {
      const color: LABColor = {
        kind: "lab",
        l: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(50),
            right: { kind: "variable", name: "--offset" },
          },
        },
        a: lit(-20),
        b: lit(30),
      };
      const result = LAB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lab(calc(50 + var(--offset)) -20 30)");
      }
    });

    it("should generate LAB with calc in a channel", () => {
      const color: LABColor = {
        kind: "lab",
        l: lit(50),
        a: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "-",
            left: lit(0),
            right: lit(20),
          },
        },
        b: lit(30),
      };
      const result = LAB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lab(50 calc(0 - 20) 30)");
      }
    });

    it("should generate LAB with mixed CssValue types", () => {
      const color: LABColor = {
        kind: "lab",
        l: { kind: "variable", name: "--l" },
        a: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "*",
            left: lit(-10),
            right: lit(2),
          },
        },
        b: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--opacity" },
      };
      const result = LAB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lab(var(--l) calc(-10 * 2) none / var(--opacity))");
      }
    });
  });
});
