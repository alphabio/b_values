// b_path:: packages/b_parsers/src/gradient/__tests__/radial/color-interpolation.test.ts
import { describe, it, expect } from "vitest";
import * as Radial from "../../radial";

describe("Radial Gradient Parser - Color Interpolation", () => {
  describe("Rectangular Color Spaces", () => {
    it("parses 'in srgb'", () => {
      const css = "radial-gradient(in srgb, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb" });
      }
    });

    it("parses 'in srgb-linear'", () => {
      const css = "radial-gradient(in srgb-linear, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb-linear" });
      }
    });

    it("parses 'in display-p3'", () => {
      const css = "radial-gradient(in display-p3, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "display-p3" });
      }
    });

    it("parses 'in display-p3-linear'", () => {
      const css = "radial-gradient(in display-p3-linear, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "display-p3-linear" });
      }
    });

    it("parses 'in a98-rgb'", () => {
      const css = "radial-gradient(in a98-rgb, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "a98-rgb" });
      }
    });

    it("parses 'in prophoto-rgb'", () => {
      const css = "radial-gradient(in prophoto-rgb, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "prophoto-rgb" });
      }
    });

    it("parses 'in rec2020'", () => {
      const css = "radial-gradient(in rec2020, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "rec2020" });
      }
    });

    it("parses 'in lab'", () => {
      const css = "radial-gradient(in lab, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "lab" });
      }
    });

    it("parses 'in oklab'", () => {
      const css = "radial-gradient(in oklab, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "oklab" });
      }
    });

    it("parses 'in xyz'", () => {
      const css = "radial-gradient(in xyz, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "xyz" });
      }
    });

    it("parses 'in xyz-d50'", () => {
      const css = "radial-gradient(in xyz-d50, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "xyz-d50" });
      }
    });

    it("parses 'in xyz-d65'", () => {
      const css = "radial-gradient(in xyz-d65, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "xyz-d65" });
      }
    });
  });

  describe("Polar Color Spaces", () => {
    it("parses 'in hsl'", () => {
      const css = "radial-gradient(in hsl, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "hsl" });
      }
    });

    it("parses 'in hwb'", () => {
      const css = "radial-gradient(in hwb, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "hwb" });
      }
    });

    it("parses 'in lch'", () => {
      const css = "radial-gradient(in lch, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "lch" });
      }
    });

    it("parses 'in oklch'", () => {
      const css = "radial-gradient(in oklch, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "oklch" });
      }
    });
  });

  describe("Hue Interpolation Methods - shorter hue", () => {
    it("parses 'in hsl shorter hue'", () => {
      const css = "radial-gradient(in hsl shorter hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hsl",
          hueInterpolationMethod: "shorter hue",
        });
      }
    });

    it("parses 'in hwb shorter hue'", () => {
      const css = "radial-gradient(in hwb shorter hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hwb",
          hueInterpolationMethod: "shorter hue",
        });
      }
    });

    it("parses 'in lch shorter hue'", () => {
      const css = "radial-gradient(in lch shorter hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "shorter hue",
        });
      }
    });

    it("parses 'in oklch shorter hue'", () => {
      const css = "radial-gradient(in oklch shorter hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "oklch",
          hueInterpolationMethod: "shorter hue",
        });
      }
    });
  });

  describe("Hue Interpolation Methods - longer hue", () => {
    it("parses 'in hsl longer hue'", () => {
      const css = "radial-gradient(in hsl longer hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hsl",
          hueInterpolationMethod: "longer hue",
        });
      }
    });

    it("parses 'in hwb longer hue'", () => {
      const css = "radial-gradient(in hwb longer hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hwb",
          hueInterpolationMethod: "longer hue",
        });
      }
    });

    it("parses 'in lch longer hue'", () => {
      const css = "radial-gradient(in lch longer hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "longer hue",
        });
      }
    });

    it("parses 'in oklch longer hue'", () => {
      const css = "radial-gradient(in oklch longer hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "oklch",
          hueInterpolationMethod: "longer hue",
        });
      }
    });
  });

  describe("Hue Interpolation Methods - increasing hue", () => {
    it("parses 'in hsl increasing hue'", () => {
      const css = "radial-gradient(in hsl increasing hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hsl",
          hueInterpolationMethod: "increasing hue",
        });
      }
    });

    it("parses 'in hwb increasing hue'", () => {
      const css = "radial-gradient(in hwb increasing hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hwb",
          hueInterpolationMethod: "increasing hue",
        });
      }
    });

    it("parses 'in lch increasing hue'", () => {
      const css = "radial-gradient(in lch increasing hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "increasing hue",
        });
      }
    });

    it("parses 'in oklch increasing hue'", () => {
      const css = "radial-gradient(in oklch increasing hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "oklch",
          hueInterpolationMethod: "increasing hue",
        });
      }
    });
  });

  describe("Hue Interpolation Methods - decreasing hue", () => {
    it("parses 'in hsl decreasing hue'", () => {
      const css = "radial-gradient(in hsl decreasing hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hsl",
          hueInterpolationMethod: "decreasing hue",
        });
      }
    });

    it("parses 'in hwb decreasing hue'", () => {
      const css = "radial-gradient(in hwb decreasing hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "hwb",
          hueInterpolationMethod: "decreasing hue",
        });
      }
    });

    it("parses 'in lch decreasing hue'", () => {
      const css = "radial-gradient(in lch decreasing hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "decreasing hue",
        });
      }
    });

    it("parses 'in oklch decreasing hue'", () => {
      const css = "radial-gradient(in oklch decreasing hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "oklch",
          hueInterpolationMethod: "decreasing hue",
        });
      }
    });
  });
});
