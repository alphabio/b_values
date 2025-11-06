// b_path:: packages/b_generators/src/gradient/__tests__/linear/color-stops.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Linear from "../../linear";

describe("Linear Gradient Generator - Color Stops", () => {
  describe("Basic Structures", () => {
    it("generates 2 stops without positions", () => {
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

    it("generates 3 stops without positions", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" } },
          { color: { kind: "named", name: "yellow" } },
          { color: { kind: "named", name: "blue" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red, yellow, blue)");
      }
    });

    it("generates 5 stops without positions", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" } },
          { color: { kind: "named", name: "orange" } },
          { color: { kind: "named", name: "yellow" } },
          { color: { kind: "named", name: "green" } },
          { color: { kind: "named", name: "blue" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red, orange, yellow, green, blue)");
      }
    });

    it("generates 10 stops (stress test)", () => {
      const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "pink", "brown", "black"];
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: colors.map((name) => ({ color: { kind: "named", name } as Type.NamedColor })),
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(`linear-gradient(${colors.join(", ")})`);
      }
    });
  });

  describe("Position Variations", () => {
    it("generates with percentage positions", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
          { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 100, unit: "%" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red 0%, blue 100%)");
      }
    });

    it("generates with length positions", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "px" } },
          { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 100, unit: "px" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red 0px, blue 100px)");
      }
    });

    it("generates with mixed units", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 10, unit: "px" } },
          { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 50, unit: "%" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red 10px, blue 50%)");
      }
    });

    it("generates with double positions (color bands)", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          {
            color: { kind: "named", name: "red" },
            position: [
              { kind: "literal", value: 20, unit: "%" },
              { kind: "literal", value: 40, unit: "%" },
            ],
          },
          { color: { kind: "named", name: "blue" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red 20% 40%, blue)");
      }
    });

    it("generates with all double positions", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          {
            color: { kind: "named", name: "red" },
            position: [
              { kind: "literal", value: 0, unit: "%" },
              { kind: "literal", value: 25, unit: "%" },
            ],
          },
          {
            color: { kind: "named", name: "blue" },
            position: [
              { kind: "literal", value: 25, unit: "%" },
              { kind: "literal", value: 75, unit: "%" },
            ],
          },
          {
            color: { kind: "named", name: "green" },
            position: [
              { kind: "literal", value: 75, unit: "%" },
              { kind: "literal", value: 100, unit: "%" },
            ],
          },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red 0% 25%, blue 25% 75%, green 75% 100%)");
      }
    });

    it("generates with mixed positions (some with, some without)", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" } },
          { color: { kind: "named", name: "yellow" }, position: { kind: "literal", value: 30, unit: "%" } },
          { color: { kind: "named", name: "green" } },
          { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 90, unit: "%" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red, yellow 30%, green, blue 90%)");
      }
    });

    it("generates with negative positions", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" }, position: { kind: "literal", value: -10, unit: "%" } },
          { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 100, unit: "%" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red -10%, blue 100%)");
      }
    });

    it("generates with positions over 100%", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
          { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 150, unit: "%" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red 0%, blue 150%)");
      }
    });
  });

  describe("Color Type Coverage", () => {
    it("generates with named colors", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "transparent" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red, transparent)");
      }
    });

    it("generates with hex colors", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [{ color: { kind: "hex", value: "#ff0000" } }, { color: { kind: "hex", value: "#0000ff" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(#ff0000, #0000ff)");
      }
    });

    it("generates with short hex colors", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [{ color: { kind: "hex", value: "#f00" } }, { color: { kind: "hex", value: "#00f" } }],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(#f00, #00f)");
      }
    });

    it("generates with currentColor", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "special", keyword: "currentcolor" } },
          { color: { kind: "named", name: "blue" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(currentcolor, blue)");
      }
    });
  });

  describe("Dynamic Values in Stops", () => {
    it("generates with var() in color", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "variable", name: "--color-1" } },
          { color: { kind: "variable", name: "--color-2" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(var(--color-1), var(--color-2))");
      }
    });

    it("generates with var() in position", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "named", name: "red" }, position: { kind: "variable", name: "--position" } },
          { color: { kind: "named", name: "blue" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red var(--position), blue)");
      }
    });

    it("generates with calc() in position", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          {
            color: { kind: "named", name: "red" },
            position: {
              kind: "calc",
              value: {
                kind: "calc-operation",
                operator: "-",
                left: { kind: "literal", value: 50, unit: "%" },
                right: { kind: "literal", value: 10, unit: "px" },
              },
            },
          },
          { color: { kind: "named", name: "blue" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red calc(50% - 10px), blue)");
      }
    });

    it("generates with all dynamic values", () => {
      const ir: Type.LinearGradient = {
        kind: "linear",
        colorStops: [
          { color: { kind: "variable", name: "--c1" }, position: { kind: "variable", name: "--p1" } },
          { color: { kind: "variable", name: "--c2" }, position: { kind: "variable", name: "--p2" } },
        ],
        repeating: false,
      };

      const result = Linear.generate(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(var(--c1) var(--p1), var(--c2) var(--p2))");
      }
    });
  });
});
