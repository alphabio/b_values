// b_path:: packages/b_keywords/src/color-interpolation.test.ts
import { describe, expect, it } from "vitest";
import { colorInterpolation, hueInterpolationMethod } from "./color-interpolation";

describe("colorInterpolation", () => {
  it("accepts rectangular color spaces", () => {
    expect(colorInterpolation.parse("srgb")).toBe("srgb");
    expect(colorInterpolation.parse("srgb-linear")).toBe("srgb-linear");
    expect(colorInterpolation.parse("lab")).toBe("lab");
    expect(colorInterpolation.parse("oklab")).toBe("oklab");
    expect(colorInterpolation.parse("xyz")).toBe("xyz");
  });

  it("accepts polar color spaces", () => {
    expect(colorInterpolation.parse("hsl")).toBe("hsl");
    expect(colorInterpolation.parse("hwb")).toBe("hwb");
    expect(colorInterpolation.parse("lch")).toBe("lch");
    expect(colorInterpolation.parse("oklch")).toBe("oklch");
  });

  it("rejects invalid values", () => {
    expect(() => colorInterpolation.parse("invalid")).toThrow();
    expect(() => colorInterpolation.parse("")).toThrow();
    expect(() => colorInterpolation.parse("rgb")).toThrow();
  });
});

describe("hueInterpolationMethod", () => {
  it("accepts hue interpolation methods", () => {
    expect(hueInterpolationMethod.parse("shorter hue")).toBe("shorter hue");
    expect(hueInterpolationMethod.parse("longer hue")).toBe("longer hue");
    expect(hueInterpolationMethod.parse("increasing hue")).toBe("increasing hue");
    expect(hueInterpolationMethod.parse("decreasing hue")).toBe("decreasing hue");
  });

  it("rejects invalid values", () => {
    expect(() => hueInterpolationMethod.parse("shorter")).toThrow();
    expect(() => hueInterpolationMethod.parse("hue")).toThrow();
  });
});
