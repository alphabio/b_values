// b_path:: packages/b_types/src/position.test.ts
import { describe, expect, it } from "vitest";
import { position2DSchema } from "./position";

describe("position2DSchema", () => {
  it("validates keyword positions", () => {
    const result = position2DSchema.parse({
      horizontal: { kind: "keyword", value: "center" },
      vertical: { kind: "keyword", value: "center" },
    });
    expect(result).toEqual({
      horizontal: { kind: "keyword", value: "center" },
      vertical: { kind: "keyword", value: "center" },
    });
  });

  it("validates mixed keyword and length", () => {
    const result = position2DSchema.parse({
      horizontal: { kind: "literal", value: 10, unit: "px" },
      vertical: { kind: "keyword", value: "center" },
    });
    expect(result).toEqual({
      horizontal: { kind: "literal", value: 10, unit: "px" },
      vertical: { kind: "keyword", value: "center" },
    });
  });

  it("validates length positions", () => {
    const result = position2DSchema.parse({
      horizontal: { kind: "literal", value: 100, unit: "px" },
      vertical: { kind: "literal", value: 50, unit: "%" },
    });
    expect(result).toEqual({
      horizontal: { kind: "literal", value: 100, unit: "px" },
      vertical: { kind: "literal", value: 50, unit: "%" },
    });
  });

  it("validates top left", () => {
    const result = position2DSchema.parse({
      horizontal: { kind: "keyword", value: "left" },
      vertical: { kind: "keyword", value: "top" },
    });
    expect(result).toEqual({
      horizontal: { kind: "keyword", value: "left" },
      vertical: { kind: "keyword", value: "top" },
    });
  });

  it("rejects missing horizontal", () => {
    expect(() => position2DSchema.parse({ vertical: { kind: "keyword", value: "center" } })).toThrow();
  });

  it("rejects missing vertical", () => {
    expect(() => position2DSchema.parse({ horizontal: { kind: "keyword", value: "center" } })).toThrow();
  });
});
