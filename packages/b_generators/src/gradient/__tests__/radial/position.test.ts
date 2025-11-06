// b_path:: packages/b_generators/src/gradient/__tests__/radial/position.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Radial from "../../radial";

describe("Radial Gradient Generator - Position", () => {
  describe("Keyword Positions", () => {
    it("generates at center center", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "center" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at center center, red, blue)");
      }
    });

    it("generates at left top", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "top" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at left top, red, blue)");
      }
    });

    it("generates at right bottom", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "keyword", value: "right" },
          vertical: { kind: "keyword", value: "bottom" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at right bottom, red, blue)");
      }
    });

    it("generates at left center", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "center" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at left center, red, blue)");
      }
    });

    it("generates at center bottom", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "bottom" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at center bottom, red, blue)");
      }
    });
  });

  describe("Percentage Positions", () => {
    it("generates at 50% 50%", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 50, unit: "%" },
          vertical: { kind: "literal", value: 50, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 50% 50%, red, blue)");
      }
    });

    it("generates at 0% 0%", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 0, unit: "%" },
          vertical: { kind: "literal", value: 0, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 0% 0%, red, blue)");
      }
    });

    it("generates at 100% 100%", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 100, unit: "%" },
          vertical: { kind: "literal", value: 100, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 100% 100%, red, blue)");
      }
    });

    it("generates at 25% 75%", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 25, unit: "%" },
          vertical: { kind: "literal", value: 75, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 25% 75%, red, blue)");
      }
    });
  });

  describe("Length Positions", () => {
    it("generates at 10px 20px", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 10, unit: "px" },
          vertical: { kind: "literal", value: 20, unit: "px" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 10px 20px, red, blue)");
      }
    });

    it("generates at 5em 3em", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 5, unit: "em" },
          vertical: { kind: "literal", value: 3, unit: "em" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 5em 3em, red, blue)");
      }
    });

    it("generates at 2rem 4rem", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 2, unit: "rem" },
          vertical: { kind: "literal", value: 4, unit: "rem" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 2rem 4rem, red, blue)");
      }
    });

    it("generates at 20vw 30vh", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 20, unit: "vw" },
          vertical: { kind: "literal", value: 30, unit: "vh" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 20vw 30vh, red, blue)");
      }
    });
  });

  describe("Mixed Positions", () => {
    it("generates at left 10px", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "literal", value: 10, unit: "px" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at left 10px, red, blue)");
      }
    });

    it("generates at 50% top", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 50, unit: "%" },
          vertical: { kind: "keyword", value: "top" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 50% top, red, blue)");
      }
    });

    it("generates at center 25%", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "literal", value: 25, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at center 25%, red, blue)");
      }
    });

    it("generates at 10px bottom", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 10, unit: "px" },
          vertical: { kind: "keyword", value: "bottom" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 10px bottom, red, blue)");
      }
    });
  });

  describe("Dynamic Values in Position", () => {
    it("generates with var() in horizontal", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "variable", name: "--pos-x" },
          vertical: { kind: "keyword", value: "center" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at var(--pos-x) center, red, blue)");
      }
    });

    it("generates with var() in vertical", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "variable", name: "--pos-y" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at center var(--pos-y), red, blue)");
      }
    });

    it("generates with var() in both", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "variable", name: "--pos-x" },
          vertical: { kind: "variable", name: "--pos-y" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at var(--pos-x) var(--pos-y), red, blue)");
      }
    });

    it("generates with calc() in horizontal", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "-",
              left: { kind: "literal", value: 50, unit: "%" },
              right: { kind: "literal", value: 10, unit: "px" },
            },
          },
          vertical: { kind: "literal", value: 50, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at calc(50% - 10px) 50%, red, blue)");
      }
    });

    it("generates with calc() in vertical", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: { kind: "literal", value: 50, unit: "%" },
          vertical: {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "+",
              left: { kind: "literal", value: 25, unit: "%" },
              right: { kind: "literal", value: 5, unit: "px" },
            },
          },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at 50% calc(25% + 5px), red, blue)");
      }
    });

    it("generates with calc() in both", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        position: {
          horizontal: {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "*",
              left: { kind: "literal", value: 10, unit: "vw" },
              right: { kind: "literal", value: 2, unit: undefined },
            },
          },
          vertical: {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "/",
              left: { kind: "literal", value: 100, unit: "vh" },
              right: { kind: "literal", value: 3, unit: undefined },
            },
          },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(at calc(10vw * 2) calc(100vh / 3), red, blue)");
      }
    });
  });

  describe("Position with Shape and Size", () => {
    it("generates circle at center", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "circle",
        position: {
          horizontal: { kind: "keyword", value: "center" },
          vertical: { kind: "keyword", value: "center" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(circle at center center, red, blue)");
      }
    });

    it("generates ellipse farthest-side at 30% 40%", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        shape: "ellipse",
        size: { kind: "keyword", value: "farthest-side" },
        position: {
          horizontal: { kind: "literal", value: 30, unit: "%" },
          vertical: { kind: "literal", value: 40, unit: "%" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(ellipse farthest-side at 30% 40%, red, blue)");
      }
    });

    it("generates 50px at left top", () => {
      const ir: Type.RadialGradient = {
        kind: "radial",
        size: { kind: "circle-explicit", radius: { kind: "literal", value: 50, unit: "px" } },
        position: {
          horizontal: { kind: "keyword", value: "left" },
          vertical: { kind: "keyword", value: "top" },
        },
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      };

      const result = Radial.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("radial-gradient(50px at left top, red, blue)");
      }
    });
  });
});
