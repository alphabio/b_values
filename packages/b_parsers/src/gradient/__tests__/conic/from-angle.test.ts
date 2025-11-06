// b_path:: packages/b_parsers/src/gradient/__tests__/conic/from-angle.test.ts
import { describe, expect, it } from "vitest";
import * as Conic from "../../conic";
import * as Generate from "@b/generators";

describe("Conic Gradient - From Angle", () => {
  describe("Angle Units", () => {
    it("parses from angle in degrees", () => {
      const css = "conic-gradient(from 45deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        kind: "literal",
        value: 45,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
      if (genResult.ok) {
        expect(genResult.value).toBe("conic-gradient(from 45deg, red, blue)");
      }
    });

    it("parses from angle in gradians", () => {
      const css = "conic-gradient(from 50grad, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        kind: "literal",
        value: 50,
        unit: "grad",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses from angle in radians", () => {
      const css = "conic-gradient(from 0.785rad, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        kind: "literal",
        value: 0.785,
        unit: "rad",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses from angle in turns", () => {
      const css = "conic-gradient(from 0.25turn, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        kind: "literal",
        value: 0.25,
        unit: "turn",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
      if (genResult.ok) {
        expect(genResult.value).toBe("conic-gradient(from 0.25turn, red, blue)");
      }
    });
  });

  describe("Angle Values", () => {
    it("parses zero angle", () => {
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

    it("parses 90 degree angle (right)", () => {
      const css = "conic-gradient(from 90deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 90,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses 180 degree angle (bottom)", () => {
      const css = "conic-gradient(from 180deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 180,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses 270 degree angle (left)", () => {
      const css = "conic-gradient(from 270deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 270,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses 360 degree angle (full circle)", () => {
      const css = "conic-gradient(from 360deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 360,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Negative Angles", () => {
    it("parses negative degree angle", () => {
      const css = "conic-gradient(from -45deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: -45,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses negative turn angle", () => {
      const css = "conic-gradient(from -0.25turn, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: -0.25,
        unit: "turn",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses negative 90 degrees", () => {
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

  describe("Large Angles (Wrapping)", () => {
    it("parses angle > 360deg", () => {
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

    it("parses angle > 1turn", () => {
      const css = "conic-gradient(from 1.5turn, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 1.5,
        unit: "turn",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses 720deg (two full circles)", () => {
      const css = "conic-gradient(from 720deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 720,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses 2turn", () => {
      const css = "conic-gradient(from 2turn, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 2,
        unit: "turn",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Decimal Angles", () => {
    it("parses decimal degree", () => {
      const css = "conic-gradient(from 45.5deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 45.5,
        unit: "deg",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses decimal turn", () => {
      const css = "conic-gradient(from 0.125turn, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 0.125,
        unit: "turn",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses decimal radian", () => {
      const css = "conic-gradient(from 1.5708rad, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        value: 1.5708,
        unit: "rad",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("CSS Value Functions", () => {
    it("parses var() for from angle", () => {
      const css = "conic-gradient(from var(--angle), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toMatchObject({
        kind: "variable",
        name: "--angle",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses var() with fallback", () => {
      const css = "conic-gradient(from var(--angle, 45deg), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("variable");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses calc() for from angle", () => {
      const css = "conic-gradient(from calc(45deg + 90deg), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("calc");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses calc() with var()", () => {
      const css = "conic-gradient(from calc(var(--base) * 2), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("calc");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses clamp() for from angle", () => {
      const css = "conic-gradient(from clamp(0deg, var(--angle), 360deg), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("clamp");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses min() for from angle", () => {
      const css = "conic-gradient(from min(90deg, var(--max-angle)), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("min");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses max() for from angle", () => {
      const css = "conic-gradient(from max(0deg, var(--min-angle)), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("max");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Without From Angle (Default)", () => {
    it("parses gradient without from angle", () => {
      const css = "conic-gradient(red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toBeUndefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
      if (genResult.ok) {
        expect(genResult.value).toBe("conic-gradient(red, blue)");
      }
    });

    it("parses gradient with position but no from angle", () => {
      const css = "conic-gradient(at center, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toBeUndefined();
      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });
});
