// b_path:: packages/b_parsers/src/gradient/__tests__/linear/color-stops.test.ts
import { describe, it, expect } from "vitest";
import * as Linear from "../../linear";

describe("Linear Gradient Parser - Color Stops", () => {
  describe("Basic Structures", () => {
    it("parses 2 stops without positions", () => {
      const css = "linear-gradient(red, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0]).toEqual({ color: { kind: "named", name: "red" } });
        expect(result.value.colorStops[1]).toEqual({ color: { kind: "named", name: "blue" } });
      }
    });

    it("parses 3 stops without positions", () => {
      const css = "linear-gradient(red, yellow, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(3);
      }
    });

    it("parses 5 stops without positions", () => {
      const css = "linear-gradient(red, orange, yellow, green, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(5);
      }
    });
  });

  describe("Position Variations", () => {
    it("parses with percentage positions", () => {
      const css = "linear-gradient(red 0%, blue 100%)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toEqual({ kind: "literal", value: 0, unit: "%" });
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 100, unit: "%" });
      }
    });

    it("parses with pixel positions", () => {
      const css = "linear-gradient(red 0px, blue 200px)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toEqual({ kind: "literal", value: 0, unit: "px" });
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 200, unit: "px" });
      }
    });

    it("parses with em positions", () => {
      const css = "linear-gradient(red 0em, blue 10em)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toEqual({ kind: "literal", value: 0, unit: "em" });
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 10, unit: "em" });
      }
    });

    it("parses mixed positioned and non-positioned stops", () => {
      const css = "linear-gradient(red, yellow 50%, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toBeUndefined();
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 50, unit: "%" });
        expect(result.value.colorStops[2].position).toBeUndefined();
      }
    });
  });

  describe("Double Position Stops", () => {
    it("parses double position stop", () => {
      const css = "linear-gradient(red 20% 40%, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value.colorStops[0].position)).toBe(true);
        if (Array.isArray(result.value.colorStops[0].position)) {
          expect(result.value.colorStops[0].position[0]).toEqual({ kind: "literal", value: 20, unit: "%" });
          expect(result.value.colorStops[0].position[1]).toEqual({ kind: "literal", value: 40, unit: "%" });
        }
      }
    });

    it("parses multiple double position stops", () => {
      const css = "linear-gradient(red 10% 30%, yellow 40% 60%, blue 70% 90%)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(3);
        expect(Array.isArray(result.value.colorStops[0].position)).toBe(true);
        expect(Array.isArray(result.value.colorStops[1].position)).toBe(true);
        expect(Array.isArray(result.value.colorStops[2].position)).toBe(true);
      }
    });
  });

  describe("Color Types", () => {
    it("parses named colors", () => {
      const css = "linear-gradient(red, blue, green)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[2])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops[0].color).toEqual({ kind: "named", name: "red" });
        expect(result.value.colorStops[1].color).toEqual({ kind: "named", name: "blue" });
        expect(result.value.colorStops[2].color).toEqual({ kind: "named", name: "green" });
      }
    });

    it("parses hex colors", () => {
      const css = "linear-gradient(#ff0000, #0000ff)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops[0].color.kind).toBe("hex");
        expect(result.value.colorStops[1].color.kind).toBe("hex");
      }
    });

    it("parses rgb colors", () => {
      const css = "linear-gradient(rgb(255, 0, 0), rgb(0, 0, 255))";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color.kind).toBe("rgb");
        expect(result.value.colorStops[1].color.kind).toBe("rgb");
      }
    });

    it("parses rgba colors", () => {
      const css = "linear-gradient(rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 1))";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color.kind).toBe("rgb");
        expect(result.value.colorStops[1].color.kind).toBe("rgb");
      }
    });

    it("parses hsl colors", () => {
      const css = "linear-gradient(hsl(0, 100%, 50%), hsl(240, 100%, 50%))";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color.kind).toBe("hsl");
        expect(result.value.colorStops[1].color.kind).toBe("hsl");
      }
    });

    it("parses hsla colors", () => {
      const css = "linear-gradient(hsla(0, 100%, 50%, 0.5), hsla(240, 100%, 50%, 1))";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color.kind).toBe("hsl");
        expect(result.value.colorStops[1].color.kind).toBe("hsl");
      }
    });

    it("parses var() in color", () => {
      const css = "linear-gradient(var(--color-1), var(--color-2))";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color).toEqual({ kind: "variable", name: "--color-1" });
        expect(result.value.colorStops[1].color).toEqual({ kind: "variable", name: "--color-2" });
      }
    });

    it("parses mixed color types", () => {
      const css = "linear-gradient(red, #00ff00, hsl(60, 100%, 50%))";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[2])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops).toHaveLength(3);
        expect(result.value.colorStops[0].color.kind).toBe("named");
        expect(result.value.colorStops[1].color.kind).toBe("hex");
        expect(result.value.colorStops[2].color.kind).toBe("hsl");
      }
    });

    it("parses rgb/hsl with positions", () => {
      const css = "linear-gradient(rgb(255, 0, 0) 0%, hsl(240, 100%, 50%) 100%)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (!("color" in result.value.colorStops[0])) throw new Error("Expected color stop, got hint");
        if (!("color" in result.value.colorStops[1])) throw new Error("Expected color stop, got hint");
        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color.kind).toBe("rgb");
        expect(result.value.colorStops[0].position).toEqual({ kind: "literal", value: 0, unit: "%" });
        expect(result.value.colorStops[1].color.kind).toBe("hsl");
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 100, unit: "%" });
      }
    });
  });

  describe("Dynamic Values", () => {
    it("parses var() in position", () => {
      const css = "linear-gradient(red var(--pos-1), blue var(--pos-2))";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toEqual({ kind: "variable", name: "--pos-1" });
        expect(result.value.colorStops[1].position).toEqual({ kind: "variable", name: "--pos-2" });
      }
    });

    it("parses calc() in position", () => {
      const css = "linear-gradient(red calc(25% + 10px), blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const stop = result.value.colorStops[0];
        if (stop && "color" in stop) {
          const pos = stop.position;
          if (pos && !Array.isArray(pos)) {
            expect(pos.kind).toBe("calc");
          }
        }
      }
    });
  });

  describe("Color Hints", () => {
    it("parses single color hint between stops", () => {
      const css = "linear-gradient(red, 30%, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(3);

        // First stop: red
        const stop1 = result.value.colorStops[0];
        expect(stop1).toHaveProperty("color");
        if ("color" in stop1) {
          expect(stop1.color.kind).toBe("named");
        }

        // Second item: 30% hint
        const hint = result.value.colorStops[1];
        expect(hint).toHaveProperty("kind", "hint");
        if ("kind" in hint && hint.kind === "hint") {
          expect(hint.position).toEqual({ kind: "literal", value: 30, unit: "%" });
        }

        // Third stop: blue
        const stop2 = result.value.colorStops[2];
        expect(stop2).toHaveProperty("color");
        if ("color" in stop2) {
          expect(stop2.color.kind).toBe("named");
        }
      }
    });

    it("parses multiple color hints", () => {
      const css = "linear-gradient(red, 25%, yellow, 75%, blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(5);

        // Verify structure: color, hint, color, hint, color
        expect(result.value.colorStops[0]).toHaveProperty("color");
        expect(result.value.colorStops[1]).toHaveProperty("kind", "hint");
        expect(result.value.colorStops[2]).toHaveProperty("color");
        expect(result.value.colorStops[3]).toHaveProperty("kind", "hint");
        expect(result.value.colorStops[4]).toHaveProperty("color");
      }
    });

    it("parses color hint with positioned stops", () => {
      const css = "linear-gradient(red 10%, 30%, yellow 50%, blue 90%)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(4);

        // red 10%
        const stop1 = result.value.colorStops[0];
        if ("color" in stop1) {
          expect(stop1.position).toEqual({ kind: "literal", value: 10, unit: "%" });
        }

        // 30% hint
        const hint = result.value.colorStops[1];
        expect(hint).toHaveProperty("kind", "hint");

        // yellow 50%
        const stop2 = result.value.colorStops[2];
        if ("color" in stop2) {
          expect(stop2.position).toEqual({ kind: "literal", value: 50, unit: "%" });
        }

        // blue 90%
        const stop3 = result.value.colorStops[3];
        if ("color" in stop3) {
          expect(stop3.position).toEqual({ kind: "literal", value: 90, unit: "%" });
        }
      }
    });

    it("parses color hint with calc()", () => {
      const css = "linear-gradient(red, calc(25% + 10px), blue)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(3);

        const hint = result.value.colorStops[1];
        expect(hint).toHaveProperty("kind", "hint");
        if ("kind" in hint && hint.kind === "hint") {
          expect(hint.position.kind).toBe("calc");
        }
      }
    });

    it("parses complex example with direction, hints, and positioned stops", () => {
      const css = "linear-gradient(to top left, red 10%, 30%, yellow, blue 90%)";
      const result = Linear.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.direction).toEqual({ kind: "to-corner", value: "top left" });
        expect(result.value.colorStops).toHaveLength(4);

        // Verify mix of stops and hint
        expect(result.value.colorStops[0]).toHaveProperty("color");
        expect(result.value.colorStops[1]).toHaveProperty("kind", "hint");
        expect(result.value.colorStops[2]).toHaveProperty("color");
        expect(result.value.colorStops[3]).toHaveProperty("color");
      }
    });
  });
});
