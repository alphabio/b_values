// b_path:: packages/b_generators/src/gradient/__tests__/linear/edge-cases.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Linear from "../../linear";

describe("Linear Gradient Generator - Edge Cases", () => {
  it("generates with 100+ color stops", () => {
    const colors = Array.from(
      { length: 100 },
      (_, i): Type.ColorStop => ({
        color: { kind: "named", name: i % 2 === 0 ? "red" : "blue" },
      }),
    );

    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: colors,
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("linear-gradient(");
      expect(result.value.split(",")).toHaveLength(100);
    }
  });

  it("generates with floating point precision in angle", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: {
        kind: "angle",
        value: { kind: "literal", value: 45.123456789, unit: "deg" },
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(45.123456789deg, red, blue)");
    }
  });

  it("generates with floating point precision in position", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0.123, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 99.876, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(red 0.123%, blue 99.876%)");
    }
  });

  it("generates with very large angle value", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: {
        kind: "angle",
        value: { kind: "literal", value: 999999, unit: "deg" },
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(999999deg, red, blue)");
    }
  });

  it("generates with zero as unitless number", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: {
        kind: "angle",
        value: { kind: "literal", value: 0 },
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(0, red, blue)");
    }
  });

  it("generates repeating gradient with single pixel width", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "px" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 1, unit: "px" } },
      ],
      repeating: true,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("repeating-linear-gradient(red 0px, blue 1px)");
    }
  });

  it("generates with em units in positions", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "em" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 10, unit: "em" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(red 0em, blue 10em)");
    }
  });

  it("generates with rem units in positions", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "rem" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 5, unit: "rem" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(red 0rem, blue 5rem)");
    }
  });

  it("generates with vw units in positions", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "vw" } },
        { color: { kind: "named", name: "blue" }, position: { kind: "literal", value: 50, unit: "vw" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(red 0vw, blue 50vw)");
    }
  });

  it("generates with mixed dynamic and static values", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: { kind: "angle", value: { kind: "variable", name: "--angle" } },
      colorInterpolationMethod: { colorSpace: "oklch" },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { kind: "literal", value: 0, unit: "%" } },
        { color: { kind: "variable", name: "--mid-color" }, position: { kind: "variable", name: "--mid-pos" } },
        { color: { kind: "hex", value: "#0000ff" }, position: { kind: "literal", value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(
        "linear-gradient(var(--angle), in oklch, red 0%, var(--mid-color) var(--mid-pos), #0000ff 100%)",
      );
    }
  });
});
