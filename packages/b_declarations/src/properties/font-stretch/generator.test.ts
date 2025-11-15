// b_path:: packages/b_declarations/src/properties/font-stretch/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateFontStretch } from "./generator";
import type { FontStretchIR } from "./types";

describe("generateFontStretch", () => {
  it("generates normal", () => {
    const ir: FontStretchIR = { kind: "keyword", value: "normal" };
    const result = generateFontStretch(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("normal");
    }
  });

  it("generates ultra-condensed", () => {
    const ir: FontStretchIR = { kind: "keyword", value: "ultra-condensed" };
    const result = generateFontStretch(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("ultra-condensed");
    }
  });

  it("generates condensed", () => {
    const ir: FontStretchIR = { kind: "keyword", value: "condensed" };
    const result = generateFontStretch(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("condensed");
    }
  });

  it("generates expanded", () => {
    const ir: FontStretchIR = { kind: "keyword", value: "expanded" };
    const result = generateFontStretch(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("expanded");
    }
  });

  it("generates ultra-expanded", () => {
    const ir: FontStretchIR = { kind: "keyword", value: "ultra-expanded" };
    const result = generateFontStretch(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("ultra-expanded");
    }
  });

  it("generates semi-condensed", () => {
    const ir: FontStretchIR = { kind: "keyword", value: "semi-condensed" };
    const result = generateFontStretch(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("semi-condensed");
    }
  });

  it("generates semi-expanded", () => {
    const ir: FontStretchIR = { kind: "keyword", value: "semi-expanded" };
    const result = generateFontStretch(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("semi-expanded");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: FontStretchIR = { kind: "keyword", value: kw };
      const result = generateFontStretch(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });
});
