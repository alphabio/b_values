// b_path:: packages/b_types/src/position.test.ts
import { describe, expect, it } from "vitest";
import { position2DSchema, positionValueSchema } from "./position";

describe("positionValueSchema", () => {
  it("validates center keyword", () => {
    expect(positionValueSchema.parse("center")).toBe("center");
  });

  it("validates horizontal keywords", () => {
    expect(positionValueSchema.parse("left")).toBe("left");
    expect(positionValueSchema.parse("right")).toBe("right");
  });

  it("validates vertical keywords", () => {
    expect(positionValueSchema.parse("top")).toBe("top");
    expect(positionValueSchema.parse("bottom")).toBe("bottom");
  });

  it("validates length", () => {
    const result = positionValueSchema.parse({ value: 10, unit: "px" });
    expect(result).toEqual({ value: 10, unit: "px" });
  });

  it("validates percentage", () => {
    const result = positionValueSchema.parse({ value: 50, unit: "%" });
    expect(result).toEqual({ value: 50, unit: "%" });
  });

  it("rejects invalid keywords", () => {
    expect(() => positionValueSchema.parse("middle")).toThrow();
  });
});

describe("position2DSchema", () => {
  it("validates keyword positions", () => {
    const result = position2DSchema.parse({
      horizontal: "center",
      vertical: "center",
    });
    expect(result).toEqual({
      horizontal: "center",
      vertical: "center",
    });
  });

  it("validates mixed keyword and length", () => {
    const result = position2DSchema.parse({
      horizontal: { value: 10, unit: "px" },
      vertical: "center",
    });
    expect(result).toEqual({
      horizontal: { value: 10, unit: "px" },
      vertical: "center",
    });
  });

  it("validates length positions", () => {
    const result = position2DSchema.parse({
      horizontal: { value: 100, unit: "px" },
      vertical: { value: 50, unit: "%" },
    });
    expect(result).toEqual({
      horizontal: { value: 100, unit: "px" },
      vertical: { value: 50, unit: "%" },
    });
  });

  it("validates top left", () => {
    const result = position2DSchema.parse({
      horizontal: "left",
      vertical: "top",
    });
    expect(result).toEqual({
      horizontal: "left",
      vertical: "top",
    });
  });

  it("rejects missing horizontal", () => {
    expect(() => position2DSchema.parse({ vertical: "center" })).toThrow();
  });

  it("rejects missing vertical", () => {
    expect(() => position2DSchema.parse({ horizontal: "center" })).toThrow();
  });
});
