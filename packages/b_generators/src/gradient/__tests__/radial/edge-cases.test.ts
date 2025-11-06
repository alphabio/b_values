// b_path:: packages/b_generators/src/gradient/__tests__/radial/edge-cases.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Radial from "../../radial";

describe("Radial Gradient Generator - Edge Cases", () => {
  it("generates with 100+ color stops", () => {
    const colors = Array.from(
      { length: 100 },
      (_, i): Type.ColorStop => ({
        color: { kind: "named", name: i % 2 === 0 ? "red" : "blue" },
      }),
    );

    const ir: Type.RadialGradient = {
      kind: "radial",
      colorStops: colors,
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("radial-gradient(");
      expect(result.value.split(",")).toHaveLength(100);
    }
  });

  it("generates with floating point precision in radius", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: { kind: "circle-explicit", radius: { kind: "literal", value: 45.123456789, unit: "px" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(45.123456789px, red, blue)");
    }
  });

  it("generates with floating point precision in position", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0.123, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 99.876, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(red 0.123%, blue 99.876%)");
    }
  });

  it("generates with very large radius value", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: { kind: "circle-explicit", radius: { kind: "literal", value: 999999, unit: "px" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(999999px, red, blue)");
    }
  });

  it("generates with zero radius value", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: { kind: "circle-explicit", radius: { kind: "literal", value: 0, unit: "px" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(0px, red, blue)");
    }
  });

  it("generates repeating gradient with single pixel width", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "px" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 1, unit: "px" } },
      ],
      repeating: true,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("repeating-radial-gradient(red 0px, blue 1px)");
    }
  });

  it("generates with em units in positions", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "em" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 10, unit: "em" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(red 0em, blue 10em)");
    }
  });

  it("generates with rem units in positions", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "rem" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 5, unit: "rem" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(red 0rem, blue 5rem)");
    }
  });

  it("generates with vw units in positions", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "vw" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 50, unit: "vw" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(red 0vw, blue 50vw)");
    }
  });

  it("generates with mixed dynamic and static values", () => {
    const ir: Type.RadialGradient = {
      kind: "radial",
      size: { kind: "circle-explicit", radius: { kind: "variable", name: "--radius" } },
      position: {
        horizontal: { kind: "variable", name: "--pos-x" },
        vertical: { kind: "literal", value: 50, unit: "%" },
      },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Radial.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("radial-gradient(var(--radius) at var(--pos-x) 50%, red 0%, blue 100%)");
    }
  });
});
