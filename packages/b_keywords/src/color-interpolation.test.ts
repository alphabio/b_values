// b_path:: packages/b_keywords/src/color-interpolation.test.ts
import { describe, expect, it } from "vitest";
import { colorInterpolationSchema } from "./color-interpolation";

describe("colorInterpolationSchema", () => {
  it("accepts rectangular color spaces", () => {
    expect(colorInterpolationSchema.parse("srgb")).toBe("srgb");
    expect(colorInterpolationSchema.parse("srgb-linear")).toBe("srgb-linear");
    expect(colorInterpolationSchema.parse("lab")).toBe("lab");
    expect(colorInterpolationSchema.parse("oklab")).toBe("oklab");
    expect(colorInterpolationSchema.parse("xyz")).toBe("xyz");
  });

  it("accepts polar color spaces", () => {
    expect(colorInterpolationSchema.parse("hsl")).toBe("hsl");
    expect(colorInterpolationSchema.parse("hwb")).toBe("hwb");
    expect(colorInterpolationSchema.parse("lch")).toBe("lch");
    expect(colorInterpolationSchema.parse("oklch")).toBe("oklch");
  });

  it("accepts hue interpolation methods", () => {
    expect(colorInterpolationSchema.parse("shorter")).toBe("shorter");
    expect(colorInterpolationSchema.parse("longer")).toBe("longer");
    expect(colorInterpolationSchema.parse("increasing")).toBe("increasing");
    expect(colorInterpolationSchema.parse("decreasing")).toBe("decreasing");
  });

  it("rejects invalid values", () => {
    expect(() => colorInterpolationSchema.parse("invalid")).toThrow();
    expect(() => colorInterpolationSchema.parse("")).toThrow();
    expect(() => colorInterpolationSchema.parse("rgb")).toThrow();
  });
});
