// b_path:: packages/b_declarations/src/properties/perspective/generator.test.ts

import { describe, expect, it } from "vitest";
import { generatePerspective } from "./generator";
import type { PerspectiveIR } from "./types";

describe("generatePerspective", () => {
  it("generates none keyword", () => {
    const ir: PerspectiveIR = { kind: "keyword", value: "none" };
    const result = generatePerspective(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("none");
    }
  });

  it("generates pixel length", () => {
    const ir: PerspectiveIR = { kind: "length", value: { value: 500, unit: "px" } };
    const result = generatePerspective(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("500px");
    }
  });

  it("generates em length", () => {
    const ir: PerspectiveIR = { kind: "length", value: { value: 10, unit: "em" } };
    const result = generatePerspective(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("10em");
    }
  });

  it("generates rem length", () => {
    const ir: PerspectiveIR = { kind: "length", value: { value: 2.5, unit: "rem" } };
    const result = generatePerspective(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("2.5rem");
    }
  });

  it("generates viewport units", () => {
    const ir: PerspectiveIR = { kind: "length", value: { value: 50, unit: "vh" } };
    const result = generatePerspective(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("50vh");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: PerspectiveIR = { kind: "keyword", value: kw };
      const result = generatePerspective(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });

  it("generates decimal lengths", () => {
    const ir: PerspectiveIR = { kind: "length", value: { value: 123.456, unit: "px" } };
    const result = generatePerspective(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("123.456px");
    }
  });
});
