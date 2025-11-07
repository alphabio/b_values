// b_path:: packages/b_types/src/bg-size.test.ts

import { describe, it, expect } from "vitest";
import { bgSizeListSchema, bgSizeSchema } from "./bg-size";

describe("bgSizeSchema", () => {
  it("should validate cover keyword", () => {
    const result = bgSizeSchema.safeParse({
      kind: "keyword",
      value: "cover",
    });
    expect(result.success).toBe(true);
  });

  it("should validate contain keyword", () => {
    const result = bgSizeSchema.safeParse({
      kind: "keyword",
      value: "contain",
    });
    expect(result.success).toBe(true);
  });

  it("should validate explicit size with auto keyword", () => {
    const result = bgSizeSchema.safeParse({
      kind: "explicit",
      width: { kind: "keyword", value: "auto" },
      height: { kind: "keyword", value: "auto" },
    });
    expect(result.success).toBe(true);
  });

  it("should validate explicit size with length", () => {
    const result = bgSizeSchema.safeParse({
      kind: "explicit",
      width: { kind: "literal", value: 100, unit: "px" },
      height: { kind: "literal", value: 100, unit: "px" },
    });
    expect(result.success).toBe(true);
  });

  it("should validate explicit size with percentage", () => {
    const result = bgSizeSchema.safeParse({
      kind: "explicit",
      width: { kind: "literal", value: 50, unit: "%" },
      height: { kind: "keyword", value: "auto" },
    });
    expect(result.success).toBe(true);
  });

  it("should validate explicit size with var()", () => {
    const result = bgSizeSchema.safeParse({
      kind: "explicit",
      width: { kind: "variable", name: "--my-size" },
      height: { kind: "keyword", value: "auto" },
    });
    expect(result.success).toBe(true);
  });

  it("should validate explicit size with calc()", () => {
    const result = bgSizeSchema.safeParse({
      kind: "explicit",
      width: {
        kind: "calc",
        value: {
          kind: "calc-operation",
          operator: "+",
          left: { kind: "literal", value: 100, unit: "px" },
          right: { kind: "literal", value: 50, unit: "px" },
        },
      },
      height: { kind: "keyword", value: "auto" },
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid keyword", () => {
    const result = bgSizeSchema.safeParse({
      kind: "keyword",
      value: "fill",
    });
    expect(result.success).toBe(false);
  });

  it("should reject explicit without width", () => {
    const result = bgSizeSchema.safeParse({
      kind: "explicit",
      height: { kind: "keyword", value: "auto" },
    });
    expect(result.success).toBe(false);
  });
});

describe("bgSizeListSchema", () => {
  it("should validate CSS-wide keyword", () => {
    const result = bgSizeListSchema.safeParse({
      kind: "keyword",
      value: "inherit",
    });
    expect(result.success).toBe(true);
  });

  it("should validate single value with keyword", () => {
    const result = bgSizeListSchema.safeParse({
      kind: "list",
      values: [{ kind: "keyword", value: "cover" }],
    });
    expect(result.success).toBe(true);
  });

  it("should validate single value with explicit size", () => {
    const result = bgSizeListSchema.safeParse({
      kind: "list",
      values: [
        {
          kind: "explicit",
          width: { kind: "literal", value: 100, unit: "%" },
          height: { kind: "keyword", value: "auto" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should validate multiple values", () => {
    const result = bgSizeListSchema.safeParse({
      kind: "list",
      values: [
        { kind: "keyword", value: "cover" },
        { kind: "keyword", value: "contain" },
        {
          kind: "explicit",
          width: { kind: "literal", value: 50, unit: "px" },
          height: { kind: "literal", value: 50, unit: "px" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty values array", () => {
    const result = bgSizeListSchema.safeParse({
      kind: "list",
      values: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid CSS-wide keyword", () => {
    const result = bgSizeListSchema.safeParse({
      kind: "keyword",
      value: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
