// b_path:: packages/b_generators/src/gradient/conic.test.ts
import { describe, it, expect } from "vitest";
import type * as Type from "@b/types";
import * as Conic from "./conic";

describe("Conic Gradient Generator", () => {
  it("generates simple conic gradient", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("conic-gradient(red, blue)");
    }
  });

  it("generates conic gradient with from angle", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      fromAngle: { value: 45, unit: "deg" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("conic-gradient(from 45deg, red, blue)");
    }
  });

  it("generates conic gradient with position", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      position: { horizontal: "center", vertical: "center" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("conic-gradient(at center center, red, blue)");
    }
  });

  it("generates conic gradient with from angle and position", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      fromAngle: { value: 90, unit: "deg" },
      position: { horizontal: { value: 30, unit: "%" }, vertical: { value: 40, unit: "%" } },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("conic-gradient(from 90deg at 30% 40%, red, blue)");
    }
  });

  it("generates repeating conic gradient", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { value: 0, unit: "deg" } },
        { color: { kind: "named", name: "blue" }, position: { value: 45, unit: "deg" } },
      ],
      repeating: true,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("repeating-conic-gradient(red 0deg, blue 45deg)");
    }
  });

  it("generates conic gradient with color stops at angle positions", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { value: 0, unit: "deg" } },
        { color: { kind: "named", name: "yellow" }, position: { value: 120, unit: "deg" } },
        { color: { kind: "named", name: "blue" }, position: { value: 240, unit: "deg" } },
        { color: { kind: "named", name: "red" }, position: { value: 360, unit: "deg" } },
      ],
      repeating: false,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("conic-gradient(red 0deg, yellow 120deg, blue 240deg, red 360deg)");
    }
  });

  it("generates conic gradient with turn unit", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      fromAngle: { value: 0.25, unit: "turn" },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("conic-gradient(from 0.25turn, red, blue)");
    }
  });

  it("generates conic gradient with color interpolation method", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      colorInterpolationMethod: {
        colorSpace: "hsl",
        hueInterpolationMethod: "longer hue",
      },
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("conic-gradient(in hsl longer hue, red, blue)");
    }
  });

  it("generates conic gradient with all options", () => {
    const ir: Type.ConicGradient = {
      kind: "conic",
      fromAngle: { value: 45, unit: "deg" },
      position: { horizontal: "center", vertical: "center" },
      colorInterpolationMethod: {
        colorSpace: "oklch",
        hueInterpolationMethod: undefined,
      },
      colorStops: [
        { color: { kind: "named", name: "red" }, position: { value: 0, unit: "deg" } },
        { color: { kind: "named", name: "blue" }, position: { value: 180, unit: "deg" } },
        { color: { kind: "named", name: "red" }, position: { value: 360, unit: "deg" } },
      ],
      repeating: false,
    };

    const result = Conic.generate(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(
        "conic-gradient(from 45deg at center center, in oklch, red 0deg, blue 180deg, red 360deg)",
      );
    }
  });
});
