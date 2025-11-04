// b_path:: packages/b_types/src/gradient/direction.test.ts
import { describe, expect, it } from "vitest";
import { gradientDirectionSchema } from "./direction";

describe("gradientDirectionSchema", () => {
  it("validates angle direction", () => {
    const result = gradientDirectionSchema.parse({
      kind: "angle",
      value: { value: 45, unit: "deg" },
    });
    expect(result).toEqual({
      kind: "angle",
      value: { value: 45, unit: "deg" },
    });
  });

  it("validates to-side direction", () => {
    expect(gradientDirectionSchema.parse({ kind: "to-side", value: "top" })).toEqual({ kind: "to-side", value: "top" });
    expect(gradientDirectionSchema.parse({ kind: "to-side", value: "right" })).toEqual({
      kind: "to-side",
      value: "right",
    });
    expect(gradientDirectionSchema.parse({ kind: "to-side", value: "bottom" })).toEqual({
      kind: "to-side",
      value: "bottom",
    });
    expect(gradientDirectionSchema.parse({ kind: "to-side", value: "left" })).toEqual({
      kind: "to-side",
      value: "left",
    });
  });

  it("validates to-corner direction", () => {
    expect(gradientDirectionSchema.parse({ kind: "to-corner", value: "top left" })).toEqual({
      kind: "to-corner",
      value: "top left",
    });
    expect(gradientDirectionSchema.parse({ kind: "to-corner", value: "top right" })).toEqual({
      kind: "to-corner",
      value: "top right",
    });
    expect(gradientDirectionSchema.parse({ kind: "to-corner", value: "bottom left" })).toEqual({
      kind: "to-corner",
      value: "bottom left",
    });
    expect(gradientDirectionSchema.parse({ kind: "to-corner", value: "bottom right" })).toEqual({
      kind: "to-corner",
      value: "bottom right",
    });
  });

  it("rejects invalid side", () => {
    expect(() => gradientDirectionSchema.parse({ kind: "to-side", value: "center" })).toThrow();
  });

  it("rejects invalid corner", () => {
    expect(() => gradientDirectionSchema.parse({ kind: "to-corner", value: "center" })).toThrow();
  });
});
