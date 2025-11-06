// b_path:: packages/b_parsers/src/gradient/__tests__/radial/flexible-ordering.test.ts
/**
 * TDD Test Suite: Flexible Component Ordering for Radial Gradients
 *
 * Implements CSS spec: [ [ [ <radial-shape> || <radial-size> ]? [ at <position> ]? ] || <color-interpolation-method> ]?
 *
 * The || (double-bar) operator means components can appear in any order,
 * with each component optional and appearing at most once.
 *
 * This test suite validates all valid permutations of:
 * - shape (circle/ellipse)
 * - size (keyword or explicit)
 * - position (at <position>)
 * - color interpolation (in <colorspace>)
 */

import { describe, expect, it } from "vitest";
import { parse } from "../../index";

describe("Radial Gradient: Flexible Component Ordering", () => {
  /**
   * BASELINE: Verify conventional ordering still works
   * This ensures backward compatibility
   */
  describe("conventional ordering (baseline)", () => {
    it("accepts: shape, size, position, interpolation", () => {
      const result = parse("radial-gradient(circle 100px at center in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");

      expect(result.value.kind).toBe("radial");
      expect(result.value.repeating).toBe(false);
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.size?.kind).toBe("circle-explicit");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: shape, position, interpolation (no size)", () => {
      const result = parse("radial-gradient(circle at center in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");

      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: size keyword, position, interpolation (no shape)", () => {
      const result = parse("radial-gradient(closest-side at top in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");

      expect(result.value.size?.kind).toBe("keyword");
      expect(result.value.position).toBeDefined();
    });
  });

  /**
   * TWO COMPONENTS: All 2-component permutations
   */
  describe("two components: shape + position", () => {
    it("accepts: shape, position", () => {
      const result = parse("radial-gradient(circle at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
    });

    it("accepts: position, shape (FLEXIBLE ORDER)", () => {
      const result = parse("radial-gradient(at center circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
    });
  });

  describe("two components: shape + interpolation", () => {
    it("accepts: shape, interpolation", () => {
      const result = parse("radial-gradient(circle in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, shape (FLEXIBLE ORDER)", () => {
      const result = parse("radial-gradient(in oklch circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });
  });

  describe("two components: position + interpolation", () => {
    it("accepts: position, interpolation", () => {
      const result = parse("radial-gradient(at center in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, position (FLEXIBLE ORDER)", () => {
      const result = parse("radial-gradient(in oklch at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });
  });

  /**
   * THREE COMPONENTS: All 6 permutations (3! = 6)
   */
  describe("three components: all permutations", () => {
    it("accepts: shape, position, interpolation (1/6)", () => {
      const result = parse("radial-gradient(circle at center in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: shape, interpolation, position (2/6)", () => {
      const result = parse("radial-gradient(circle in oklch at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: position, shape, interpolation (3/6)", () => {
      const result = parse("radial-gradient(at center circle in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: position, interpolation, shape (4/6)", () => {
      const result = parse("radial-gradient(at center in oklch circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, shape, position (5/6)", () => {
      const result = parse("radial-gradient(in oklch circle at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, position, shape (6/6)", () => {
      const result = parse("radial-gradient(in oklch at center circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });
  });

  /**
   * WITH SIZE: Test ordering with explicit size
   */
  describe("with explicit size: various orderings", () => {
    it("accepts: size, shape, position", () => {
      const result = parse("radial-gradient(100px circle at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.size?.kind).toBe("circle-explicit");
      expect(result.value.shape).toBe("circle");
      expect(result.value.position).toBeDefined();
    });

    it("accepts: shape, size, interpolation", () => {
      const result = parse("radial-gradient(circle 100px in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
      expect(result.value.size?.kind).toBe("circle-explicit");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: interpolation, size, shape", () => {
      const result = parse("radial-gradient(in oklch 100px circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.size?.kind).toBe("circle-explicit");
      expect(result.value.shape).toBe("circle");
    });

    it("accepts: position, interpolation, size, shape", () => {
      const result = parse("radial-gradient(at top in oklch 100px circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.size?.kind).toBe("circle-explicit");
      expect(result.value.shape).toBe("circle");
    });
  });

  /**
   * SIZE KEYWORD: Test with size keywords
   */
  describe("with size keyword: various orderings", () => {
    it("accepts: size keyword, position", () => {
      const result = parse("radial-gradient(closest-side at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.size?.kind).toBe("keyword");
      if (result.value.size?.kind === "keyword") {
        expect(result.value.size.value).toBe("closest-side");
      }
    });

    it("accepts: position, size keyword", () => {
      const result = parse("radial-gradient(at center closest-side, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.size?.kind).toBe("keyword");
    });

    it("accepts: interpolation, size keyword, shape", () => {
      const result = parse("radial-gradient(in oklch farthest-corner circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.size?.kind).toBe("keyword");
      expect(result.value.shape).toBe("circle");
    });
  });

  /**
   * ELLIPSE: Test with ellipse and two radii
   */
  describe("ellipse with two radii: various orderings", () => {
    it("accepts: ellipse, size (two radii), position", () => {
      const result = parse("radial-gradient(ellipse 50% 30% at center, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("ellipse");
      expect(result.value.size?.kind).toBe("ellipse-explicit");
      expect(result.value.position).toBeDefined();
    });

    it("accepts: position, ellipse, size (two radii)", () => {
      const result = parse("radial-gradient(at center ellipse 50% 30%, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.position).toBeDefined();
      expect(result.value.shape).toBe("ellipse");
      expect(result.value.size?.kind).toBe("ellipse-explicit");
    });

    it("accepts: interpolation, position, ellipse, size", () => {
      const result = parse("radial-gradient(in oklch at top ellipse 50% 30%, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.shape).toBe("ellipse");
      expect(result.value.size?.kind).toBe("ellipse-explicit");
    });
  });

  /**
   * EDGE CASES: Minimal components
   */
  describe("minimal components (just color stops)", () => {
    it("accepts: no components, just color stops", () => {
      const result = parse("radial-gradient(red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.colorStops.length).toBeGreaterThanOrEqual(2);
    });

    it("accepts: only interpolation", () => {
      const result = parse("radial-gradient(in oklch, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.colorInterpolationMethod).toBeDefined();
    });

    it("accepts: only position", () => {
      const result = parse("radial-gradient(at top right, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.position).toBeDefined();
    });

    it("accepts: only shape", () => {
      const result = parse("radial-gradient(circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.shape).toBe("circle");
    });
  });

  /**
   * DUPLICATE DETECTION: Ensure components appear at most once
   */
  describe("duplicate detection", () => {
    it("rejects: duplicate shape", () => {
      const result = parse("radial-gradient(circle ellipse, red, blue)");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues.some((i) => i.code === "invalid-syntax")).toBe(true);
      }
    });

    it("rejects: duplicate position", () => {
      const result = parse("radial-gradient(at top at bottom, red, blue)");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues.some((i) => i.code === "invalid-syntax")).toBe(true);
      }
    });

    it("rejects: duplicate interpolation", () => {
      const result = parse("radial-gradient(in oklch in srgb, red, blue)");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues.some((i) => i.code === "invalid-syntax")).toBe(true);
      }
    });

    it("rejects: duplicate size", () => {
      // Note: 100px 50px is VALID (ellipse explicit size)
      // A true duplicate would be: closest-side farthest-corner
      const result = parse("radial-gradient(closest-side farthest-corner, red, blue)");
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
    it("accepts: all components in non-standard order", () => {
      const result = parse(
        "radial-gradient(in oklch at 30% 70% farthest-corner ellipse, red 0%, yellow 50%, blue 100%)",
      );
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.kind).toBe("radial");
      if (result.value.kind !== "radial") return;
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.size?.kind).toBe("keyword");
      expect(result.value.shape).toBe("ellipse");
      expect(result.value.colorStops.length).toBe(3);
    });

    it("accepts: interpolation first, complex position", () => {
      const result = parse("radial-gradient(in oklch at left 20% top 30% circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.kind).toBe("radial");
      if (result.value.kind !== "radial") return;
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.position).toBeDefined();
      expect(result.value.shape).toBe("circle");
    });

    it("accepts: position with calc(), then other components", () => {
      const result = parse("radial-gradient(at calc(50% - 10px) center in oklch circle, red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.kind).toBe("radial");
      if (result.value.kind !== "radial") return;
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.shape).toBe("circle");
    });
  });

  /**
   * REPEATING GRADIENTS: Ensure flexible ordering works with repeating
   */
  describe("repeating-radial-gradient: flexible ordering", () => {
    it("accepts: position, interpolation, shape", () => {
      const result = parse("repeating-radial-gradient(at center in oklch circle, red 0px, blue 10px)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.kind).toBe("radial");
      if (result.value.kind !== "radial") return;
      expect(result.value.repeating).toBe(true);
      expect(result.value.position).toBeDefined();
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.shape).toBe("circle");
    });

    it("accepts: interpolation, size, position", () => {
      const result = parse("repeating-radial-gradient(in oklch 100px at top, red 0px, blue 10px)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.kind !== "radial") throw new Error("Expected radial gradient");
      expect(result.value.kind).toBe("radial");
      if (result.value.kind !== "radial") return;
      expect(result.value.repeating).toBe(true);
      expect(result.value.colorInterpolationMethod).toBeDefined();
      expect(result.value.size).toBeDefined();
      expect(result.value.position).toBeDefined();
    });
  });
});
