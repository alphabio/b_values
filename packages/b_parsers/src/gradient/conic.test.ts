// b_path:: packages/b_parsers/src/gradient/conic.test.ts
import { describe, expect, it } from "vitest";
import * as Conic from "./conic";
import * as Generate from "@b/generators";

describe("parseConicGradient", () => {
  it("parses simple conic gradient", () => {
    const css = "conic-gradient(red, blue)";
    const result = Conic.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toMatchObject({
      kind: "conic",
      repeating: false,
    });
    expect(result.value.colorStops).toHaveLength(2);

    const genResult = Generate.Gradient.Conic.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses conic gradient with from angle", () => {
    const css = "conic-gradient(from 45deg, red, blue)";
    const result = Conic.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.fromAngle).toMatchObject({
      value: 45,
      unit: "deg",
    });

    const genResult = Generate.Gradient.Conic.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses conic gradient with position", () => {
    const css = "conic-gradient(at center top, red, blue)";
    const result = Conic.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.position).toBeDefined();

    const genResult = Generate.Gradient.Conic.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses conic gradient with from angle and position", () => {
    const css = "conic-gradient(from 90deg at 50% 50%, red, blue)";
    const result = Conic.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.fromAngle).toMatchObject({
      value: 90,
      unit: "deg",
    });
    expect(result.value.position).toBeDefined();

    const genResult = Generate.Gradient.Conic.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses conic gradient with color interpolation", () => {
    const css = "conic-gradient(in oklch, red, blue)";
    const result = Conic.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.colorInterpolationMethod).toMatchObject({
      colorSpace: "oklch",
    });

    const genResult = Generate.Gradient.Conic.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses repeating conic gradient", () => {
    const css = "repeating-conic-gradient(red, blue 20deg)";
    const result = Conic.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.repeating).toBe(true);

    const genResult = Generate.Gradient.Conic.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses conic gradient with angle positions", () => {
    const css = "conic-gradient(red 0deg, yellow 90deg, blue 180deg, green 270deg, red 360deg)";
    const result = Conic.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.colorStops).toHaveLength(5);

    const genResult = Generate.Gradient.Conic.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses complex conic gradient", () => {
    const css = "conic-gradient(from 0deg at 25% 75%, in hsl longer hue, red 0deg, yellow 90deg, blue 180deg)";
    const result = Conic.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.fromAngle).toMatchObject({
      value: 0,
      unit: "deg",
    });
    expect(result.value.position).toBeDefined();
    expect(result.value.colorInterpolationMethod).toBeDefined();
    expect(result.value.colorStops).toHaveLength(3);

    const genResult = Generate.Gradient.Conic.generate(result.value);
    expect(genResult.ok).toBe(true);
  });
});
