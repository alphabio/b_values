// b_path:: packages/b_types/src/number.test.ts
import { describe, expect, it } from "vitest";
import { numberSchema } from "./number";

describe("numberSchema", () => {
  it("validates positive integer", () => {
    const result = numberSchema.parse(42);
    expect(result).toBe(42);
  });

  it("validates zero", () => {
    const result = numberSchema.parse(0);
    expect(result).toBe(0);
  });

  it("validates negative number", () => {
    const result = numberSchema.parse(-5);
    expect(result).toBe(-5);
  });

  it("validates decimal", () => {
    const result = numberSchema.parse(3.14);
    expect(result).toBe(3.14);
  });

  it("validates large numbers", () => {
    const result = numberSchema.parse(1000);
    expect(result).toBe(1000);
  });

  it("rejects non-numbers", () => {
    expect(() => numberSchema.parse("42")).toThrow();
  });

  it("rejects null", () => {
    expect(() => numberSchema.parse(null)).toThrow();
  });

  it("rejects undefined", () => {
    expect(() => numberSchema.parse(undefined)).toThrow();
  });
});
