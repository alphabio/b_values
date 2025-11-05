// b_path:: packages/b_generators/src/color/hwb.test.ts
import { describe, expect, it } from "vitest";
import type { HWBColor } from "@b/types";
import * as HWB from "./hwb";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("hwb generator", () => {
  it("should generate opaque HWB color", () => {
    const color: HWBColor = { kind: "hwb", h: lit(120), w: lit(20), b: lit(30) };
    const result = HWB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hwb(120 20 30)");
    }
  });

  it("should generate HWB color with alpha", () => {
    const color: HWBColor = { kind: "hwb", h: lit(120), w: lit(20), b: lit(30), alpha: lit(0.5) };
    const result = HWB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hwb(120 20 30 / 0.5)");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "hwb", h: lit(120) } as HWBColor;
    const result = HWB.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(["invalid-ir", "invalid-union"]).toContain(result.issues[0]?.code);
    }
  });

  describe("CssValue variants", () => {
    it("should generate HWB with variable in hue", () => {
      const color: HWBColor = {
        kind: "hwb",
        h: { kind: "variable", name: "--hue" },
        w: lit(20),
        b: lit(30),
      };
      const result = HWB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hwb(var(--hue) 20 30)");
      }
    });

    it("should generate HWB with variables in all channels", () => {
      const color: HWBColor = {
        kind: "hwb",
        h: { kind: "variable", name: "--h" },
        w: { kind: "variable", name: "--w" },
        b: { kind: "variable", name: "--b" },
      };
      const result = HWB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hwb(var(--h) var(--w) var(--b))");
      }
    });

    it("should generate HWB with keyword", () => {
      const color: HWBColor = {
        kind: "hwb",
        h: lit(120),
        w: { kind: "keyword", value: "none" },
        b: lit(30),
      };
      const result = HWB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hwb(120 none 30)");
      }
    });

    it("should generate HWB with calc in hue", () => {
      const color: HWBColor = {
        kind: "hwb",
        h: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: { kind: "literal", value: 180, unit: "deg" },
            right: { kind: "literal", value: 60, unit: "deg" },
          },
        },
        w: lit(20),
        b: lit(30),
      };
      const result = HWB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hwb(calc(180deg + 60deg) 20 30)");
      }
    });

    it("should generate HWB with calc and variable", () => {
      const color: HWBColor = {
        kind: "hwb",
        h: lit(180),
        w: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "/",
            left: lit(40),
            right: lit(2),
          },
        },
        b: lit(30),
      };
      const result = HWB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hwb(180 calc(40 / 2) 30)");
      }
    });

    it("should generate HWB with mixed CssValue types", () => {
      const color: HWBColor = {
        kind: "hwb",
        h: { kind: "variable", name: "--hue" },
        w: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(10),
            right: lit(10),
          },
        },
        b: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--opacity" },
      };
      const result = HWB.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hwb(var(--hue) calc(10 + 10) none / var(--opacity))");
      }
    });
  });
});
