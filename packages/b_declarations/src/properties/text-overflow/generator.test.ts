// b_path:: packages/b_declarations/src/properties/text-overflow/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateTextOverflow } from "./generator";
import type { TextOverflowIR } from "./types";

describe("generateTextOverflow", () => {
  it("generates clip", () => {
    const ir: TextOverflowIR = { kind: "keyword", value: "clip" };
    const result = generateTextOverflow(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("clip");
    }
  });

  it("generates ellipsis", () => {
    const ir: TextOverflowIR = { kind: "keyword", value: "ellipsis" };
    const result = generateTextOverflow(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("ellipsis");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: TextOverflowIR = { kind: "keyword", value: kw };
      const result = generateTextOverflow(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });
});
