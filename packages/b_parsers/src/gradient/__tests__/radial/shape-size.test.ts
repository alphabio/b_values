// b_path:: packages/b_parsers/src/gradient/__tests__/radial/shape-size.test.ts
import { describe, it, expect } from "vitest";
import * as Radial from "../../radial";

describe("Radial Gradient Parser - Shape & Size", () => {
  describe("Shape Only", () => {
    it("parses with circle shape", () => {
      const css = "radial-gradient(circle, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toBeUndefined();
      }
    });

    it("parses with ellipse shape", () => {
      const css = "radial-gradient(ellipse, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toBeUndefined();
      }
    });
  });

  describe("Size Keywords Only", () => {
    it("parses closest-side", () => {
      const css = "radial-gradient(closest-side, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBeUndefined();
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-side",
        });
      }
    });

    it("parses farthest-side", () => {
      const css = "radial-gradient(farthest-side, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "farthest-side",
        });
      }
    });

    it("parses closest-corner", () => {
      const css = "radial-gradient(closest-corner, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-corner",
        });
      }
    });

    it("parses farthest-corner", () => {
      const css = "radial-gradient(farthest-corner, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "farthest-corner",
        });
      }
    });
  });

  describe("Shape + Size Keyword", () => {
    it("parses circle closest-side", () => {
      const css = "radial-gradient(circle closest-side, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-side",
        });
      }
    });

    it("parses circle farthest-side", () => {
      const css = "radial-gradient(circle farthest-side, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "farthest-side",
        });
      }
    });

    it("parses circle closest-corner", () => {
      const css = "radial-gradient(circle closest-corner, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-corner",
        });
      }
    });

    it("parses circle farthest-corner", () => {
      const css = "radial-gradient(circle farthest-corner, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "farthest-corner",
        });
      }
    });

    it("parses ellipse closest-side", () => {
      const css = "radial-gradient(ellipse closest-side, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-side",
        });
      }
    });

    it("parses ellipse farthest-side", () => {
      const css = "radial-gradient(ellipse farthest-side, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "farthest-side",
        });
      }
    });

    it("parses ellipse closest-corner", () => {
      const css = "radial-gradient(ellipse closest-corner, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-corner",
        });
      }
    });

    it("parses ellipse farthest-corner", () => {
      const css = "radial-gradient(ellipse farthest-corner, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "farthest-corner",
        });
      }
    });
  });

  describe("Size Keyword + Shape (Reversed)", () => {
    it("parses closest-side circle", () => {
      const css = "radial-gradient(closest-side circle, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-side",
        });
      }
    });

    it("parses farthest-side circle", () => {
      const css = "radial-gradient(farthest-side circle, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "farthest-side",
        });
      }
    });

    it("parses closest-corner ellipse", () => {
      const css = "radial-gradient(closest-corner ellipse, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-corner",
        });
      }
    });

    it("parses farthest-corner ellipse", () => {
      const css = "radial-gradient(farthest-corner ellipse, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "farthest-corner",
        });
      }
    });
  });

  describe("Explicit Circle Sizes", () => {
    it("parses circle 50px", () => {
      const css = "radial-gradient(circle 50px, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 50, unit: "px" },
        });
      }
    });

    it("parses circle 10em", () => {
      const css = "radial-gradient(circle 10em, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 10, unit: "em" },
        });
      }
    });

    it("parses circle 5rem", () => {
      const css = "radial-gradient(circle 5rem, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 5, unit: "rem" },
        });
      }
    });

    it("parses circle 50%", () => {
      const css = "radial-gradient(circle 50%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 50, unit: "%" },
        });
      }
    });

    it("parses circle 20vw", () => {
      const css = "radial-gradient(circle 20vw, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 20, unit: "vw" },
        });
      }
    });

    it("parses circle 15vh", () => {
      const css = "radial-gradient(circle 15vh, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 15, unit: "vh" },
        });
      }
    });
  });

  describe("Explicit Ellipse Sizes", () => {
    it("parses ellipse 50px 100px", () => {
      const css = "radial-gradient(ellipse 50px 100px, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.size).toEqual({
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 50, unit: "px" },
          radiusY: { kind: "literal", value: 100, unit: "px" },
        });
      }
    });

    it("parses ellipse 20% 40%", () => {
      const css = "radial-gradient(ellipse 20% 40%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 20, unit: "%" },
          radiusY: { kind: "literal", value: 40, unit: "%" },
        });
      }
    });

    it("parses ellipse 5em 10em", () => {
      const css = "radial-gradient(ellipse 5em 10em, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 5, unit: "em" },
          radiusY: { kind: "literal", value: 10, unit: "em" },
        });
      }
    });

    it("parses ellipse with mixed units (px and %)", () => {
      const css = "radial-gradient(ellipse 100px 50%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 100, unit: "px" },
          radiusY: { kind: "literal", value: 50, unit: "%" },
        });
      }
    });
  });

  describe("Implicit Sizes (No Shape Keyword)", () => {
    it("parses single value as circle-explicit", () => {
      const css = "radial-gradient(50px, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBeUndefined();
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "literal", value: 50, unit: "px" },
        });
      }
    });

    it("parses two values as ellipse-explicit", () => {
      const css = "radial-gradient(50px 100px, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBeUndefined();
        expect(result.value.size).toEqual({
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 50, unit: "px" },
          radiusY: { kind: "literal", value: 100, unit: "px" },
        });
      }
    });
  });

  describe("Dynamic Values in Size", () => {
    it("parses var() in circle radius", () => {
      const css = "radial-gradient(circle var(--radius), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "circle-explicit",
          radius: { kind: "variable", name: "--radius" },
        });
      }
    });

    it("parses calc() in circle radius", () => {
      const css = "radial-gradient(circle calc(50px + 10px), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const size = result.value.size;
        if (size?.kind === "circle-explicit") {
          expect(size.radius.kind).toBe("calc");
        }
      }
    });

    it("parses clamp() in circle radius", () => {
      const css = "radial-gradient(circle clamp(10px, 50px, 100px), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const size = result.value.size;
        if (size?.kind === "circle-explicit") {
          expect(size.radius.kind).toBe("clamp");
        }
      }
    });

    it("parses var() in ellipse radii", () => {
      const css = "radial-gradient(ellipse var(--rx) var(--ry), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "ellipse-explicit",
          radiusX: { kind: "variable", name: "--rx" },
          radiusY: { kind: "variable", name: "--ry" },
        });
      }
    });

    it("parses calc() in ellipse radii", () => {
      const css = "radial-gradient(ellipse calc(50px + 10px) calc(100px - 20px), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const size = result.value.size;
        if (size?.kind === "ellipse-explicit") {
          expect(size.radiusX.kind).toBe("calc");
          expect(size.radiusY.kind).toBe("calc");
        }
      }
    });

    it("parses mixed dynamic values (var and calc)", () => {
      const css = "radial-gradient(ellipse var(--rx) calc(100px * 2), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const size = result.value.size;
        if (size?.kind === "ellipse-explicit") {
          expect(size.radiusX).toEqual({ kind: "variable", name: "--rx" });
          expect(size.radiusY.kind).toBe("calc");
        }
      }
    });
  });
});
