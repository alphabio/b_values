// b_path:: packages/b_declarations/src/properties/text-transform/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateTextTransform } from "./generator";
import type { TextTransformIR } from "./types";

describe("generateTextTransform", () => {
  it("generates none", () => {
    const ir: TextTransformIR = { kind: "keyword", value: "none" };
    const result = generateTextTransform(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("none");
    }
  });

  it("generates capitalize", () => {
    const ir: TextTransformIR = { kind: "keyword", value: "capitalize" };
    const result = generateTextTransform(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("capitalize");
    }
  });

  it("generates uppercase", () => {
    const ir: TextTransformIR = { kind: "keyword", value: "uppercase" };
    const result = generateTextTransform(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("uppercase");
    }
  });

  it("generates lowercase", () => {
    const ir: TextTransformIR = { kind: "keyword", value: "lowercase" };
    const result = generateTextTransform(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("lowercase");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: TextTransformIR = { kind: "keyword", value: kw };
      const result = generateTextTransform(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });
});
