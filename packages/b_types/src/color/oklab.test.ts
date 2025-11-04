// b_path:: packages/b_types/src/color/oklab.test.ts
import { describe, expect, it } from "vitest";
import { oklabColorSchema } from "./oklab";

describe("oklabColorSchema", () => {
  it("validates opaque OKLab colors", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: -0.2,
      b: 0.3,
    });
    expect(result.success).toBe(true);
  });

  it("validates OKLab colors with alpha", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: -0.2,
      b: 0.3,
      alpha: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("validates lightness at 0", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0,
      a: 0,
      b: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates lightness at 1", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 1,
      a: 0,
      b: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates a at -0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: -0.4,
      b: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates a at 0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: 0.4,
      b: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates b at -0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: 0,
      b: -0.4,
    });
    expect(result.success).toBe(true);
  });

  it("validates b at 0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: 0,
      b: 0.4,
    });
    expect(result.success).toBe(true);
  });

  it("rejects lightness below 0", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: -0.1,
      a: 0,
      b: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lightness above 1", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 1.1,
      a: 0,
      b: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a below -0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: -0.5,
      b: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a above 0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: 0.5,
      b: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects b below -0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: 0,
      b: -0.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects b above 0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: 0,
      b: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha below 0", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: 0,
      b: 0,
      alpha: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha above 1", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: 0,
      b: 0,
      alpha: 1.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong kind", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklch",
      l: 0.5,
      a: -0.2,
      b: 0.3,
    });
    expect(result.success).toBe(false);
  });
});
