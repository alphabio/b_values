// b_path:: packages/b_parsers/src/gradient/__tests__/conic/flexible-ordering.test.ts
/**
 * TDD Test Suite: Flexible Component Ordering for Conic Gradients
 *
 * Implements CSS spec: [ [ from <angle> ]? [ at <position> ]? ] || <color-interpolation-method>
 *
 * The || operator means components can appear in any order,
 * with each component optional and appearing at most once.
 *
 * This test suite validates all valid permutations of:
 * - angle (from <angle>)
 * - position (at <position>)
 * - color interpolation (in <colorspace>)
 */

import { describe, expect, it } from "vitest";
import { parse } from "../../index";

describe("Conic Gradient: Flexible Component Ordering", () => {
  /**
   * BASELINE: Verify conventional ordering still works
   */
  describe("conventional ordering (baseline)", () => {
    it("accepts: angle, position, interpolation", () => {
      const result = parse("conic-gradient(from 45deg at center in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");

      expect(result.value.kind).toBe("conic");
      expect(result.value.repeating).toBe(false);
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: angle, position (no interpolation)", () => {
      const result = parse("conic-gradient(from 45deg at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");

      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();
    });

    it("accepts: angle, interpolation (no position)", () => {
      const result = parse("conic-gradient(from 45deg in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");

      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });
  });

  /**
   * TWO COMPONENTS: All 2-component permutations
   */
  describe("two components: angle + position", () => {
    it("accepts: angle, position", () => {
      const result = parse("conic-gradient(from 45deg at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();
    });

    it("accepts: position, angle (FLEXIBLE ORDER)", () => {
      const result = parse("conic-gradient(at center from 45deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });
  });

  describe("two components: angle + interpolation", () => {
    it("accepts: angle, interpolation", () => {
      const result = parse("conic-gradient(from 45deg in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, angle (FLEXIBLE ORDER)", () => {
      const result = parse("conic-gradient(in oklch from 45deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });
  });

  describe("two components: position + interpolation", () => {
    it("accepts: position, interpolation", () => {
      const result = parse("conic-gradient(at center in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, position (FLEXIBLE ORDER)", () => {
      const result = parse("conic-gradient(in oklch at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
    });
  });

  /**
   * THREE COMPONENTS: All 6 permutations (3! = 6)
   */
  describe("three components: all permutations", () => {
    it("accepts: angle, position, interpolation (1/6)", () => {
      const result = parse("conic-gradient(from 45deg at center in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: angle, interpolation, position (2/6)", () => {
      const result = parse("conic-gradient(from 45deg in oklch at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
    });

    it("accepts: position, angle, interpolation (3/6)", () => {
      const result = parse("conic-gradient(at center from 45deg in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: position, interpolation, angle (4/6)", () => {
      const result = parse("conic-gradient(at center in oklch from 45deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });

    it("accepts: interpolation, angle, position (5/6)", () => {
      const result = parse("conic-gradient(in oklch from 45deg at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();
    });

    it("accepts: interpolation, position, angle (6/6)", () => {
      const result = parse("conic-gradient(in oklch at center from 45deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });
  });

  /**
   * VARIOUS ANGLES
   */
  describe("various angle units with flexible ordering", () => {
    it("accepts: deg, position, interpolation", () => {
      const result = parse("conic-gradient(from 90deg at center in oklch, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: interpolation, rad, position", () => {
      const result = parse("conic-gradient(in oklch from 1.57rad at center, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: position, turn, interpolation", () => {
      const result = parse("conic-gradient(at center from 0.25turn in oklch, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: grad unit", () => {
      const result = parse("conic-gradient(from 100grad at center, red, blue)");
      expect(result.ok).toBe(true);
    });
  });

  /**
   * VARIOUS POSITIONS
   */
  describe("various positions with flexible ordering", () => {
    it("accepts: interpolation, position (center)", () => {
      const result = parse("conic-gradient(in oklch at center, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: position (top left), angle", () => {
      const result = parse("conic-gradient(at top left from 45deg, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: angle, position (percentage)", () => {
      const result = parse("conic-gradient(from 45deg at 30% 70%, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: position (left offset), interpolation", () => {
      const result = parse("conic-gradient(at left 20% top 30% in oklch, red, blue)");
      expect(result.ok).toBe(true);
    });

    it("accepts: interpolation, position (calc)", () => {
      const result = parse("conic-gradient(in oklch at calc(50% - 10px) center, red, blue)");
      expect(result.ok).toBe(true);
    });
  });

  /**
   * MINIMAL COMPONENTS
   */
  describe("minimal components", () => {
    it("accepts: no components, just color stops", () => {
      const result = parse("conic-gradient(red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorStops.length).toBeGreaterThanOrEqual(2);
    });

    it("accepts: only interpolation", () => {
      const result = parse("conic-gradient(in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: only position", () => {
      const result = parse("conic-gradient(at top right, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.position).toBeDefined();
    });

    it("accepts: only angle", () => {
      const result = parse("conic-gradient(from 45deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.fromAngle).toBeDefined();
    });
  });

  /**
   * DUPLICATE DETECTION
   */
  describe("duplicate detection", () => {
    it("rejects: duplicate angle", () => {
      const result = parse("conic-gradient(from 45deg from 90deg, red, blue)");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues.some((i) => i.code === "invalid-syntax")).toBe(true);
      }
    });

    it("rejects: duplicate position", () => {
      const result = parse("conic-gradient(at top at bottom, red, blue)");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues.some((i) => i.code === "invalid-syntax")).toBe(true);
      }
    });

    it("rejects: duplicate interpolation", () => {
      const result = parse("conic-gradient(in oklch in srgb, red, blue)");
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
    it("accepts: all components in non-standard order with many stops", () => {
      const result = parse(
        "conic-gradient(in oklch at 30% 70% from 45deg, red 0deg, yellow 90deg, blue 180deg, green 270deg)",
      );
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.colorStops.length).toBe(4);
    });

    it("accepts: interpolation first, complex position", () => {
      const result = parse("conic-gradient(in oklch at left 20% top 30% from 90deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });

    it("accepts: position with calc(), then other components", () => {
      const result = parse("conic-gradient(at calc(50% - 10px) center in oklch from 45deg, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });

    it("accepts: angle with calc(), reverse order", () => {
      const result = parse("conic-gradient(in oklch at center from calc(45deg + 45deg), red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });
  });

  /**
   * REPEATING GRADIENTS
   */
  describe("repeating-conic-gradient: flexible ordering", () => {
    it("accepts: angle, position, interpolation", () => {
      const result = parse("repeating-conic-gradient(from 0deg at center in oklch, red 0deg, blue 30deg)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.kind).toBe("conic");
      expect(result.value.repeating).toBe(true);
      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, position, angle", () => {
      const result = parse("repeating-conic-gradient(in oklch at center from 0deg, red 0deg, blue 30deg)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.kind).toBe("conic");
      expect(result.value.repeating).toBe(true);
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });

    it("accepts: position, interpolation (no angle)", () => {
      const result = parse("repeating-conic-gradient(at top in oklch, red 0deg, blue 30deg)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.kind).toBe("conic");
      expect(result.value.repeating).toBe(true);
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });
  });

  /**
   * VARIOUS COLORSPACES
   */
  describe("various colorspaces with flexible ordering", () => {
    const colorspaces = ["srgb", "srgb-linear", "lab", "oklab", "xyz", "hsl", "hwb", "lch", "oklch"];

    for (const colorspace of colorspaces) {
      it(`accepts: interpolation (in ${colorspace}), position, angle`, () => {
        const result = parse(`conic-gradient(in ${colorspace} at center from 45deg, red, blue)`);
        expect(result.ok).toBe(true);
      });

      it(`accepts: angle, position, interpolation (in ${colorspace})`, () => {
        const result = parse(`conic-gradient(from 45deg at center in ${colorspace}, red, blue)`);
        expect(result.ok).toBe(true);
      });
    }
  });

  /**
   * ANGLE STOP POSITIONS
   */
  describe("color stops with angle positions", () => {
    it("accepts: flexible ordering with angle stops", () => {
      const result = parse("conic-gradient(in oklch from 0deg, red 0deg, blue 90deg, green 180deg)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorStops.length).toBe(3);
    });

    it("accepts: position first, angle stops", () => {
      const result = parse("conic-gradient(at center from 45deg, red 45deg, blue 135deg)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.fromAngle).toBeDefined();
    });

    it("accepts: percentage stops with flexible ordering", () => {
      const result = parse("conic-gradient(in oklch at top from 0deg, red 0%, blue 50%, green 100%)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "conic") throw new Error("Expected conic gradient");
      expect(result.value.colorStops.length).toBe(3);
    });
  });
});
