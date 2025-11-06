// b_path:: packages/b_parsers/src/gradient/__tests__/radial/edge-cases.test.ts
import { describe, it, expect } from "vitest";
import * as Radial from "../../radial";

describe("Radial Gradient Parser - Edge Cases", () => {
  describe("Stress Tests", () => {
    it("parses gradient with 100+ color stops", () => {
      const stops = Array.from({ length: 101 }, (_, i) => {
        const color = i % 2 === 0 ? "red" : "blue";
        return `${color} ${i}%`;
      }).join(", ");
      const css = `radial-gradient(${stops})`;
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops.length).toBeGreaterThanOrEqual(100);
      }
    });
  });

  describe("High Precision Decimals", () => {
    it("parses position with many decimal places", () => {
      const css = "radial-gradient(at 33.33333333% 66.66666666%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position?.horizontal).toEqual({
          kind: "literal",
          value: 33.33333333,
          unit: "%",
        });
      }
    });

    it("parses size with many decimal places", () => {
      const css = "radial-gradient(circle 12.3456789px, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 12.3456789, unit: "px" },
        });
      }
    });
  });

  describe("Zero Values", () => {
    it("parses 0% position", () => {
      const css = "radial-gradient(at 0% 0%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 0, unit: "%" },
          vertical: { kind: "literal", value: 0, unit: "%" },
        });
      }
    });

    it("parses 0px position", () => {
      const css = "radial-gradient(at 0px 0px, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 0, unit: "px" },
          vertical: { kind: "literal", value: 0, unit: "px" },
        });
      }
    });
  });

  describe("Whitespace Variations", () => {
    it("parses with extra whitespace", () => {
      const css = "radial-gradient(  circle   closest-side   at   center  ,  red  ,  blue  )";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({ kind: "keyword", value: "closest-side" });
      }
    });

    it("parses with minimal whitespace", () => {
      const css = "radial-gradient(circle closest-side at center,red,blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.colorStops).toHaveLength(2);
      }
    });
  });
});
