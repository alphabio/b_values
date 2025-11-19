// b_path:: packages/b_declarations/src/properties/white-space/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateWhiteSpace } from "./generator";
import type { WhiteSpaceIR } from "./types";

describe("generateWhiteSpace", () => {
  it("generates normal", () => {
    const ir: WhiteSpaceIR = { kind: "keyword", value: "normal" };
    const result = generateWhiteSpace(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("normal");
    }
  });

  it("generates pre", () => {
    const ir: WhiteSpaceIR = { kind: "keyword", value: "pre" };
    const result = generateWhiteSpace(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("pre");
    }
  });

  it("generates nowrap", () => {
    const ir: WhiteSpaceIR = { kind: "keyword", value: "nowrap" };
    const result = generateWhiteSpace(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("nowrap");
    }
  });

  it("generates pre-wrap", () => {
    const ir: WhiteSpaceIR = { kind: "keyword", value: "pre-wrap" };
    const result = generateWhiteSpace(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("pre-wrap");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: WhiteSpaceIR = { kind: "keyword", value: kw };
      const result = generateWhiteSpace(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });
});
