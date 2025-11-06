// b_path:: packages/b_parsers/src/gradient/__tests__/radial/combinations.test.ts
import { describe, it, expect } from "vitest";
import * as Radial from "../../radial";

describe("Radial Gradient Parser - Combinations", () => {
  describe("Shape + Size + Position", () => {
    it("parses circle closest-side at center", () => {
      const css = "radial-gradient(circle closest-side at center, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({ kind: "keyword", value: "closest-side" });
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });

    it("parses ellipse farthest-corner at 30% 40%", () => {
      const css = "radial-gradient(ellipse farthest-corner at 30% 40%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({ kind: "keyword", value: "farthest-corner" });
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 30, unit: "%" },
          vertical: { kind: "literal", value: 40, unit: "%" },
        });
      }
    });

    it("parses 50px at right bottom", () => {
      const css = "radial-gradient(50px at right bottom, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 50, unit: "px" },
        });
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "right" },
          vertical: { kind: "keyword", value: "bottom" },
        });
      }
    });
  });

  describe("All Features Combined", () => {
    it("parses circle + size + position + interpolation", () => {
      const css = "radial-gradient(circle closest-side at 50% 50%, in oklch, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({ kind: "keyword", value: "closest-side" });
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 50, unit: "%" },
          vertical: { kind: "literal", value: 50, unit: "%" },
        });
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "oklch" });
      }
    });

    it("parses ellipse + explicit size + position + interpolation + hue", () => {
      const css = "radial-gradient(ellipse 100px 50px at left top, in lch longer hue, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 100, unit: "px" },
          radiusY: { kind: "literal", value: 50, unit: "px" },
        });
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "top" },
        });
        expect(result.value.colorInterpolationMethod).toEqual({
          colorSpace: "lch",
          hueInterpolationMethod: "longer hue",
        });
      }
    });

    it("parses all features with color stop positions", () => {
      const css = "radial-gradient(circle 50px at center, in srgb, red 0%, yellow 50%, blue 100%)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 50, unit: "px" },
        });
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "srgb" });
        expect(result.value.colorStops).toHaveLength(3);
      }
    });
  });

  describe("Repeating Gradients", () => {
    it("parses repeating-radial-gradient with basic features", () => {
      const css = "repeating-radial-gradient(circle, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.repeating).toBe(true);
        expect(result.value.shape).toBe("circle");
      }
    });

    it("parses repeating with all features", () => {
      const css = "repeating-radial-gradient(circle closest-side at 50% 50%, in oklch, red 0%, blue 10%)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.repeating).toBe(true);
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({ kind: "keyword", value: "closest-side" });
        expect(result.value.colorInterpolationMethod).toEqual({ colorSpace: "oklch" });
      }
    });
  });

  describe("Dynamic Values Combined", () => {
    it("parses var() in size and position", () => {
      const css = "radial-gradient(circle var(--radius) at var(--x) var(--y), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "variable", name: "--radius" },
        });
        expect(result.value.position).toEqual({
          horizontal: { kind: "variable", name: "--x" },
          vertical: { kind: "variable", name: "--y" },
        });
      }
    });

    it("parses calc() in size, position, and color stops", () => {
      const css =
        "radial-gradient(circle calc(50px + 10px) at calc(50% - 10px) calc(50% + 10px), red calc(10% + 5%), blue calc(90% - 5%))";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const size = result.value.size;
        if (size?.kind === "circle-explicit") {
          expect(size.radius.kind).toBe("calc");
        }
        const pos = result.value.position;
        if (pos) {
          if ("kind" in pos.horizontal && "kind" in pos.vertical) {
            expect(pos.horizontal.kind).toBe("calc");
            expect(pos.vertical.kind).toBe("calc");
          }
        }
        const stop1Pos = result.value.colorStops[0].position;
        const stop2Pos = result.value.colorStops[1].position;
        if (stop1Pos && !Array.isArray(stop1Pos)) {
          expect(stop1Pos.kind).toBe("calc");
        }
        if (stop2Pos && !Array.isArray(stop2Pos)) {
          expect(stop2Pos.kind).toBe("calc");
        }
      }
    });

    it("parses mixed dynamic values everywhere", () => {
      const css =
        "radial-gradient(ellipse var(--rx) calc(100px * 2) at clamp(0%, 50%, 100%) var(--y), var(--color1) var(--pos1), red calc(50% + 10px))";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const size = result.value.size;
        if (size?.kind === "ellipse-explicit") {
          expect(size.radiusX).toEqual({ kind: "variable", name: "--rx" });
          expect(size.radiusY.kind).toBe("calc");
        }
        const pos = result.value.position;
        if (pos) {
          if ("kind" in pos.horizontal) {
            expect(pos.horizontal.kind).toBe("clamp");
          }
          expect(pos.vertical).toEqual({ kind: "variable", name: "--y" });
        }
      }
    });
  });
});
