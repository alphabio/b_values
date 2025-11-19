// b_path:: packages/b_declarations/src/properties/word-spacing/generator.test.ts

import { describe, it, expect } from "vitest";
import { generateWordSpacing } from "./generator";
import type { WordSpacingIR } from "./types";

describe("generateWordSpacing", () => {
  it("generates normal keyword", () => {
    const ir: WordSpacingIR = { kind: "keyword", value: "normal" };
    const result = generateWordSpacing(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("normal");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: WordSpacingIR = { kind: "keyword", value: kw };
      const result = generateWordSpacing(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });

  it("generates length values", () => {
    const ir: WordSpacingIR = {
      kind: "value",
      value: { kind: "literal", value: 5, unit: "px" },
    };
    const result = generateWordSpacing(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("5px");
    }
  });

  it("generates percentage values", () => {
    const ir: WordSpacingIR = {
      kind: "value",
      value: { kind: "literal", value: 10, unit: "%" },
    };
    const result = generateWordSpacing(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("10%");
    }
  });
});
