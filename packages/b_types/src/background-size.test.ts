// b_path:: packages/b_types/src/background-size.test.ts

import { describe, it, expect } from "vitest";
import { backgroundSizeSchema, sizeLayerSchema, sizeValueSchema } from "./background-size";

describe("sizeValueSchema", () => {
  it("should validate auto", () => {
    const result = sizeValueSchema.safeParse({ kind: "auto" });
    expect(result.success).toBe(true);
  });

  it("should validate length", () => {
    const result = sizeValueSchema.safeParse({
      kind: "length",
      value: { value: 100, unit: "px" },
    });
    expect(result.success).toBe(true);
  });

  it("should validate percentage", () => {
    const result = sizeValueSchema.safeParse({
      kind: "percentage",
      value: { value: 50, unit: "%" },
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid kind", () => {
    const result = sizeValueSchema.safeParse({ kind: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("sizeLayerSchema", () => {
  it("should validate cover keyword", () => {
    const result = sizeLayerSchema.safeParse({
      kind: "keyword",
      value: "cover",
    });
    expect(result.success).toBe(true);
  });

  it("should validate contain keyword", () => {
    const result = sizeLayerSchema.safeParse({
      kind: "keyword",
      value: "contain",
    });
    expect(result.success).toBe(true);
  });

  it("should validate explicit size", () => {
    const result = sizeLayerSchema.safeParse({
      kind: "explicit",
      width: { kind: "percentage", value: { value: 50, unit: "%" } },
      height: { kind: "auto" },
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid keyword", () => {
    const result = sizeLayerSchema.safeParse({
      kind: "keyword",
      value: "fill",
    });
    expect(result.success).toBe(false);
  });

  it("should reject explicit without width", () => {
    const result = sizeLayerSchema.safeParse({
      kind: "explicit",
      height: { kind: "auto" },
    });
    expect(result.success).toBe(false);
  });
});

describe("backgroundSizeSchema", () => {
  it("should validate CSS-wide keyword", () => {
    const result = backgroundSizeSchema.safeParse({
      kind: "keyword",
      value: "inherit",
    });
    expect(result.success).toBe(true);
  });

  it("should validate single layer with keyword", () => {
    const result = backgroundSizeSchema.safeParse({
      kind: "layers",
      layers: [{ kind: "keyword", value: "cover" }],
    });
    expect(result.success).toBe(true);
  });

  it("should validate single layer with explicit size", () => {
    const result = backgroundSizeSchema.safeParse({
      kind: "layers",
      layers: [
        {
          kind: "explicit",
          width: { kind: "percentage", value: { value: 100, unit: "%" } },
          height: { kind: "auto" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should validate multiple layers", () => {
    const result = backgroundSizeSchema.safeParse({
      kind: "layers",
      layers: [
        { kind: "keyword", value: "cover" },
        { kind: "keyword", value: "contain" },
        {
          kind: "explicit",
          width: { kind: "length", value: { value: 50, unit: "px" } },
          height: { kind: "length", value: { value: 50, unit: "px" } },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty layers array", () => {
    const result = backgroundSizeSchema.safeParse({
      kind: "layers",
      layers: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid CSS-wide keyword", () => {
    const result = backgroundSizeSchema.safeParse({
      kind: "keyword",
      value: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
