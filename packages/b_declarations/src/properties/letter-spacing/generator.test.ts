// b_path:: packages/b_declarations/src/properties/letter-spacing/generator.test.ts

import { describe, it, expect } from "vitest";
import { generateLetterSpacing } from "./generator";
import type { LetterSpacingIR } from "./types";

describe("generateLetterSpacing", () => {
  it("generates normal keyword", () => {
    const ir: LetterSpacingIR = { kind: "keyword", value: "normal" };
    const result = generateLetterSpacing(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("normal");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: LetterSpacingIR = { kind: "keyword", value: kw };
      const result = generateLetterSpacing(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });

  it("generates length values", () => {
    const ir: LetterSpacingIR = {
      kind: "value",
      value: { kind: "literal", value: 1, unit: "px" },
    };
    const result = generateLetterSpacing(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("1px");
    }
  });
});
