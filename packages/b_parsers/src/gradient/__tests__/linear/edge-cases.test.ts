// b_path:: packages/b_parsers/src/gradient/__tests__/linear/edge-cases.test.ts
import { describe, it, expect } from "vitest";
import * as Linear from "../../linear";

describe("Linear Gradient Parser - Edge Cases", () => {
  it("parses 100+ color stops", () => {
    const colors = Array.from({ length: 101 }, (_, i) => `rgb(${i}, ${i}, ${i})`).join(", ");
    const css = `linear-gradient(${colors})`;
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.colorStops.length).toBeGreaterThanOrEqual(100);
    }
  });

  it("parses high precision decimals", () => {
    const css = "linear-gradient(45.123456789deg, red 12.3456789%, blue 87.6543211%)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toBeDefined();
    }
  });

  it("parses negative angle", () => {
    const css = "linear-gradient(-90deg, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({ kind: "angle", value: { kind: "literal", value: -90, unit: "deg" } });
    }
  });

  it("parses 0deg angle", () => {
    const css = "linear-gradient(0deg, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({ kind: "angle", value: { kind: "literal", value: 0, unit: "deg" } });
    }
  });

  it("parses 360deg angle", () => {
    const css = "linear-gradient(360deg, red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction).toEqual({ kind: "angle", value: { kind: "literal", value: 360, unit: "deg" } });
    }
  });

  it("parses whitespace variations", () => {
    const css = "linear-gradient(  45deg   in   srgb  ,  red   0%  ,  blue   100%  )";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.colorStops).toHaveLength(2);
    }
  });

  it("parses minimal gradient", () => {
    const css = "linear-gradient(red,blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.colorStops).toHaveLength(2);
    }
  });

  it("parses gradient with uppercase function name", () => {
    const css = "LINEAR-GRADIENT(red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.colorStops).toHaveLength(2);
    }
  });

  it("parses nested calc expressions", () => {
    const css = "linear-gradient(calc(calc(45deg + 5deg) + 10deg), red, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.direction?.kind).toBe("angle");
    }
  });

  it("parses double position with different units", () => {
    const css = "linear-gradient(red 10% 50px, blue)";
    const result = Linear.parse(css);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.value.colorStops[0].position)).toBe(true);
      if (Array.isArray(result.value.colorStops[0].position)) {
        const pos0 = result.value.colorStops[0].position[0];
        const pos1 = result.value.colorStops[0].position[1];
        expect(pos0.kind).toBe("literal");
        expect(pos1.kind).toBe("literal");
        if (pos0.kind === "literal" && pos1.kind === "literal") {
          expect(pos0.unit).toBe("%");
          expect(pos1.unit).toBe("px");
        }
      }
    }
  });
});
