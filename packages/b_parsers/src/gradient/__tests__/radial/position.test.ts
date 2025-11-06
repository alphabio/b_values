// b_path:: packages/b_parsers/src/gradient/__tests__/radial/position.test.ts
import { describe, it, expect } from "vitest";
import * as Radial from "../../radial";

describe("Radial Gradient Parser - Position", () => {
  describe("Keyword Positions - Horizontal", () => {
    it("parses 'at left'", () => {
      const css = "radial-gradient(at left, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });

    it("parses 'at center' (horizontal)", () => {
      const css = "radial-gradient(at center, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });

    it("parses 'at right'", () => {
      const css = "radial-gradient(at right, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "right" },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });
  });

  describe("Keyword Positions - Vertical", () => {
    it("parses 'at top'", () => {
      const css = "radial-gradient(at top, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "top" },
        });
      }
    });

    it("parses 'at bottom'", () => {
      const css = "radial-gradient(at bottom, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "bottom" },
        });
      }
    });
  });

  describe("Keyword Combinations", () => {
    it("parses 'at left top'", () => {
      const css = "radial-gradient(at left top, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "top" },
        });
      }
    });

    it("parses 'at left center'", () => {
      const css = "radial-gradient(at left center, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });

    it("parses 'at left bottom'", () => {
      const css = "radial-gradient(at left bottom, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "bottom" },
        });
      }
    });

    it("parses 'at center top'", () => {
      const css = "radial-gradient(at center top, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "top" },
        });
      }
    });

    it("parses 'at center center'", () => {
      const css = "radial-gradient(at center center, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });

    it("parses 'at center bottom'", () => {
      const css = "radial-gradient(at center bottom, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "bottom" },
        });
      }
    });

    it("parses 'at right top'", () => {
      const css = "radial-gradient(at right top, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "right" },
          vertical: { kind: "keyword", value: "top" },
        });
      }
    });

    it("parses 'at right center'", () => {
      const css = "radial-gradient(at right center, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "right" },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });

    it("parses 'at right bottom'", () => {
      const css = "radial-gradient(at right bottom, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "right" },
          vertical: { kind: "keyword", value: "bottom" },
        });
      }
    });
  });

  describe("Percentage Positions", () => {
    it("parses 'at 0% 0%'", () => {
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

    it("parses 'at 50% 50%'", () => {
      const css = "radial-gradient(at 50% 50%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 50, unit: "%" },
          vertical: { kind: "literal", value: 50, unit: "%" },
        });
      }
    });

    it("parses 'at 100% 100%'", () => {
      const css = "radial-gradient(at 100% 100%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 100, unit: "%" },
          vertical: { kind: "literal", value: 100, unit: "%" },
        });
      }
    });

    it("parses 'at 25% 75%'", () => {
      const css = "radial-gradient(at 25% 75%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 25, unit: "%" },
          vertical: { kind: "literal", value: 75, unit: "%" },
        });
      }
    });

    it("parses 'at 33.333%'", () => {
      const css = "radial-gradient(at 33.333%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position?.horizontal).toEqual({
          kind: "literal",
          value: 33.333,
          unit: "%",
        });
        expect(result.value.position?.vertical).toEqual({
          kind: "keyword",
          value: "center",
        });
      }
    });
  });

  describe("Length Positions", () => {
    it("parses 'at 10px 20px'", () => {
      const css = "radial-gradient(at 10px 20px, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 10, unit: "px" },
          vertical: { kind: "literal", value: 20, unit: "px" },
        });
      }
    });

    it("parses 'at 5em 10em'", () => {
      const css = "radial-gradient(at 5em 10em, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 5, unit: "em" },
          vertical: { kind: "literal", value: 10, unit: "em" },
        });
      }
    });

    it("parses 'at 2rem 4rem'", () => {
      const css = "radial-gradient(at 2rem 4rem, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 2, unit: "rem" },
          vertical: { kind: "literal", value: 4, unit: "rem" },
        });
      }
    });

    it("parses 'at 10vw 20vh'", () => {
      const css = "radial-gradient(at 10vw 20vh, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 10, unit: "vw" },
          vertical: { kind: "literal", value: 20, unit: "vh" },
        });
      }
    });
  });

  describe("Mixed Keyword and Length", () => {
    it("parses 'at left 20px'", () => {
      const css = "radial-gradient(at left 20px, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "literal", value: 20, unit: "px" },
        });
      }
    });

    it("parses 'at 50% bottom'", () => {
      const css = "radial-gradient(at 50% bottom, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 50, unit: "%" },
          vertical: { kind: "keyword", value: "bottom" },
        });
      }
    });

    it("parses 'at center 25%'", () => {
      const css = "radial-gradient(at center 25%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "literal", value: 25, unit: "%" },
        });
      }
    });

    it("parses 'at 100px top'", () => {
      const css = "radial-gradient(at 100px top, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 100, unit: "px" },
          vertical: { kind: "keyword", value: "top" },
        });
      }
    });
  });

  describe("Position with Shape/Size", () => {
    it("parses 'circle at center'", () => {
      const css = "radial-gradient(circle at center, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });

    it("parses 'ellipse at 50% 50%'", () => {
      const css = "radial-gradient(ellipse at 50% 50%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("ellipse");
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 50, unit: "%" },
          vertical: { kind: "literal", value: 50, unit: "%" },
        });
      }
    });

    it("parses 'closest-side at left top'", () => {
      const css = "radial-gradient(closest-side at left top, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-side",
        });
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "top" },
        });
      }
    });

    it("parses 'circle closest-side at 30% 40%'", () => {
      const css = "radial-gradient(circle closest-side at 30% 40%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.shape).toBe("circle");
        expect(result.value.size).toEqual({
          kind: "keyword",
          value: "closest-side",
        });
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 30, unit: "%" },
          vertical: { kind: "literal", value: 40, unit: "%" },
        });
      }
    });

    it("parses '50px at right bottom'", () => {
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

  describe("Dynamic Values in Position", () => {
    it("parses var() in horizontal position", () => {
      const css = "radial-gradient(at var(--pos-x) 50%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "variable", name: "--pos-x" },
          vertical: { kind: "literal", value: 50, unit: "%" },
        });
      }
    });

    it("parses var() in vertical position", () => {
      const css = "radial-gradient(at 50% var(--pos-y), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "literal", value: 50, unit: "%" },
          vertical: { kind: "variable", name: "--pos-y" },
        });
      }
    });

    it("parses var() in both positions", () => {
      const css = "radial-gradient(at var(--x) var(--y), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "variable", name: "--x" },
          vertical: { kind: "variable", name: "--y" },
        });
      }
    });

    it("parses calc() in horizontal position", () => {
      const css = "radial-gradient(at calc(50% - 10px) 50%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const pos = result.value.position;
        if (pos) {
          expect(pos.horizontal.kind).toBe("calc");
          expect(pos.vertical).toEqual({ kind: "literal", value: 50, unit: "%" });
        }
      }
    });

    it("parses calc() in vertical position", () => {
      const css = "radial-gradient(at 50% calc(50% + 20px), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const pos = result.value.position;
        if (pos) {
          expect(pos.horizontal).toEqual({ kind: "literal", value: 50, unit: "%" });
          expect(pos.vertical.kind).toBe("calc");
        }
      }
    });

    it("parses calc() in both positions", () => {
      const css = "radial-gradient(at calc(10px + 5px) calc(20px * 2), red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const pos = result.value.position;
        if (pos) {
          expect(pos.horizontal.kind).toBe("calc");
          expect(pos.vertical.kind).toBe("calc");
        }
      }
    });

    it("parses clamp() in position", () => {
      const css = "radial-gradient(at clamp(0%, 50%, 100%) 50%, red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const pos = result.value.position;
        if (pos) {
          expect(pos.horizontal.kind).toBe("clamp");
        }
      }
    });
  });
});
