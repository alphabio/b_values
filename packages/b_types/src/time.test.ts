// b_path:: packages/b_types/src/time.test.ts
import { describe, expect, it } from "vitest";
import { timeSchema } from "./time";

describe("timeSchema", () => {
  it("validates seconds", () => {
    const result = timeSchema.parse({ value: 2, unit: "s" });
    expect(result).toEqual({ value: 2, unit: "s" });
  });

  it("validates milliseconds", () => {
    const result = timeSchema.parse({ value: 300, unit: "ms" });
    expect(result).toEqual({ value: 300, unit: "ms" });
  });

  it("validates negative values", () => {
    const result = timeSchema.parse({ value: -1, unit: "s" });
    expect(result).toEqual({ value: -1, unit: "s" });
  });

  it("validates zero", () => {
    const result = timeSchema.parse({ value: 0, unit: "s" });
    expect(result).toEqual({ value: 0, unit: "s" });
  });

  it("validates decimal values", () => {
    const result = timeSchema.parse({ value: 0.5, unit: "s" });
    expect(result).toEqual({ value: 0.5, unit: "s" });
  });

  it("rejects invalid unit", () => {
    expect(() => timeSchema.parse({ value: 2, unit: "px" })).toThrow();
  });

  it("rejects missing value", () => {
    expect(() => timeSchema.parse({ unit: "s" })).toThrow();
  });

  it("rejects missing unit", () => {
    expect(() => timeSchema.parse({ value: 2 })).toThrow();
  });
});
