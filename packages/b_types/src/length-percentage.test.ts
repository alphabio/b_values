// b_path:: packages/b_types/src/length-percentage.test.ts
import { describe, expect, it } from "vitest";
import { lengthPercentageSchema } from "./length-percentage";

describe("lengthPercentageSchema", () => {
  it("validates length", () => {
    const result = lengthPercentageSchema.parse({ value: 10, unit: "px" });
    expect(result).toEqual({ value: 10, unit: "px" });
  });

  it("validates percentage", () => {
    const result = lengthPercentageSchema.parse({ value: 50, unit: "%" });
    expect(result).toEqual({ value: 50, unit: "%" });
  });

  it("validates various length units", () => {
    expect(lengthPercentageSchema.parse({ value: 1, unit: "rem" })).toEqual({ value: 1, unit: "rem" });
    expect(lengthPercentageSchema.parse({ value: 2, unit: "em" })).toEqual({ value: 2, unit: "em" });
    expect(lengthPercentageSchema.parse({ value: 100, unit: "vw" })).toEqual({ value: 100, unit: "vw" });
  });

  it("rejects angle units", () => {
    expect(() => lengthPercentageSchema.parse({ value: 45, unit: "deg" })).toThrow();
  });

  it("rejects invalid structure", () => {
    expect(() => lengthPercentageSchema.parse({ value: 10 })).toThrow();
    expect(() => lengthPercentageSchema.parse({ unit: "px" })).toThrow();
  });
});
