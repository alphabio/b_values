// b_path:: packages/b_keywords/src/color-interpolation.test.ts
import { describe, expect, it } from "vitest";
import { colorInterpolationSchema, hueInterpolationMethodSchema } from "./color-interpolation";

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

  it("rejects invalid values", () => {
    expect(() => colorInterpolationSchema.parse("invalid")).toThrow();
    expect(() => colorInterpolationSchema.parse("")).toThrow();
    expect(() => colorInterpolationSchema.parse("rgb")).toThrow();
  });
});

describe("hueInterpolationMethodSchema", () => {
  it("accepts hue interpolation methods", () => {
    expect(hueInterpolationMethodSchema.parse("shorter hue")).toBe("shorter hue");
    expect(hueInterpolationMethodSchema.parse("longer hue")).toBe("longer hue");
    expect(hueInterpolationMethodSchema.parse("increasing hue")).toBe("increasing hue");
    expect(hueInterpolationMethodSchema.parse("decreasing hue")).toBe("decreasing hue");
  });

  it("rejects invalid values", () => {
    expect(() => hueInterpolationMethodSchema.parse("shorter")).toThrow();
    expect(() => hueInterpolationMethodSchema.parse("hue")).toThrow();
  });
});
