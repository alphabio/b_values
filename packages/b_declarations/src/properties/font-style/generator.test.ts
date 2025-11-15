// b_path:: packages/b_declarations/src/properties/font-style/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateFontStyle } from "./generator";
import type { FontStyleIR } from "./types";

describe("generateFontStyle", () => {
  describe("simple keywords", () => {
    it("generates normal", () => {
      const ir: FontStyleIR = { kind: "keyword", value: "normal" };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("normal");
      }
    });

    it("generates italic", () => {
      const ir: FontStyleIR = { kind: "keyword", value: "italic" };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("italic");
      }
    });
  });

  describe("oblique without angle", () => {
    it("generates plain oblique", () => {
      const ir: FontStyleIR = { kind: "oblique" };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oblique");
      }
    });
  });

  describe("oblique with angle", () => {
    it("generates oblique with deg", () => {
      const ir: FontStyleIR = { kind: "oblique", angle: { value: 14, unit: "deg" } };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oblique 14deg");
      }
    });

    it("generates oblique with negative angle", () => {
      const ir: FontStyleIR = { kind: "oblique", angle: { value: -14, unit: "deg" } };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oblique -14deg");
      }
    });

    it("generates oblique with rad", () => {
      const ir: FontStyleIR = { kind: "oblique", angle: { value: 0.25, unit: "rad" } };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oblique 0.25rad");
      }
    });

    it("generates oblique with grad", () => {
      const ir: FontStyleIR = { kind: "oblique", angle: { value: 15, unit: "grad" } };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oblique 15grad");
      }
    });

    it("generates oblique with turn", () => {
      const ir: FontStyleIR = { kind: "oblique", angle: { value: 0.04, unit: "turn" } };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oblique 0.04turn");
      }
    });

    it("generates oblique with zero angle", () => {
      const ir: FontStyleIR = { kind: "oblique", angle: { value: 0, unit: "deg" } };
      const result = generateFontStyle(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("oblique 0deg");
      }
    });
  });

  describe("CSS-wide keywords", () => {
    it("generates CSS-wide keywords", () => {
      const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
      for (const kw of keywords) {
        const ir: FontStyleIR = { kind: "keyword", value: kw };
        const result = generateFontStyle(ir);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe(kw);
        }
      }
    });
  });
});
