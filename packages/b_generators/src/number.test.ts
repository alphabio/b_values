// b_path:: packages/b_generators/src/number.test.ts
import { describe, expect, it } from "vitest";
import * as CSSNumber from "./number";

describe("Number.generate", () => {
  it("generates positive integer", () => {
    const result = CSSNumber.generate(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("42");
    }
  });

  it("generates zero", () => {
    const result = CSSNumber.generate(0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("0");
    }
  });

  it("generates negative number", () => {
    const result = CSSNumber.generate(-5);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("-5");
    }
  });

  it("generates decimal", () => {
    const result = CSSNumber.generate(3.14);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("3.14");
    }
  });

  it("generates large numbers", () => {
    const result = CSSNumber.generate(1000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("1000");
    }
  });

  it("generates decimal with many places", () => {
    const result = CSSNumber.generate(1.618033988);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("1.618033988");
    }
  });
});
