// b_path:: packages/b_parsers/src/gradient/radial.test.ts
import { describe, expect, it } from "vitest";
import * as Radial from "./radial";
import * as Generate from "@b/generators";

describe("parseRadialGradient", () => {
  it("parses simple radial gradient", () => {
    const css = "radial-gradient(red, blue)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toMatchObject({
      kind: "radial",
      repeating: false,
    });
    expect(result.value.colorStops).toHaveLength(2);

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses radial gradient with circle shape", () => {
    const css = "radial-gradient(circle, red, blue)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.shape).toBe("circle");

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses radial gradient with size keyword", () => {
    const css = "radial-gradient(closest-side, red, blue)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.size).toMatchObject({
      kind: "keyword",
      value: "closest-side",
    });

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses radial gradient with shape and size", () => {
    const css = "radial-gradient(circle farthest-corner, red, blue)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.shape).toBe("circle");
    expect(result.value.size).toMatchObject({
      kind: "keyword",
      value: "farthest-corner",
    });

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses radial gradient with position", () => {
    const css = "radial-gradient(at center top, red, blue)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.position).toBeDefined();

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses radial gradient with explicit circle size", () => {
    const css = "radial-gradient(circle 50px, red, blue)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.shape).toBe("circle");
    expect(result.value.size).toMatchObject({
      kind: "circle-explicit",
      radius: { value: 50, unit: "px" },
    });

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses radial gradient with explicit ellipse size", () => {
    const css = "radial-gradient(100px 50px, red, blue)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.size).toMatchObject({
      kind: "ellipse-explicit",
      radiusX: { value: 100, unit: "px" },
      radiusY: { value: 50, unit: "px" },
    });

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses radial gradient with color interpolation", () => {
    const css = "radial-gradient(in oklch, red, blue)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.colorInterpolationMethod).toMatchObject({
      colorSpace: "oklch",
    });

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses repeating radial gradient", () => {
    const css = "repeating-radial-gradient(red, blue 20%)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.repeating).toBe(true);

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });

  it("parses complex radial gradient", () => {
    const css = "radial-gradient(ellipse farthest-corner at 50% 25%, in srgb, red 0%, yellow 50%, blue 100%)";
    const result = Radial.parse(css);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.shape).toBe("ellipse");
    expect(result.value.size).toMatchObject({
      kind: "keyword",
      value: "farthest-corner",
    });
    expect(result.value.position).toBeDefined();
    expect(result.value.colorInterpolationMethod).toMatchObject({
      colorSpace: "srgb",
    });
    expect(result.value.colorStops).toHaveLength(3);

    const genResult = Generate.Gradient.Radial.generate(result.value);
    expect(genResult.ok).toBe(true);
  });
});
