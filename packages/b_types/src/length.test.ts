import { describe, expect, it } from "vitest";
import { lengthSchema } from "./length";

describe("lengthSchema", () => {
  it("validates pixels", () => {
    const result = lengthSchema.parse({ value: 16, unit: "px" });
    expect(result).toEqual({ value: 16, unit: "px" });
  });

  it("validates rems", () => {
    const result = lengthSchema.parse({ value: 1.5, unit: "rem" });
    expect(result).toEqual({ value: 1.5, unit: "rem" });
  });

  it("validates ems", () => {
    const result = lengthSchema.parse({ value: 2, unit: "em" });
    expect(result).toEqual({ value: 2, unit: "em" });
  });

  it("validates viewport units", () => {
    expect(lengthSchema.parse({ value: 100, unit: "vw" })).toEqual({ value: 100, unit: "vw" });
    expect(lengthSchema.parse({ value: 50, unit: "vh" })).toEqual({ value: 50, unit: "vh" });
    expect(lengthSchema.parse({ value: 10, unit: "vmin" })).toEqual({ value: 10, unit: "vmin" });
    expect(lengthSchema.parse({ value: 10, unit: "vmax" })).toEqual({ value: 10, unit: "vmax" });
  });

  it("validates absolute units", () => {
    expect(lengthSchema.parse({ value: 1, unit: "cm" })).toEqual({ value: 1, unit: "cm" });
    expect(lengthSchema.parse({ value: 10, unit: "mm" })).toEqual({ value: 10, unit: "mm" });
    expect(lengthSchema.parse({ value: 72, unit: "pt" })).toEqual({ value: 72, unit: "pt" });
    expect(lengthSchema.parse({ value: 6, unit: "pc" })).toEqual({ value: 6, unit: "pc" });
    expect(lengthSchema.parse({ value: 1, unit: "in" })).toEqual({ value: 1, unit: "in" });
    expect(lengthSchema.parse({ value: 1, unit: "Q" })).toEqual({ value: 1, unit: "Q" });
  });

  it("validates negative lengths", () => {
    const result = lengthSchema.parse({ value: -10, unit: "px" });
    expect(result).toEqual({ value: -10, unit: "px" });
  });

  it("validates zero", () => {
    const result = lengthSchema.parse({ value: 0, unit: "px" });
    expect(result).toEqual({ value: 0, unit: "px" });
  });

  it("rejects invalid unit", () => {
    expect(() => lengthSchema.parse({ value: 10, unit: "%" })).toThrow();
    expect(() => lengthSchema.parse({ value: 45, unit: "deg" })).toThrow();
  });

  it("rejects missing value", () => {
    expect(() => lengthSchema.parse({ unit: "px" })).toThrow();
  });

  it("rejects missing unit", () => {
    expect(() => lengthSchema.parse({ value: 10 })).toThrow();
  });
});
