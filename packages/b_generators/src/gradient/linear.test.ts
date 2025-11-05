// b_path:: packages/b_generators/src/gradient/linear.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Linear from "./linear";

describe("Linear Gradient Generator", () => {
  it("generates simple linear gradient", () => {
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

  it("generates linear gradient with angle direction", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      direction: { kind: "angle", value: { value: 45, unit: "deg" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(45deg, red, blue)");
    }
  });

  it("generates linear gradient with to-side direction", () => {
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

  it("generates linear gradient with to-corner direction", () => {
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

  it("generates repeating linear gradient", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { value: 0, unit: "px" } },
        { color: { kind: "named", name: "blue" }, position: { value: 20, unit: "px" } },
      ],
      repeating: true,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("repeating-linear-gradient(red 0px, blue 20px)");
    }
  });

  it("generates linear gradient with color stops at positions", () => {
    const ir: Type.LinearGradient = {
      kind: "linear",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { value: 0, unit: "%" } },
        { color: { kind: "named", name: "blue" }, position: { value: 50, unit: "%" } },
        { color: { kind: "named", name: "green" }, position: { value: 100, unit: "%" } },
      ],
      repeating: false,
    };

    const result = Linear.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("linear-gradient(red 0%, blue 50%, green 100%)");
    }
  });
});
