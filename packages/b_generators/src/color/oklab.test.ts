// b_path:: packages/b_generators/src/color/oklab.test.ts
import { describe, expect, it } from "vitest";
import type { OKLabColor } from "@b/types";
import * as OKLab from "./oklab";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("oklab generator", () => {
  it("should generate opaque OKLab color", () => {
    const color: OKLabColor = { kind: "oklab", l: lit(0.5), a: lit(-0.2), b: lit(0.3) };
    const result = OKLab.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("oklab(0.5 -0.2 0.3)");
    }
  });

  it("should generate OKLab color with alpha", () => {
    const color: OKLabColor = {
      kind: "oklab",
      l: lit(0.5),
      a: lit(-0.2),
      b: lit(0.3),
      alpha: lit(0.5),
    };
    const result = OKLab.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("oklab(0.5 -0.2 0.3 / 0.5)");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "oklab", l: lit(0.5) } as OKLabColor;
    const result = OKLab.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("invalid-ir");
    }
  });

  describe("CssValue variants", () => {
    it("should generate OKLab with variable in l", () => {
      const color: OKLabColor = {
        kind: "oklab",
        l: { kind: "variable", name: "--lightness" },
        a: lit(-0.2),
        b: lit(0.3),
      };
      const result = OKLab.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklab(var(--lightness) -0.2 0.3)");
      }
    });

    it("should generate OKLab with variables in all channels", () => {
      const color: OKLabColor = {
        kind: "oklab",
        l: { kind: "variable", name: "--l" },
        a: { kind: "variable", name: "--a" },
        b: { kind: "variable", name: "--b" },
      };
      const result = OKLab.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklab(var(--l) var(--a) var(--b))");
      }
    });

    it("should generate OKLab with keyword", () => {
      const color: OKLabColor = {
        kind: "oklab",
        l: lit(0.5),
        a: { kind: "keyword", value: "none" },
        b: lit(0.3),
      };
      const result = OKLab.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklab(0.5 none 0.3)");
      }
    });

    it("should generate OKLab with calc", () => {
      const color: OKLabColor = {
        kind: "oklab",
        l: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(0.5),
            right: { kind: "variable", name: "--offset" },
          },
        },
        a: lit(-0.2),
        b: lit(0.3),
      };
      const result = OKLab.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklab(calc(0.5 + var(--offset)) -0.2 0.3)");
      }
    });

    it("should generate OKLab with calc in a channel", () => {
      const color: OKLabColor = {
        kind: "oklab",
        l: lit(0.5),
        a: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "*",
            left: lit(-0.1),
            right: lit(2),
          },
        },
        b: lit(0.3),
      };
      const result = OKLab.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklab(0.5 calc(-0.1 * 2) 0.3)");
      }
    });

    it("should generate OKLab with mixed CssValue types", () => {
      const color: OKLabColor = {
        kind: "oklab",
        l: { kind: "variable", name: "--l" },
        a: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(-0.1),
            right: lit(-0.1),
          },
        },
        b: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--opacity" },
      };
      const result = OKLab.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklab(var(--l) calc(-0.1 + -0.1) none / var(--opacity))");
      }
    });
  });
});
