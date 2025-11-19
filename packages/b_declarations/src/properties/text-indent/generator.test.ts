// b_path:: packages/b_declarations/src/properties/text-indent/generator.test.ts

import { describe, it, expect } from "vitest";
import { generateTextIndent } from "./generator";
import type { TextIndentIR } from "./types";

describe("generateTextIndent", () => {
  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: TextIndentIR = { kind: "keyword", value: kw };
      const result = generateTextIndent(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });

  it("generates length values", () => {
    const ir: TextIndentIR = {
      kind: "value",
      value: { kind: "literal", value: 20, unit: "px" },
    };
    const result = generateTextIndent(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("20px");
    }
  });

  it("generates percentage values", () => {
    const ir: TextIndentIR = {
      kind: "value",
      value: { kind: "literal", value: 50, unit: "%" },
    };
    const result = generateTextIndent(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("50%");
    }
  });
});
