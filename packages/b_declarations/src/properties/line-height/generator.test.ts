// b_path:: packages/b_declarations/src/properties/line-height/generator.test.ts

import { describe, it, expect } from "vitest";
import { generateLineHeight } from "./generator";
import type { LineHeightIR } from "./types";

describe("generateLineHeight", () => {
  it("generates normal keyword", () => {
    const ir: LineHeightIR = { kind: "keyword", value: "normal" };
    const result = generateLineHeight(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("normal");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "revert", "revert-layer", "unset"] as const;
    for (const keyword of keywords) {
      const ir: LineHeightIR = { kind: "keyword", value: keyword };
      const result = generateLineHeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(keyword);
      }
    }
  });

  it("generates unitless number", () => {
    const ir: LineHeightIR = {
      kind: "value",
      value: { kind: "literal", value: 1.5 },
    };
    const result = generateLineHeight(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("1.5");
    }
  });

  it("generates length values", () => {
    const testCases = [
      { value: { kind: "literal" as const, value: 20, unit: "px" }, expected: "20px" },
      { value: { kind: "literal" as const, value: 1.5, unit: "em" }, expected: "1.5em" },
      { value: { kind: "literal" as const, value: 2, unit: "rem" }, expected: "2rem" },
      { value: { kind: "literal" as const, value: 150, unit: "%" }, expected: "150%" },
    ];

    for (const { value, expected } of testCases) {
      const ir: LineHeightIR = { kind: "value", value };
      const result = generateLineHeight(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(expected);
      }
    }
  });
});
