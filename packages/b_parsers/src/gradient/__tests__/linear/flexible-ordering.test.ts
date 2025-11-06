// b_path:: packages/b_parsers/src/gradient/__tests__/linear/flexible-ordering.test.ts
/**
 * TDD Test Suite: Flexible Component Ordering for Linear Gradients
 *
 * Implements CSS spec: [ <linear-gradient-syntax> ]? || <color-interpolation-method>
 *
 * The || operator means direction and interpolation can appear in any order.
 *
 * This test suite validates all valid permutations of:
 * - direction (angle or to <side-or-corner>)
 * - color interpolation (in <colorspace>)
 */

import { describe, expect, it } from "vitest";
import { parse } from "../../index";

describe("Linear Gradient: Flexible Component Ordering", () => {
  /**
   * BASELINE: Verify conventional ordering still works
   */
  describe("conventional ordering (baseline)", () => {
    it("accepts: direction, interpolation", () => {
      const result = parse("linear-gradient(45deg in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");

      expect(result.value.kind).toBe("linear");
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.repeating).toBe(false);
      expect(result.value.direction?.kind).toBe("angle");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: to-side, interpolation", () => {
      const result = parse("linear-gradient(to right in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");

      expect(result.value.direction?.kind).toBe("to-side");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: to-corner, interpolation", () => {
      const result = parse("linear-gradient(to top right in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");

      expect(result.value.direction?.kind).toBe("to-corner");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });
  });

  /**
   * FLEXIBLE ORDERING: Direction and interpolation in any order
   */
  describe("flexible ordering: angle + interpolation", () => {
    it("accepts: angle, interpolation (conventional)", () => {
      const result = parse("linear-gradient(45deg in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.direction?.kind).toBe("angle");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, angle (FLEXIBLE ORDER)", () => {
      const result = parse("linear-gradient(in oklch 45deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.direction?.kind).toBe("angle");
    });
  });

  describe("flexible ordering: to-side + interpolation", () => {
    it("accepts: to-side, interpolation (conventional)", () => {
      const result = parse("linear-gradient(to right in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.direction?.kind).toBe("to-side");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, to-side (FLEXIBLE ORDER)", () => {
      const result = parse("linear-gradient(in oklch to right, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.direction?.kind).toBe("to-side");
    });
  });

  describe("flexible ordering: to-corner + interpolation", () => {
    it("accepts: to-corner, interpolation (conventional)", () => {
      const result = parse("linear-gradient(to top right in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.direction?.kind).toBe("to-corner");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, to-corner (FLEXIBLE ORDER)", () => {
      const result = parse("linear-gradient(in oklch to top right, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.direction?.kind).toBe("to-corner");
    });
  });

  /**
   * VARIOUS ANGLES
   */
  describe("various angle units with flexible ordering", () => {
    it("accepts: deg, interpolation", () => {
      const result = parse("linear-gradient(90deg in srgb, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: interpolation, deg", () => {
      const result = parse("linear-gradient(in srgb 90deg, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: rad, interpolation", () => {
      const result = parse("linear-gradient(1.57rad in oklch, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: interpolation, rad", () => {
      const result = parse("linear-gradient(in oklch 1.57rad, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: turn, interpolation", () => {
      const result = parse("linear-gradient(0.25turn in oklch, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: interpolation, turn", () => {
      const result = parse("linear-gradient(in oklch 0.25turn, red, blue)");
      expect(result.ok).toBe(true);
    });
  });

  /**
   * ALL SIDES
   */
  describe("all to-side directions with flexible ordering", () => {
    const sides = ["top", "right", "bottom", "left"];

    for (const side of sides) {
      it(`accepts: to ${side}, interpolation`, () => {
        const result = parse(`linear-gradient(to ${side} in oklch, red, blue)`);
        expect(result.ok).toBe(true);
      });

      it(`accepts: interpolation, to ${side}`, () => {
        const result = parse(`linear-gradient(in oklch to ${side}, red, blue)`);
        expect(result.ok).toBe(true);
      });
    }
  });

  /**
   * ALL CORNERS
   */
  describe("all to-corner directions with flexible ordering", () => {
    const corners = ["top left", "top right", "bottom left", "bottom right"];

    for (const corner of corners) {
      it(`accepts: to ${corner}, interpolation`, () => {
        const result = parse(`linear-gradient(to ${corner} in oklch, red, blue)`);
        expect(result.ok).toBe(true);
      });

      it(`accepts: interpolation, to ${corner}`, () => {
        const result = parse(`linear-gradient(in oklch to ${corner}, red, blue)`);
        expect(result.ok).toBe(true);
      });
    }
  });

  /**
   * MINIMAL COMPONENTS
   */
  describe("minimal components", () => {
    it("accepts: no components, just color stops (default direction)", () => {
      const result = parse("linear-gradient(red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.colorStops.length).toBeGreaterThanOrEqual(2);
    });

    it("accepts: only interpolation", () => {
      const result = parse("linear-gradient(in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: only direction (angle)", () => {
      const result = parse("linear-gradient(45deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.direction?.kind).toBe("angle");
    });

    it("accepts: only direction (to-side)", () => {
      const result = parse("linear-gradient(to right, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.direction?.kind).toBe("to-side");
    });
  });

  /**
   * DUPLICATE DETECTION
   */
  describe("duplicate detection", () => {
    it("rejects: duplicate direction", () => {
      const result = parse("linear-gradient(45deg to right, red, blue)");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues.some((i) => i.code === "invalid-syntax")).toBe(true);
      }
    });

    it("rejects: duplicate interpolation", () => {
      const result = parse("linear-gradient(in oklch in srgb, red, blue)");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues.some((i) => i.code === "invalid-syntax")).toBe(true);
      }
    });
  });

  /**
   * COMPLEX REAL-WORLD EXAMPLES
   */
  describe("complex real-world scenarios", () => {
    it("accepts: interpolation first with multiple color stops", () => {
      const result = parse("linear-gradient(in oklch 45deg, red 0%, yellow 50%, blue 100%)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.direction?.kind).toBe("angle");
      expect(result.value.colorStops.length).toBe(3);
    });

    it("accepts: interpolation with to-corner, many stops", () => {
      const result = parse("linear-gradient(in oklch to bottom right, red, orange, yellow, green, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.direction?.kind).toBe("to-corner");
      expect(result.value.colorStops.length).toBe(5);
    });

    it("accepts: calc() angle with interpolation", () => {
      const result = parse("linear-gradient(calc(45deg + 45deg) in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.direction?.kind).toBe("angle");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation first with calc() angle", () => {
      const result = parse("linear-gradient(in oklch calc(90deg - 45deg), red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.direction?.kind).toBe("angle");
    });
  });

  /**
   * REPEATING GRADIENTS
   */
  describe("repeating-linear-gradient: flexible ordering", () => {
    it("accepts: direction, interpolation", () => {
      const result = parse("repeating-linear-gradient(45deg in oklch, red 0px, blue 10px)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.kind).toBe("linear");
      expect(result.value.repeating).toBe(true);
      expect(result.value.direction?.kind).toBe("angle");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, direction", () => {
      const result = parse("repeating-linear-gradient(in oklch 45deg, red 0px, blue 10px)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.kind).toBe("linear");
      expect(result.value.repeating).toBe(true);
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.direction?.kind).toBe("angle");
    });

    it("accepts: interpolation, to-side", () => {
      const result = parse("repeating-linear-gradient(in oklch to right, red 0px, blue 10px)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "linear") throw new Error("Expected linear gradient");
      expect(result.value.kind).toBe("linear");
      expect(result.value.repeating).toBe(true);
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.direction?.kind).toBe("to-side");
    });
  });

  /**
   * VARIOUS COLORSPACES
   */
  describe("various colorspaces with flexible ordering", () => {
    const colorspaces = ["srgb", "srgb-linear", "lab", "oklab", "xyz", "hsl", "hwb", "lch", "oklch"];

    for (const colorspace of colorspaces) {
      it(`accepts: interpolation (in ${colorspace}), direction`, () => {
        const result = parse(`linear-gradient(in ${colorspace} 45deg, red, blue)`);
        expect(result.ok).toBe(true);
      });

      it(`accepts: direction, interpolation (in ${colorspace})`, () => {
        const result = parse(`linear-gradient(45deg in ${colorspace}, red, blue)`);
        expect(result.ok).toBe(true);
      });
    }
  });
});
