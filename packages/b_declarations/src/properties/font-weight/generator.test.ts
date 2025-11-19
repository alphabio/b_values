// b_path:: packages/b_declarations/src/properties/font-weight/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateFontWeight } from "./generator";
import type { FontWeightIR } from "./types";

describe("generateFontWeight", () => {
  describe("keywords", () => {
    it("generates normal", () => {
      const ir: FontWeightIR = { kind: "keyword", value: "normal" };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("normal");
      }
    });

    it("generates bold", () => {
      const ir: FontWeightIR = { kind: "keyword", value: "bold" };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("bold");
      }
    });

    it("generates bolder", () => {
      const ir: FontWeightIR = { kind: "keyword", value: "bolder" };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("bolder");
      }
    });

    it("generates lighter", () => {
      const ir: FontWeightIR = { kind: "keyword", value: "lighter" };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lighter");
      }
    });
  });

  describe("numeric values", () => {
    it("generates integer weight 400", () => {
      const ir: FontWeightIR = { kind: "value", value: { kind: "literal", value: 400 } };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("400");
      }
    });

    it("generates integer weight 700", () => {
      const ir: FontWeightIR = { kind: "value", value: { kind: "literal", value: 700 } };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("700");
      }
    });

    it("generates decimal weight 350.5", () => {
      const ir: FontWeightIR = { kind: "value", value: { kind: "literal", value: 350.5 } };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("350.5");
      }
    });

    it("generates minimum weight 1", () => {
      const ir: FontWeightIR = { kind: "value", value: { kind: "literal", value: 1 } };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("1");
      }
    });

    it("generates maximum weight 1000", () => {
      const ir: FontWeightIR = { kind: "value", value: { kind: "literal", value: 1000 } };
      const result = generateFontWeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("1000");
      }
    });
  });

  describe("CSS-wide keywords", () => {
    it("generates CSS-wide keywords", () => {
      const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
      for (const kw of keywords) {
        const ir: FontWeightIR = { kind: "keyword", value: kw };
        const result = generateFontWeight(ir);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe(kw);
        }
      }
    });
  });
});
