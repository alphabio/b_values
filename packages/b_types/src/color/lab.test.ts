// b_path:: packages/b_types/src/color/lab.test.ts
import { describe, expect, it } from "vitest";
import { labColorSchema } from "./lab";

describe("labColorSchema", () => {
  it("validates opaque LAB colors", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: 50,
      a: -20,
      b: 30,
    });
    expect(result.success).toBe(true);
  });

  it("validates LAB colors with alpha", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: 50,
      a: -20,
      b: 30,
      alpha: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("validates lightness at 0", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: 0,
      a: 0,
      b: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates lightness at 100", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: 100,
      a: 0,
      b: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates a at -125", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: 50,
      a: -125,
      b: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates a at 125", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: 50,
      a: 125,
      b: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates b at -125", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: 50,
      a: 0,
      b: -125,
    });
    expect(result.success).toBe(true);
  });

  it("validates b at 125", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: 50,
      a: 0,
      b: 125,
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = labColorSchema.safeParse({
      kind: "lch",
      l: 50,
      a: -20,
      b: 30,
    });
    expect(result.success).toBe(false);
  });
});
