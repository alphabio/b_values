// b_path:: packages/b_types/src/repeat-style.test.ts

import { describe, expect, it } from "vitest";
import { repetitionSchema, repeatStyleSchema } from "./repeat-style";

describe("repetitionSchema", () => {
  it("validates repeat", () => {
    expect(repetitionSchema.safeParse("repeat").success).toBe(true);
  });

  it("validates space", () => {
    expect(repetitionSchema.safeParse("space").success).toBe(true);
  });

  it("validates round", () => {
    expect(repetitionSchema.safeParse("round").success).toBe(true);
  });

  it("validates no-repeat", () => {
    expect(repetitionSchema.safeParse("no-repeat").success).toBe(true);
  });

  it("rejects invalid values", () => {
    expect(repetitionSchema.safeParse("invalid").success).toBe(false);
    expect(repetitionSchema.safeParse("repeat-x").success).toBe(false);
  });
});

describe("repeatStyleSchema", () => {
  it("validates shorthand repeat-x", () => {
    const result = repeatStyleSchema.safeParse({
      kind: "shorthand",
      value: "repeat-x",
    });
    expect(result.success).toBe(true);
  });

  it("validates shorthand repeat-y", () => {
    const result = repeatStyleSchema.safeParse({
      kind: "shorthand",
      value: "repeat-y",
    });
    expect(result.success).toBe(true);
  });

  it("validates explicit with same values", () => {
    const result = repeatStyleSchema.safeParse({
      kind: "explicit",
      horizontal: "repeat",
      vertical: "repeat",
    });
    expect(result.success).toBe(true);
  });

  it("validates explicit with different values", () => {
    const result = repeatStyleSchema.safeParse({
      kind: "explicit",
      horizontal: "repeat",
      vertical: "no-repeat",
    });
    expect(result.success).toBe(true);
  });

  it("validates explicit with space and round", () => {
    const result = repeatStyleSchema.safeParse({
      kind: "explicit",
      horizontal: "space",
      vertical: "round",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid shorthand value", () => {
    const result = repeatStyleSchema.safeParse({
      kind: "shorthand",
      value: "repeat",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid explicit values", () => {
    const result = repeatStyleSchema.safeParse({
      kind: "explicit",
      horizontal: "invalid",
      vertical: "repeat",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = repeatStyleSchema.safeParse({
      kind: "explicit",
      horizontal: "repeat",
    });
    expect(result.success).toBe(false);
  });
});
