// b_path:: packages/b_parsers/src/gradient/linear.test.ts
import { describe, it, expect } from "vitest";
import * as Linear from "./linear";
import * as Generate from "@b/generators";

describe("Linear Gradient Parser", () => {
  it("parses simple linear gradient", () => {
    const css = "linear-gradient(red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("linear");
      expect(result.value.repeating).toBe(false);
      expect(result.value.direction).toBeUndefined();
      expect(result.value.colorStops).toHaveLength(2);
    }
  });

  it("parses linear gradient with angle direction", () => {
    const css = "linear-gradient(45deg, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({
        kind: "angle",
        value: { value: 45, unit: "deg" },
      });
      expect(result.value.colorStops).toHaveLength(2);
    }
  });

  it("parses linear gradient with to-side direction", () => {
    const css = "linear-gradient(to right, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({
        kind: "to-side",
        value: "right",
      });
    }
  });

  it("parses linear gradient with to-corner direction", () => {
    const css = "linear-gradient(to top left, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({
        kind: "to-corner",
        value: "top left",
      });
    }
  });

  it("parses repeating linear gradient", () => {
    const css = "repeating-linear-gradient(red 0px, blue 20px)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.repeating).toBe(true);
      expect(result.value.colorStops[0]?.position).toEqual({ value: 0, unit: "px" });
      expect(result.value.colorStops[1]?.position).toEqual({ value: 20, unit: "px" });
    }
  });

  it("parses linear gradient with color stops at positions", () => {
    const css = "linear-gradient(red 0%, blue 50%, green 100%)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.colorStops).toHaveLength(3);
      expect(result.value.colorStops[0]?.position).toEqual({ value: 0, unit: "%" });
      expect(result.value.colorStops[1]?.position).toEqual({ value: 50, unit: "%" });
      expect(result.value.colorStops[2]?.position).toEqual({ value: 100, unit: "%" });
    }
  });

  describe("Round-trip", () => {
    it("parses and generates back to same CSS", () => {
      const css = "linear-gradient(45deg, red, blue)";
      const parseResult = Linear.parse(css);

      expect(parseResult.ok).toBe(true);
      if (parseResult.ok) {
        const genResult = Generate.Gradient.Linear.generate(parseResult.value);
        expect(genResult.ok).toBe(true);
        if (genResult.ok) {
          expect(genResult.value).toBe(css);
        }
      }
    });

    it("round-trips gradient with positions", () => {
      const css = "linear-gradient(red 0%, blue 100%)";
      const parseResult = Linear.parse(css);

      expect(parseResult.ok).toBe(true);
      if (parseResult.ok) {
        const genResult = Generate.Gradient.Linear.generate(parseResult.value);
        expect(genResult.ok).toBe(true);
        if (genResult.ok) {
          expect(genResult.value).toBe(css);
        }
      }
    });
  });
});
