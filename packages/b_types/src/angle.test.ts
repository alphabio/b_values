// b_path:: packages/b_types/src/angle.test.ts
import { describe, expect, it } from "vitest";
import { angleSchema } from "./angle";

describe("angleSchema", () => {
  it("validates degrees", () => {
    const result = angleSchema.parse({ value: 45, unit: "deg" });
    expect(result).toEqual({ value: 45, unit: "deg" });
  });

  it("validates radians", () => {
    const result = angleSchema.parse({ value: Math.PI, unit: "rad" });
    expect(result).toEqual({ value: Math.PI, unit: "rad" });
  });

  it("validates gradians", () => {
    const result = angleSchema.parse({ value: 50, unit: "grad" });
    expect(result).toEqual({ value: 50, unit: "grad" });
  });

  it("validates turns", () => {
    const result = angleSchema.parse({ value: 0.25, unit: "turn" });
    expect(result).toEqual({ value: 0.25, unit: "turn" });
  });

  it("validates negative angles", () => {
    const result = angleSchema.parse({ value: -90, unit: "deg" });
    expect(result).toEqual({ value: -90, unit: "deg" });
  });

  it("validates zero", () => {
    const result = angleSchema.parse({ value: 0, unit: "deg" });
    expect(result).toEqual({ value: 0, unit: "deg" });
  });

  it("validates zero without unit", () => {
    const result = angleSchema.parse({ value: 0 });
    expect(result).toEqual({ value: 0 });
  });

  it("rejects invalid unit", () => {
    expect(() => angleSchema.parse({ value: 45, unit: "px" })).toThrow();
  });

  it("rejects missing value", () => {
    expect(() => angleSchema.parse({ unit: "deg" })).toThrow();
  });
});
