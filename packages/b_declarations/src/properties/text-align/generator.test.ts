// b_path:: packages/b_declarations/src/properties/text-align/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateTextAlign } from "./generator";
import type { TextAlignIR } from "./types";

describe("generateTextAlign", () => {
  it("generates start", () => {
    const ir: TextAlignIR = { kind: "keyword", value: "start" };
    const result = generateTextAlign(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("start");
    }
  });

  it("generates end", () => {
    const ir: TextAlignIR = { kind: "keyword", value: "end" };
    const result = generateTextAlign(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("end");
    }
  });

  it("generates left", () => {
    const ir: TextAlignIR = { kind: "keyword", value: "left" };
    const result = generateTextAlign(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("left");
    }
  });

  it("generates right", () => {
    const ir: TextAlignIR = { kind: "keyword", value: "right" };
    const result = generateTextAlign(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("right");
    }
  });

  it("generates center", () => {
    const ir: TextAlignIR = { kind: "keyword", value: "center" };
    const result = generateTextAlign(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("center");
    }
  });

  it("generates justify", () => {
    const ir: TextAlignIR = { kind: "keyword", value: "justify" };
    const result = generateTextAlign(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("justify");
    }
  });

  it("generates match-parent", () => {
    const ir: TextAlignIR = { kind: "keyword", value: "match-parent" };
    const result = generateTextAlign(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("match-parent");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: TextAlignIR = { kind: "keyword", value: kw };
      const result = generateTextAlign(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });
});
