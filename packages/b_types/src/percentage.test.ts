import { describe, expect, it } from "vitest";
import { percentageSchema } from "./percentage";

describe("percentageSchema", () => {
  it("validates percentage", () => {
    const result = percentageSchema.parse({ value: 50, unit: "%" });
    expect(result).toEqual({ value: 50, unit: "%" });
  });

  it("validates zero percentage", () => {
    const result = percentageSchema.parse({ value: 0, unit: "%" });
    expect(result).toEqual({ value: 0, unit: "%" });
  });

  it("validates 100%", () => {
    const result = percentageSchema.parse({ value: 100, unit: "%" });
    expect(result).toEqual({ value: 100, unit: "%" });
  });

  it("validates decimal percentages", () => {
    const result = percentageSchema.parse({ value: 33.333, unit: "%" });
    expect(result).toEqual({ value: 33.333, unit: "%" });
  });

  it("validates negative percentages", () => {
    const result = percentageSchema.parse({ value: -10, unit: "%" });
    expect(result).toEqual({ value: -10, unit: "%" });
  });

  it("validates percentages over 100", () => {
    const result = percentageSchema.parse({ value: 150, unit: "%" });
    expect(result).toEqual({ value: 150, unit: "%" });
  });

  it("rejects invalid unit", () => {
    expect(() => percentageSchema.parse({ value: 50, unit: "px" })).toThrow();
  });

  it("rejects missing value", () => {
    expect(() => percentageSchema.parse({ unit: "%" })).toThrow();
  });

  it("rejects missing unit", () => {
    expect(() => percentageSchema.parse({ value: 50 })).toThrow();
  });
});
