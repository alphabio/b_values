// b_path:: packages/b_generators/src/gradient/__tests__/radial/shape-size.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Radial from "../../radial";

describe("Radial Gradient Generator - Shape & Size", () => {
  describe("Shape Only", () => {
    it("generates with circle shape", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "circle",
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(circle, red, blue)");
      }
    });

    it("generates with ellipse shape", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "ellipse",
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(ellipse, red, blue)");
      }
    });
  });

  describe("Size Keywords Only", () => {
    it("generates closest-side", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "keyword", value: "closest-side" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(closest-side, red, blue)");
      }
    });

    it("generates farthest-side", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "keyword", value: "farthest-side" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(farthest-side, red, blue)");
      }
    });

    it("generates closest-corner", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "keyword", value: "closest-corner" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(closest-corner, red, blue)");
      }
    });

    it("generates farthest-corner", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "keyword", value: "farthest-corner" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(farthest-corner, red, blue)");
      }
    });
  });

  describe("Shape + Size Keyword", () => {
    it("generates circle closest-side", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "circle",
        size: { kind: "keyword", value: "closest-side" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(circle closest-side, red, blue)");
      }
    });

    it("generates circle farthest-side", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "circle",
        size: { kind: "keyword", value: "farthest-side" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(circle farthest-side, red, blue)");
      }
    });

    it("generates circle closest-corner", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "circle",
        size: { kind: "keyword", value: "closest-corner" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(circle closest-corner, red, blue)");
      }
    });

    it("generates circle farthest-corner", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "circle",
        size: { kind: "keyword", value: "farthest-corner" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(circle farthest-corner, red, blue)");
      }
    });

    it("generates ellipse closest-side", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "ellipse",
        size: { kind: "keyword", value: "closest-side" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(ellipse closest-side, red, blue)");
      }
    });

    it("generates ellipse farthest-side", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "ellipse",
        size: { kind: "keyword", value: "farthest-side" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(ellipse farthest-side, red, blue)");
      }
    });

    it("generates ellipse closest-corner", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "ellipse",
        size: { kind: "keyword", value: "closest-corner" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(ellipse closest-corner, red, blue)");
      }
    });

    it("generates ellipse farthest-corner", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "ellipse",
        size: { kind: "keyword", value: "farthest-corner" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(ellipse farthest-corner, red, blue)");
      }
    });
  });

  describe("Circle Explicit Size", () => {
    it("generates circle with px radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 50, unit: "px" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(50px, red, blue)");
      }
    });

    it("generates circle with em radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 5, unit: "em" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(5em, red, blue)");
      }
    });

    it("generates circle with rem radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 3, unit: "rem" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(3rem, red, blue)");
      }
    });

    it("generates circle with % radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 50, unit: "%" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(50%, red, blue)");
      }
    });

    it("generates circle with vw radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 25, unit: "vw" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(25vw, red, blue)");
      }
    });

    it("generates circle with vh radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 30, unit: "vh" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(30vh, red, blue)");
      }
    });

    it("generates circle with cm radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 2, unit: "cm" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(2cm, red, blue)");
      }
    });

    it("generates circle with decimal radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 12.5, unit: "px" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(12.5px, red, blue)");
      }
    });
  });

  describe("Ellipse Explicit Size", () => {
    it("generates ellipse with px radii", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 50, unit: "px" },
          radiusY: { kind: "literal", value: 100, unit: "px" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(50px 100px, red, blue)");
      }
    });

    it("generates ellipse with % radii", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 25, unit: "%" },
          radiusY: { kind: "literal", value: 50, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(25% 50%, red, blue)");
      }
    });

    it("generates ellipse with em radii", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 3, unit: "em" },
          radiusY: { kind: "literal", value: 5, unit: "em" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(3em 5em, red, blue)");
      }
    });

    it("generates ellipse with mixed units", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 50, unit: "px" },
          radiusY: { kind: "literal", value: 25, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(50px 25%, red, blue)");
      }
    });

    it("generates ellipse with vw/vh radii", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 20, unit: "vw" },
          radiusY: { kind: "literal", value: 30, unit: "vh" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(20vw 30vh, red, blue)");
      }
    });

    it("generates ellipse with decimal radii", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 12.5, unit: "px" },
          radiusY: { kind: "literal", value: 25.75, unit: "px" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(12.5px 25.75px, red, blue)");
      }
    });
  });

  describe("Dynamic Values in Size", () => {
    it("generates circle with var() radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "variable", name: "--radius" } },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(var(--radius), red, blue)");
      }
    });

    it("generates circle with calc() radius", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "circle-explicit",
          radius: {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "+",
              left: { kind: "literal", value: 50, unit: "px" },
              right: { kind: "literal", value: 10, unit: "px" },
            },
          },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(calc(50px + 10px), red, blue)");
      }
    });

    it("generates ellipse with var() in radiusX", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "variable", name: "--radius-x" },
          radiusY: { kind: "literal", value: 100, unit: "px" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(var(--radius-x) 100px, red, blue)");
      }
    });

    it("generates ellipse with var() in radiusY", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "literal", value: 50, unit: "px" },
          radiusY: { kind: "variable", name: "--radius-y" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(50px var(--radius-y), red, blue)");
      }
    });

    it("generates ellipse with var() in both radii", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: { kind: "variable", name: "--radius-x" },
          radiusY: { kind: "variable", name: "--radius-y" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(var(--radius-x) var(--radius-y), red, blue)");
      }
    });

    it("generates ellipse with calc() in both radii", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: {
          kind: "ellipse-explicit",
          radiusX: {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "*",
              left: { kind: "literal", value: 50, unit: "px" },
              right: { kind: "literal", value: 2, unit: undefined },
            },
          },
          radiusY: {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "+",
              left: { kind: "literal", value: 100, unit: "px" },
              right: { kind: "literal", value: 20, unit: "px" },
            },
          },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(calc(50px * 2) calc(100px + 20px), red, blue)");
      }
    });
  });
});
