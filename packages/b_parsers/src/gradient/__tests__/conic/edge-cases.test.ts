// b_path:: packages/b_parsers/src/gradient/__tests__/conic/edge-cases.test.ts
import { describe, expect, it } from "vitest";
import * as Conic from "../../conic";
import * as Generate from "@b/generators";

describe("Conic Gradient - Edge Cases", () => {
  describe("Angle Wrapping", () => {
    it("parses gradient with 0deg to 360deg", () => {
      const css = "conic-gradient(red 0deg, blue 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(2);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with angle > 360deg", () => {
      const css = "conic-gradient(red 0deg, blue 450deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with 720deg (two full rotations)", () => {
      const css = "conic-gradient(red 0deg, blue 720deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with negative angles", () => {
      const css = "conic-gradient(red -90deg, blue 270deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with mixed negative and positive angles", () => {
      const css = "conic-gradient(red -45deg, yellow 0deg, blue 45deg, green 90deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(4);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses from angle with wrapping", () => {
      const css = "conic-gradient(from 450deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 450,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses from negative angle", () => {
      const css = "conic-gradient(from -90deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: -90,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Out-of-Order Stops", () => {
    it("parses stops in reverse order", () => {
      const css = "conic-gradient(red 360deg, yellow 270deg, blue 180deg, green 90deg, red 0deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(5);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses stops with mixed order", () => {
      const css = "conic-gradient(red 0deg, blue 270deg, yellow 90deg, green 180deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(4);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Zero and Full Circle Angles", () => {
    it("parses gradient starting at 0deg", () => {
      const css = "conic-gradient(from 0deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 0,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with 0deg color stop", () => {
      const css = "conic-gradient(red 0deg, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with 360deg color stop", () => {
      const css = "conic-gradient(red, blue 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with both 0deg and 360deg stops", () => {
      const css = "conic-gradient(red 0deg, blue 180deg, red 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Extreme Positions", () => {
    it("parses position at 0% 0%", () => {
      const css = "conic-gradient(at 0% 0%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses position at 100% 100%", () => {
      const css = "conic-gradient(at 100% 100%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses position far outside viewport", () => {
      const css = "conic-gradient(at 200% 200%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses position with negative values", () => {
      const css = "conic-gradient(at -50% -50%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Very Small Angle Increments", () => {
    it("parses gradient with 0.1deg increments", () => {
      const css = "conic-gradient(red 0deg, blue 0.1deg, green 0.2deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with 0.01deg increments", () => {
      const css = "conic-gradient(red 0deg, blue 0.01deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Many Color Stops", () => {
    it("parses gradient with 10 color stops", () => {
      const css = `conic-gradient(
        red 0deg,
        orange 40deg,
        yellow 80deg,
        lime 120deg,
        green 160deg,
        cyan 200deg,
        blue 240deg,
        purple 280deg,
        magenta 320deg,
        red 360deg
      )`;
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(10);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with 20 color stops", () => {
      const stops = Array.from({ length: 20 }, (_, i) => `red ${i * 18}deg`).join(", ");
      const css = `conic-gradient(${stops})`;
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(20);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Whitespace Handling", () => {
    it("parses gradient with minimal whitespace", () => {
      const css = "conic-gradient(from 45deg at 50% 50%,red 0deg,blue 180deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with excessive whitespace", () => {
      const css = `conic-gradient(
        from   45deg
        at     50%    50%  ,
        red    0deg   ,
        blue   180deg
      )`;
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with newlines", () => {
      const css = `conic-gradient(
        from 45deg at 50% 50%,
        red 0deg,
        blue 180deg,
        red 360deg
      )`;
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(3);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Transparent and Special Colors", () => {
    it("parses gradient with transparent", () => {
      const css = "conic-gradient(transparent, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops[0]?.color.kind).toBe("special");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient with currentColor", () => {
      const css = "conic-gradient(currentColor, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops[0]?.color.kind).toBe("special");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses gradient mixing transparent and solid colors", () => {
      const css = "conic-gradient(red 0deg, transparent 90deg, blue 180deg, transparent 270deg, red 360deg)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.colorStops).toHaveLength(5);

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });
});
