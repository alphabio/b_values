// b_path:: packages/b_parsers/src/gradient/__tests__/linear/direction.test.ts
import { describe, it, expect } from "vitest";
import * as Linear from "../../linear";

describe("Linear Gradient Parser - Direction", () => {
  describe("Angle Units", () => {
    it("parses degrees", () => {
      const css = "linear-gradient(45deg, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({
          kind: "angle",
          value: { kind: "literal", value: 45, unit: "deg" },
        });
      }
    });

    it("parses 0deg", () => {
      const css = "linear-gradient(0deg, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({
          kind: "angle",
          value: { kind: "literal", value: 0, unit: "deg" },
        });
      }
    });

    it("parses turns", () => {
      const css = "linear-gradient(0.25turn, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({
          kind: "angle",
          value: { kind: "literal", value: 0.25, unit: "turn" },
        });
      }
    });

    it("parses grads", () => {
      const css = "linear-gradient(100grad, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({
          kind: "angle",
          value: { kind: "literal", value: 100, unit: "grad" },
        });
      }
    });

    it("parses radians", () => {
      const css = "linear-gradient(1.57rad, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({
          kind: "angle",
          value: { kind: "literal", value: 1.57, unit: "rad" },
        });
      }
    });

    it("parses negative angle", () => {
      const css = "linear-gradient(-45deg, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({
          kind: "angle",
          value: { kind: "literal", value: -45, unit: "deg" },
        });
      }
    });
  });

  describe("To-Side Keywords", () => {
    it("parses 'to top'", () => {
      const css = "linear-gradient(to top, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-side", value: "top" });
      }
    });

    it("parses 'to right'", () => {
      const css = "linear-gradient(to right, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-side", value: "right" });
      }
    });

    it("parses 'to bottom'", () => {
      const css = "linear-gradient(to bottom, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-side", value: "bottom" });
      }
    });

    it("parses 'to left'", () => {
      const css = "linear-gradient(to left, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-side", value: "left" });
      }
    });
  });

  describe("To-Corner Keywords", () => {
    it("parses 'to top left'", () => {
      const css = "linear-gradient(to top left, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-corner", value: "top left" });
      }
    });

    it("parses 'to top right'", () => {
      const css = "linear-gradient(to top right, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-corner", value: "top right" });
      }
    });

    it("parses 'to bottom left'", () => {
      const css = "linear-gradient(to bottom left, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-corner", value: "bottom left" });
      }
    });

    it("parses 'to bottom right'", () => {
      const css = "linear-gradient(to bottom right, red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-corner", value: "bottom right" });
      }
    });
  });

  describe("No Direction", () => {
    it("parses gradient without direction", () => {
      const css = "linear-gradient(red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toBeUndefined();
      }
    });
  });

  describe("Dynamic Values", () => {
    it("parses var() in direction", () => {
      const css = "linear-gradient(var(--angle), red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({
          kind: "angle",
          value: { kind: "variable", name: "--angle" },
        });
      }
    });

    it("parses calc() in direction", () => {
      const css = "linear-gradient(calc(45deg + 10deg), red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction?.kind).toBe("angle");
        if (result.value.direction?.kind === "angle") {
          expect(result.value.direction.value.kind).toBe("calc");
        }
      }
    });
  });
});
