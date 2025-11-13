// b_path:: packages/b_parsers/src/gradient/__tests__/conic/combinations.test.ts
import { describe, expect, it } from "vitest";
import * as Conic from "../../conic";
import * as Generate from "@b/generators";

describe("Conic Gradient - Combinations", () => {
  describe("All Features Combined", () => {
    it("parses from angle + position + interpolation + positioned stops", () => {
      const css = "conic-gradient(from 45deg at 25% 75%, in oklch, red 0deg, blue 180deg, red 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 45,
        unit: "deg",
      });
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toMatchObject({
        colorSpace: "oklch",
      });
      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses repeating with all features", () => {
      const css = "repeating-conic-gradient(from 0deg at center center, in hsl longer hue, red 0deg, blue 30deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.repeating).toBe(true);
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses complex gradient with var() functions", () => {
      const css = `repeating-conic-gradient(
        from var(--angle) at var(--x) var(--y),
        in oklch,
        var(--color-1) var(--pos-1),
        var(--color-2) var(--pos-2)
      )`;
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.repeating).toBe(true);
      expect(result.value.fromAngle?.kind).toBe("variable");
      const pos = result.value.position;
      if (pos && "kind" in pos.horizontal) {
        expect(pos.horizontal.kind).toBe("variable");
      }
      if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
      expect(result.value.colorStops[0]?.color.kind).toBe("variable");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses with calc() in multiple places", () => {
      const css = `conic-gradient(
        from calc(45deg + var(--offset)) at calc(50% - 20px) 50%,
        red calc(var(--start) * 2),
        blue 180deg
      )`;
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("calc");
      const pos2 = result.value.position;
      if (pos2 && "kind" in pos2.horizontal) {
        expect(pos2.horizontal.kind).toBe("calc");
      }

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Complex Color Combinations", () => {
    it("parses gradient with 6 color stops", () => {
      const css =
        "conic-gradient(red 0deg, orange 60deg, yellow 120deg, green 180deg, blue 240deg, purple 300deg, red 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(7);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with mixed modern color functions", () => {
      const css = `conic-gradient(
        rgb(255,0,0) 0deg,
        hsl(120, 100%, 50%) 90deg,
        oklch(0.5 0.15 240) 180deg,
        lab(50% 40 -60) 270deg,
        red 360deg
      )`;
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(5);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with var() and literal colors", () => {
      const css = "conic-gradient(var(--primary) 0deg, red 120deg, var(--secondary) 240deg, blue 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(4);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with multiple position stops", () => {
      const css = "conic-gradient(red 0deg 60deg, yellow 120deg 180deg, blue 240deg 300deg, red 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(4);
      expect(result.value.colorStops[0]?.position).toHaveLength(2);
      expect(result.value.colorStops[1]?.position).toHaveLength(2);
      expect(result.value.colorStops[2]?.position).toHaveLength(2);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Repeating Patterns", () => {
    it("parses simple repeating pattern", () => {
      const css = "repeating-conic-gradient(red 0deg, blue 10deg, red 20deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.repeating).toBe(true);
      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses repeating with percentage positions", () => {
      const css = "repeating-conic-gradient(red 0%, blue 5%, red 10%)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.repeating).toBe(true);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses repeating with from angle", () => {
      const css = "repeating-conic-gradient(from 45deg, red 0deg, blue 15deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.repeating).toBe(true);
      expect(result.value.fromAngle).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses repeating with position offset", () => {
      const css = "repeating-conic-gradient(at 25% 25%, red 0deg, blue 10deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.repeating).toBe(true);
      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Edge Position Combinations", () => {
    it("parses gradient with only first stop positioned", () => {
      const css = "conic-gradient(red 0deg, yellow, blue, green)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(4);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with only last stop positioned", () => {
      const css = "conic-gradient(red, yellow, blue, green 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(4);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with middle stop positioned", () => {
      const css = "conic-gradient(red, yellow 90deg, blue, green)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(4);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Real-World Patterns", () => {
    it("parses pie chart pattern", () => {
      const css = "conic-gradient(red 0deg 90deg, blue 90deg 180deg, green 180deg 270deg, yellow 270deg 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(4);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses rainbow wheel", () => {
      const css = `conic-gradient(
        hsl(0, 100%, 50%) 0deg,
        hsl(60, 100%, 50%) 60deg,
        hsl(120, 100%, 50%) 120deg,
        hsl(180, 100%, 50%) 180deg,
        hsl(240, 100%, 50%) 240deg,
        hsl(300, 100%, 50%) 300deg,
        hsl(360, 100%, 50%) 360deg
      )`;
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(7);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses checkerboard pattern", () => {
      const css = "repeating-conic-gradient(black 0deg 15deg, white 15deg 30deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.repeating).toBe(true);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses starburst pattern", () => {
      const css = "repeating-conic-gradient(from 0deg, yellow 0deg 10deg, transparent 10deg 20deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.repeating).toBe(true);
      expect(result.value.fromAngle).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });
});
