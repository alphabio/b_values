// b_path:: packages/b_generators/src/gradient/__tests__/linear/direction.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Linear from "../../linear";

describe("Linear Gradient Generator - Direction", () => {
  describe("Angle Units", () => {
    it("generates with degrees", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 45, unit: "deg" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(45deg, red, blue)");
      }
    });

    it("generates with 0deg", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 0, unit: "deg" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(0deg, red, blue)");
      }
    });

    it("generates with 180deg", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 180, unit: "deg" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(180deg, red, blue)");
      }
    });

    it("generates with 360deg", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 360, unit: "deg" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(360deg, red, blue)");
      }
    });

    it("generates with turns", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 0.25, unit: "turn" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(0.25turn, red, blue)");
      }
    });

    it("generates with 0.5turn", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 0.5, unit: "turn" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(0.5turn, red, blue)");
      }
    });

    it("generates with 1turn", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 1, unit: "turn" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(1turn, red, blue)");
      }
    });

    it("generates with grads", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 100, unit: "grad" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(100grad, red, blue)");
      }
    });

    it("generates with 200grad", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 200, unit: "grad" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(200grad, red, blue)");
      }
    });

    it("generates with radians", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 1.57, unit: "rad" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(1.57rad, red, blue)");
      }
    });

    it("generates with 3.14rad", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: 3.14, unit: "rad" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(3.14rad, red, blue)");
      }
    });

    it("generates with negative angle", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "literal", value: -45, unit: "deg" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(-45deg, red, blue)");
      }
    });
  });

  describe("To-Side Keywords", () => {
    it("generates 'to top'", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: { kind: "to-side", value: "top" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(to top, red, blue)");
      }
    });

    it("generates 'to right'", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: { kind: "to-side", value: "right" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(to right, red, blue)");
      }
    });

    it("generates 'to bottom'", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: { kind: "to-side", value: "bottom" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(to bottom, red, blue)");
      }
    });

    it("generates 'to left'", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: { kind: "to-side", value: "left" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(to left, red, blue)");
      }
    });
  });

  describe("To-Corner Keywords", () => {
    it("generates 'to top left'", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: { kind: "to-corner", value: "top left" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(to top left, red, blue)");
      }
    });

    it("generates 'to top right'", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: { kind: "to-corner", value: "top right" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(to top right, red, blue)");
      }
    });

    it("generates 'to bottom left'", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: { kind: "to-corner", value: "bottom left" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(to bottom left, red, blue)");
      }
    });

    it("generates 'to bottom right'", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: { kind: "to-corner", value: "bottom right" },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(to bottom right, red, blue)");
      }
    });
  });

  describe("No Direction (Default)", () => {
    it("generates gradient without direction", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red, blue)");
      }
    });
  });

  describe("Dynamic Values", () => {
    it("generates with var() in direction", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: { kind: "variable", name: "--angle" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(var(--angle), red, blue)");
      }
    });

    it("generates with calc() in direction", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "+",
              left: { kind: "literal", value: 45, unit: "deg" },
              right: { kind: "literal", value: 10, unit: "deg" },
            },
          },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(calc(45deg + 10deg), red, blue)");
      }
    });

    it("generates with min() in direction", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: {
            kind: "min",
            values: [
              { kind: "literal", value: 45, unit: "deg" },
              { kind: "variable", name: "--max" },
            ],
          },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(min(45deg, var(--max)), red, blue)");
      }
    });

    it("generates with max() in direction", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: {
            kind: "max",
            values: [
              { kind: "literal", value: 0, unit: "deg" },
              { kind: "variable", name: "--min" },
            ],
          },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(max(0deg, var(--min)), red, blue)");
      }
    });

    it("generates with clamp() in direction", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        direction: {
          kind: "angle",
          value: {
            kind: "clamp",
            min: { kind: "literal", value: 0, unit: "deg" },
            preferred: { kind: "literal", value: 45, unit: "deg" },
            max: { kind: "literal", value: 90, unit: "deg" },
          },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(clamp(0deg, 45deg, 90deg), red, blue)");
      }
    });
  });
});
