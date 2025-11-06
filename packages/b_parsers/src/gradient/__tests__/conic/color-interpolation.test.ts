// b_path:: packages/b_parsers/src/gradient/__tests__/conic/color-interpolation.test.ts
import { describe, expect, it } from "vitest";
import * as Conic from "../../conic";
import * as Generate from "@b/generators";

describe("Conic Gradient - Color Interpolation", () => {
  describe("Color Spaces", () => {
    it("parses in srgb", () => {
      const css = "conic-gradient(in srgb, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "srgb",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in srgb-linear", () => {
      const css = "conic-gradient(in srgb-linear, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "srgb-linear",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in hsl", () => {
      const css = "conic-gradient(in hsl, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "hsl",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in hwb", () => {
      const css = "conic-gradient(in hwb, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "hwb",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in lab", () => {
      const css = "conic-gradient(in lab, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "lab",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in lch", () => {
      const css = "conic-gradient(in lch, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "lch",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in oklab", () => {
      const css = "conic-gradient(in oklab, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "oklab",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in oklch", () => {
      const css = "conic-gradient(in oklch, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "oklch",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in xyz", () => {
      const css = "conic-gradient(in xyz, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "xyz",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in xyz-d50", () => {
      const css = "conic-gradient(in xyz-d50, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "xyz-d50",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses in xyz-d65", () => {
      const css = "conic-gradient(in xyz-d65, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "xyz-d65",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Hue Interpolation Methods", () => {
    it("parses shorter hue", () => {
      const css = "conic-gradient(in hsl shorter hue, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "hsl",
        hueInterpolationMethod: "shorter hue",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses longer hue", () => {
      const css = "conic-gradient(in hsl longer hue, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "hsl",
        hueInterpolationMethod: "longer hue",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses increasing hue", () => {
      const css = "conic-gradient(in hsl increasing hue, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "hsl",
        hueInterpolationMethod: "increasing hue",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses decreasing hue", () => {
      const css = "conic-gradient(in hsl decreasing hue, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "hsl",
        hueInterpolationMethod: "decreasing hue",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses oklch with longer hue", () => {
      const css = "conic-gradient(in oklch longer hue, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "oklch",
        hueInterpolationMethod: "longer hue",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses lch with shorter hue", () => {
      const css = "conic-gradient(in lch shorter hue, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "lch",
        hueInterpolationMethod: "shorter hue",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses hwb with increasing hue", () => {
      const css = "conic-gradient(in hwb increasing hue, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "hwb",
        hueInterpolationMethod: "increasing hue",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Combined with Other Features", () => {
    it("parses with from angle and color interpolation", () => {
      const css = "conic-gradient(from 45deg, in oklch, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses with position and color interpolation", () => {
      const css = "conic-gradient(at center, in hsl longer hue, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses with from angle, position, and color interpolation", () => {
      const css = "conic-gradient(from 90deg at 50% 50%, in oklch, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });
});
