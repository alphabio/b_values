// b_path:: packages/b_parsers/src/gradient/__tests__/conic/color-stops.test.ts
import { describe, expect, it } from "vitest";
import * as Conic from "../../conic";
import * as Generate from "@b/generators";

describe("Conic Gradient - Color Stops", () => {
  describe("RGB/RGBA Colors", () => {
    it("parses rgb() color function", () => {
      const css = "conic-gradient(rgb(255, 0, 0), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(2);
      const firstStop = result.value.colorStops[0];
      if (firstStop?.kind === "hint") throw new Error("Expected color stop, got hint");
      expect(firstStop?.color.kind).toBe("rgb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses rgba() color function", () => {
      const css = "conic-gradient(rgba(255, 0, 0, 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("rgb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses space-separated rgb()", () => {
      const css = "conic-gradient(rgb(255 0 0), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("rgb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses rgb() with alpha slash", () => {
      const css = "conic-gradient(rgb(255 0 0 / 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("rgb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses rgb() with percentages", () => {
      const css = "conic-gradient(rgb(100% 0% 0%), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("rgb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses multiple rgb() colors", () => {
      const css = "conic-gradient(rgb(255,0,0), rgb(0,255,0), rgb(0,0,255))";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");
      if (result.value.colorStops[1]?.kind === "hint") throw new Error("Expected color stop, got hint");
      if (result.value.colorStops[2]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);
      expect(result.value.colorStops[0]?.color.kind).toBe("rgb");
      expect(result.value.colorStops[1]?.color.kind).toBe("rgb");
      expect(result.value.colorStops[2]?.color.kind).toBe("rgb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("HSL/HSLA Colors", () => {
    it("parses hsl() color function", () => {
      const css = "conic-gradient(hsl(0, 100%, 50%), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("hsl");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses hsla() color function", () => {
      const css = "conic-gradient(hsla(120, 50%, 50%, 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("hsl");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses space-separated hsl()", () => {
      const css = "conic-gradient(hsl(0deg 100% 50%), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("hsl");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses hsl() with alpha slash", () => {
      const css = "conic-gradient(hsl(0deg 100% 50% / 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("hsl");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses multiple hsl() colors", () => {
      const css = "conic-gradient(hsl(0,100%,50%), hsl(120,100%,50%), hsl(240,100%,50%))";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");
      if (result.value.colorStops[1]?.kind === "hint") throw new Error("Expected color stop, got hint");
      if (result.value.colorStops[2]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);
      expect(result.value.colorStops[0]?.color.kind).toBe("hsl");
      expect(result.value.colorStops[1]?.color.kind).toBe("hsl");
      expect(result.value.colorStops[2]?.color.kind).toBe("hsl");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("HWB Colors", () => {
    it("parses hwb() color function", () => {
      const css = "conic-gradient(hwb(0deg 0% 0%), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("hwb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses hwb() with alpha", () => {
      const css = "conic-gradient(hwb(120deg 20% 30% / 0.8), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("hwb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses multiple hwb() colors", () => {
      const css = "conic-gradient(hwb(0deg 0% 0%), hwb(120deg 0% 0%), hwb(240deg 0% 0%))";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Lab/LCH Colors", () => {
    it("parses lab() color function", () => {
      const css = "conic-gradient(lab(50% 40 60), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("lab");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses lab() with alpha", () => {
      const css = "conic-gradient(lab(50% 40 60 / 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("lab");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses lch() color function", () => {
      const css = "conic-gradient(lch(50% 70 120deg), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("lch");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses lch() with alpha", () => {
      const css = "conic-gradient(lch(50% 70 120deg / 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("lch");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Oklab/Oklch Colors", () => {
    it("parses oklab() color function", () => {
      const css = "conic-gradient(oklab(0.5 0.1 0.1), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("oklab");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses oklab() with alpha", () => {
      const css = "conic-gradient(oklab(0.5 0.1 0.1 / 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("oklab");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses oklch() color function", () => {
      const css = "conic-gradient(oklch(0.5 0.15 120deg), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("oklch");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses oklch() with alpha", () => {
      const css = "conic-gradient(oklch(0.5 0.15 120deg / 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("oklch");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Color() Function", () => {
    it("should parse color(srgb ...) function", () => {
      const css = "conic-gradient(color(srgb 1 0 0), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("color");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("should parse color() with alpha", () => {
      const css = "conic-gradient(color(srgb 1 0 0 / 0.5), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("color");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("should parse color(display-p3 ...)", () => {
      const css = "conic-gradient(color(display-p3 1 0 0), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("color");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Angular Positions", () => {
    it("parses color stops with degree positions", () => {
      const css = "conic-gradient(red 0deg, yellow 90deg, blue 180deg, green 270deg, red 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(5);
      expect(result.value.colorStops[0]?.position).toBeDefined();
      expect(result.value.colorStops[1]?.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses color stops with percentage positions", () => {
      const css = "conic-gradient(red 0%, yellow 25%, blue 50%, green 75%, red 100%)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(5);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses color stops with turn positions", () => {
      const css = "conic-gradient(red 0turn, blue 0.5turn, red 1turn)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses color stops with grad positions", () => {
      const css = "conic-gradient(red 0grad, blue 200grad, red 400grad)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses mixed positioned and auto-distributed stops", () => {
      const css = "conic-gradient(red, yellow 90deg, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("CSS Value Functions in Colors", () => {
    it("parses var() as color", () => {
      const css = "conic-gradient(var(--color1), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("variable");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses multiple var() colors", () => {
      const css = "conic-gradient(var(--c1), var(--c2), var(--c3))";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");
      if (result.value.colorStops[1]?.kind === "hint") throw new Error("Expected color stop, got hint");
      if (result.value.colorStops[2]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);
      expect(result.value.colorStops[0]?.color.kind).toBe("variable");
      expect(result.value.colorStops[1]?.color.kind).toBe("variable");
      expect(result.value.colorStops[2]?.color.kind).toBe("variable");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses var() color with angle position", () => {
      const css = "conic-gradient(var(--color1) 90deg, blue 270deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("variable");
      expect(result.value.colorStops[0]?.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses rgb() with var() components", () => {
      const css = "conic-gradient(rgb(var(--r), var(--g), var(--b)), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("rgb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses hsl() with var() hue", () => {
      const css = "conic-gradient(hsl(var(--hue), 100%, 50%), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.color.kind).toBe("hsl");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("CSS Value Functions in Positions", () => {
    it("parses var() as angle position", () => {
      const css = "conic-gradient(red var(--angle1), blue var(--angle2))";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.position).toBeDefined();
      expect(result.value.colorStops[1]?.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses calc() as angle position", () => {
      const css = "conic-gradient(red calc(var(--base) * 2), blue 180deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses clamp() as angle position", () => {
      const css = "conic-gradient(red clamp(0deg, var(--angle), 360deg), blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Multiple Color Stop Positions", () => {
    it("parses color with two angle positions", () => {
      const css = "conic-gradient(red 0deg 90deg, blue 180deg 270deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.position).toHaveLength(2);
      expect(result.value.colorStops[1]?.position).toHaveLength(2);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses color with two percentage positions", () => {
      const css = "conic-gradient(red 0% 25%, blue 50% 75%)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops[0]?.position).toHaveLength(2);
      expect(result.value.colorStops[1]?.position).toHaveLength(2);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Mixed Color Types", () => {
    it("parses gradient with named, hex, and rgb colors", () => {
      const css = "conic-gradient(red, #00ff00, rgb(0,0,255))";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");
      if (result.value.colorStops[1]?.kind === "hint") throw new Error("Expected color stop, got hint");
      if (result.value.colorStops[2]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);
      expect(result.value.colorStops[0]?.color.kind).toBe("named");
      expect(result.value.colorStops[1]?.color.kind).toBe("hex");
      expect(result.value.colorStops[2]?.color.kind).toBe("rgb");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with hsl, lab, and oklch colors", () => {
      const css = "conic-gradient(hsl(0,100%,50%), lab(50% 40 60), oklch(0.5 0.15 120))";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with var() and named colors", () => {
      const css = "conic-gradient(var(--primary), red, var(--secondary))";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });
});
