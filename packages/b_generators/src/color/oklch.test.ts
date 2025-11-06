// b_path:: packages/b_generators/src/color/oklch.test.ts
import { describe, expect, it } from "vitest";
import type { OKLCHColor } from "@b/types";
import * as OKLCH from "./oklch";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("oklch generator", () => {
  it("should generate opaque OKLCH color", () => {
    const color: OKLCHColor = { kind: "oklch", l: lit(0.5), c: lit(0.2), h: lit(180) };
    const result = OKLCH.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("oklch(0.5 0.2 180)");
    }
  });

  it("should generate OKLCH color with alpha", () => {
    const color: OKLCHColor = {
      kind: "oklch",
      l: lit(0.5),
      c: lit(0.2),
      h: lit(180),
      alpha: lit(0.5),
    };
    const result = OKLCH.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("oklch(0.5 0.2 180 / 0.5)");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "oklch", l: lit(0.5) } as OKLCHColor;
    const result = OKLCH.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(["invalid-ir", "invalid-union"]).toContain(result.issues[0]?.code);
    }
  });

  describe("CssValue variants", () => {
    it("should generate OKLCH with variable in l", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: { kind: "variable", name: "--lightness" },
        c: lit(0.2),
        h: lit(180),
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(var(--lightness) 0.2 180)");
      }
    });

    it("should generate OKLCH with variables in all channels", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: { kind: "variable", name: "--l" },
        c: { kind: "variable", name: "--c" },
        h: { kind: "variable", name: "--h" },
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(var(--l) var(--c) var(--h))");
      }
    });

    it("should generate OKLCH with keyword", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: lit(0.5),
        c: { kind: "keyword", value: "none" },
        h: lit(180),
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(0.5 none 180)");
      }
    });

    it("should generate OKLCH with calc in hue", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: lit(0.5),
        c: lit(0.2),
        h: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: { kind: "literal", value: 180, unit: "deg" },
            right: { kind: "literal", value: 45, unit: "deg" },
          },
        },
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(0.5 0.2 calc(180deg + 45deg))");
      }
    });

    it("should generate OKLCH with calc in chroma", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: lit(0.5),
        c: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "*",
            left: lit(0.1),
            right: lit(2),
          },
        },
        h: lit(180),
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(0.5 calc(0.1 * 2) 180)");
      }
    });

    it("should generate OKLCH with mixed CssValue types", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: { kind: "variable", name: "--l" },
        c: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(0.1),
            right: lit(0.1),
          },
        },
        h: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--opacity" },
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(var(--l) calc(0.1 + 0.1) none / var(--opacity))");
      }
    });
  });

  describe("percentage values", () => {
    it("should generate OKLCH with percentage lightness", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: { kind: "literal", value: 80, unit: "%" },
        c: lit(0.3),
        h: lit(150),
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(80% 0.3 150)");
        expect(result.issues).toHaveLength(0); // No warnings for valid percentage
      }
    });

    it("should generate OKLCH with percentage lightness and alpha", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: { kind: "literal", value: 50, unit: "%" },
        c: lit(0.2),
        h: lit(120),
        alpha: { kind: "literal", value: 90, unit: "%" },
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(50% 0.2 120 / 90%)");
        expect(result.issues).toHaveLength(0);
      }
    });

    it("should warn on out-of-range percentage lightness", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: { kind: "literal", value: 150, unit: "%" },
        c: lit(0.2),
        h: lit(180),
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(150% 0.2 180)");
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]?.code).toBe("invalid-value");
        expect(result.issues[0]?.severity).toBe("warning");
        expect(result.issues[0]?.message).toContain("150%");
        expect(result.issues[0]?.message).toContain("0-100%");
      }
    });

    it("should accept valid number lightness (0-1)", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: lit(0.8),
        c: lit(0.3),
        h: lit(150),
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(0.8 0.3 150)");
        expect(result.issues).toHaveLength(0);
      }
    });

    it("should warn on out-of-range number lightness", () => {
      const color: OKLCHColor = {
        kind: "oklch",
        l: lit(1.5),
        c: lit(0.2),
        h: lit(180),
      };
      const result = OKLCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oklch(1.5 0.2 180)");
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]?.code).toBe("invalid-value");
        expect(result.issues[0]?.severity).toBe("warning");
        expect(result.issues[0]?.message).toContain("1.5");
        expect(result.issues[0]?.message).toContain("0-1");
      }
    });
  });
});
