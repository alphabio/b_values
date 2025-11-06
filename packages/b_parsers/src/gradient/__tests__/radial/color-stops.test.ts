// b_path:: packages/b_parsers/src/gradient/__tests__/radial/color-stops.test.ts
import { describe, it, expect } from "vitest";
import * as Radial from "../../radial";

describe("Radial Gradient Parser - Color Stops", () => {
  describe("Basic Structures", () => {
    it("parses 2 stops without positions", () => {
      const css = "radial-gradient(red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0]).toEqual({ color: { kind: "named", name: "red" } });
        expect(result.value.colorStops[1]).toEqual({ color: { kind: "named", name: "blue" } });
      }
    });

    it("parses 3 stops without positions", () => {
      const css = "radial-gradient(red, yellow, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(3);
      }
    });

    it("parses 5 stops without positions", () => {
      const css = "radial-gradient(red, orange, yellow, green, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(5);
      }
    });
  });

  describe("Position Variations", () => {
    it("parses with percentage positions", () => {
      const css = "radial-gradient(red 0%, blue 100%)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toEqual({ kind: "literal", value: 0, unit: "%" });
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 100, unit: "%" });
      }
    });

    it("parses with pixel positions", () => {
      const css = "radial-gradient(red 0px, blue 200px)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toEqual({ kind: "literal", value: 0, unit: "px" });
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 200, unit: "px" });
      }
    });

    it("parses with em positions", () => {
      const css = "radial-gradient(red 0em, blue 10em)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toEqual({ kind: "literal", value: 0, unit: "em" });
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 10, unit: "em" });
      }
    });

    it("parses mixed positioned and non-positioned stops", () => {
      const css = "radial-gradient(red, yellow 50%, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toBeUndefined();
        expect(result.value.colorStops[1].position).toEqual({ kind: "literal", value: 50, unit: "%" });
        expect(result.value.colorStops[2].position).toBeUndefined();
      }
    });
  });

  describe("Double Position Stops", () => {
    it("parses double position (20% 40%)", () => {
      const css = "radial-gradient(red, blue 20% 40%, green)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const pos = result.value.colorStops[1].position;
        if (pos && Array.isArray(pos)) {
          expect(pos[0]).toEqual({ kind: "literal", value: 20, unit: "%" });
          expect(pos[1]).toEqual({ kind: "literal", value: 40, unit: "%" });
        }
      }
    });

    it("parses double position with pixels", () => {
      const css = "radial-gradient(red, blue 10px 30px, green)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const pos = result.value.colorStops[1].position;
        if (pos && Array.isArray(pos)) {
          expect(pos[0]).toEqual({ kind: "literal", value: 10, unit: "px" });
          expect(pos[1]).toEqual({ kind: "literal", value: 30, unit: "px" });
        }
      }
    });
  });

  describe("Color Formats", () => {
    it("parses hex colors", () => {
      const css = "radial-gradient(#ff0000, #0000ff)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);

      if (result.ok) {
        if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");
        if (result.value.colorStops[1]?.kind === "hint") throw new Error("Expected color stop, got hint");
        if (result.value.colorStops[2]?.kind === "hint") throw new Error("Expected color stop, got hint");

        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color.kind).toBe("hex");
        expect(result.value.colorStops[1].color.kind).toBe("hex");
      }
    });

    it("parses rgb colors", () => {
      const css = "radial-gradient(rgb(255, 0, 0), rgb(0, 0, 255))";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");
        if (result.value.colorStops[1]?.kind === "hint") throw new Error("Expected color stop, got hint");

        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color.kind).toBe("rgb");
        expect(result.value.colorStops[1].color.kind).toBe("rgb");
      }
    });

    it("parses hsl colors", () => {
      const css = "radial-gradient(hsl(0, 100%, 50%), hsl(240, 100%, 50%))";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");
        if (result.value.colorStops[1]?.kind === "hint") throw new Error("Expected color stop, got hint");

        expect(result.value.colorStops).toHaveLength(2);
        expect(result.value.colorStops[0].color.kind).toBe("hsl");
        expect(result.value.colorStops[1].color.kind).toBe("hsl");
      }
    });
  });

  describe("Dynamic Values in Color Stops", () => {
    it("parses var() in color", () => {
      const css = "radial-gradient(var(--color1), var(--color2))";
      const result = Radial.parse(css);

      if (!result.ok) {
        console.log("VAR Color Error:", JSON.stringify(result.issues, null, 2));
      }

      expect(result.ok).toBe(true);
      if (result.ok) {
        if (result.value.colorStops[0]?.kind === "hint") throw new Error("Expected color stop, got hint");
        if (result.value.colorStops[1]?.kind === "hint") throw new Error("Expected color stop, got hint");

        expect(result.value.colorStops[0].color).toEqual({
          kind: "variable",
          name: "--color1",
        });
        expect(result.value.colorStops[1].color).toEqual({
          kind: "variable",
          name: "--color2",
        });
      }
    });

    it("parses var() in position", () => {
      const css = "radial-gradient(red var(--pos1), blue var(--pos2))";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops[0].position).toEqual({
          kind: "variable",
          name: "--pos1",
        });
        expect(result.value.colorStops[1].position).toEqual({
          kind: "variable",
          name: "--pos2",
        });
      }
    });

    it("parses calc() in position", () => {
      const css = "radial-gradient(red calc(25% + 10px), blue calc(75% - 10px))";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const pos1 = result.value.colorStops[0].position;
        const pos2 = result.value.colorStops[1].position;
        if (pos1 && !Array.isArray(pos1)) {
          expect(pos1.kind).toBe("calc");
        }
        if (pos2 && !Array.isArray(pos2)) {
          expect(pos2.kind).toBe("calc");
        }
      }
    });
  });

  describe("Many Color Stops", () => {
    it("parses 10 color stops", () => {
      const css = "radial-gradient(red, orange, yellow, green, blue, indigo, violet, pink, cyan, magenta)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(10);
      }
    });

    it("parses 20 color stops with positions", () => {
      const stops = Array.from({ length: 20 }, (_, i) => `red ${i * 5}%`).join(", ");
      const css = `radial-gradient(${stops})`;
      const result = Radial.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.colorStops).toHaveLength(20);
      }
    });
  });
});
