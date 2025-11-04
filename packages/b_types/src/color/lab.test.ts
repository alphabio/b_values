// b_path:: packages/b_types/src/color/lab.test.ts
import { describe, expect, it } from "vitest";
import { labColorSchema } from "./lab";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("labColorSchema", () => {
  it("validates opaque LAB colors", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: lit(50),
      a: lit(-20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("validates LAB colors with alpha", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: lit(50),
      a: lit(-20),
      b: lit(30),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("validates lightness at 0", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: lit(0),
      a: lit(0),
      b: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates lightness at 100", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: lit(100),
      a: lit(0),
      b: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates a at -125", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: lit(50),
      a: lit(-125),
      b: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates a at 125", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: lit(50),
      a: lit(125),
      b: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates b at -125", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: lit(50),
      a: lit(0),
      b: lit(-125),
    });
    expect(result.success).toBe(true);
  });

  it("validates b at 125", () => {
    const result = labColorSchema.safeParse({
      kind: "lab",
      l: lit(50),
      a: lit(0),
      b: lit(125),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = labColorSchema.safeParse({
      kind: "lch",
      l: lit(50),
      a: lit(-20),
      b: lit(30),
    });
    expect(result.success).toBe(false);
  });
});
