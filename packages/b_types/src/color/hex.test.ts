// b_path:: packages/b_types/src/color/hex.test.ts
import { describe, expect, it } from "vitest";
import { hexColorSchema } from "./hex";

describe("hexColorSchema", () => {
  it("validates 6-digit hex colors", () => {
    const result = hexColorSchema.safeParse({
      kind: "hex",
      value: "#FF5733",
    });
    expect(result.success).toBe(true);
  });

  it("validates 8-digit hex colors with alpha", () => {
    const result = hexColorSchema.safeParse({
      kind: "hex",
      value: "#FF573380",
    });
    expect(result.success).toBe(true);
  });

  it("rejects lowercase hex", () => {
    const result = hexColorSchema.safeParse({
      kind: "hex",
      value: "#ff5733",
    });
    expect(result.success).toBe(false);
  });

  it("rejects 3-digit shorthand", () => {
    const result = hexColorSchema.safeParse({
      kind: "hex",
      value: "#F57",
    });
    expect(result.success).toBe(false);
  });

  it("rejects 4-digit shorthand", () => {
    const result = hexColorSchema.safeParse({
      kind: "hex",
      value: "#F578",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid characters", () => {
    const result = hexColorSchema.safeParse({
      kind: "hex",
      value: "#GGHHII",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing hash", () => {
    const result = hexColorSchema.safeParse({
      kind: "hex",
      value: "FF5733",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong kind", () => {
    const result = hexColorSchema.safeParse({
      kind: "rgb",
      value: "#FF5733",
    });
    expect(result.success).toBe(false);
  });
});
