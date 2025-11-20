// b_path:: packages/b_declarations/src/properties/font-variant/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateFontVariant } from "./generator";
import type { FontVariantIR } from "./types";

describe("generateFontVariant", () => {
  it("generates normal", () => {
    const ir: FontVariantIR = { kind: "keyword", value: "normal" };
    const result = generateFontVariant(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("normal");
    }
  });

  it("generates small-caps", () => {
    const ir: FontVariantIR = { kind: "keyword", value: "small-caps" };
    const result = generateFontVariant(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("small-caps");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: FontVariantIR = { kind: "keyword", value: kw };
      const result = generateFontVariant(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });
});
