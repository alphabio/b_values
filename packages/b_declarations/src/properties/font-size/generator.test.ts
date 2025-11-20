// b_path:: packages/b_declarations/src/properties/font-size/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateFontSize } from "./generator";
import type { FontSizeIR } from "./types";

describe("generateFontSize", () => {
  describe("absolute size keywords", () => {
    it("generates xx-small", () => {
      const ir: FontSizeIR = { kind: "keyword", value: "xx-small" };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("xx-small");
      }
    });

    it("generates medium", () => {
      const ir: FontSizeIR = { kind: "keyword", value: "medium" };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("medium");
      }
    });

    it("generates xxx-large", () => {
      const ir: FontSizeIR = { kind: "keyword", value: "xxx-large" };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("xxx-large");
      }
    });
  });

  describe("relative size keywords", () => {
    it("generates smaller", () => {
      const ir: FontSizeIR = { kind: "keyword", value: "smaller" };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("smaller");
      }
    });

    it("generates larger", () => {
      const ir: FontSizeIR = { kind: "keyword", value: "larger" };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("larger");
      }
    });
  });

  describe("length values", () => {
    it("generates px", () => {
      const ir: FontSizeIR = { kind: "value", value: { kind: "literal", value: 16, unit: "px" } };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("16px");
      }
    });

    it("generates em", () => {
      const ir: FontSizeIR = { kind: "value", value: { kind: "literal", value: 1.5, unit: "em" } };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("1.5em");
      }
    });

    it("generates rem", () => {
      const ir: FontSizeIR = { kind: "value", value: { kind: "literal", value: 2, unit: "rem" } };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("2rem");
      }
    });
  });

  describe("percentage values", () => {
    it("generates percentage", () => {
      const ir: FontSizeIR = { kind: "value", value: { kind: "literal", value: 120, unit: "%" } };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("120%");
      }
    });
  });

  describe("math functions", () => {
    it("generates calc()", () => {
      const ir: FontSizeIR = {
        kind: "value",
        value: {
          kind: "function",
          name: "calc",
          args: [{ kind: "keyword", value: "16px + 2em" }],
        },
      };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain("calc");
      }
    });

    it("generates clamp()", () => {
      const ir: FontSizeIR = {
        kind: "value",
        value: {
          kind: "function",
          name: "clamp",
          args: [{ kind: "keyword", value: "1rem, 2vw, 2rem" }],
        },
      };
      const result = generateFontSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain("clamp");
      }
    });
  });

  describe("CSS-wide keywords", () => {
    it("generates CSS-wide keywords", () => {
      const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
      for (const kw of keywords) {
        const ir: FontSizeIR = { kind: "keyword", value: kw };
        const result = generateFontSize(ir);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe(kw);
        }
      }
    });
  });
});
