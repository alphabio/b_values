// b_path:: packages/b_declarations/src/properties/background-image.test.ts
import { describe, expect, it } from "vitest";
import { parseBackgroundImage } from "./background-image";
import * as Generators from "@b/generators";

describe("background-image property", () => {
  describe("keywords", () => {
    it("should parse 'none'", () => {
      const result = parseBackgroundImage("none");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("keyword");
      if (result.value.kind !== "keyword") return;
      expect(result.value.value).toBe("none");
    });

    it("should parse CSS-wide keywords", () => {
      const result = parseBackgroundImage("inherit");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("keyword");
    });
  });

  describe("single layer", () => {
    it("should parse url without quotes", () => {
      const result = parseBackgroundImage("url(image.png)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0].kind).toBe("url");
      if (result.value.layers[0].kind !== "url") return;
      expect(result.value.layers[0].url).toBe("image.png");
    });

    it("should parse url with double quotes", () => {
      const result = parseBackgroundImage('url("image.png")');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("url");
    });

    it("should parse url with single quotes", () => {
      const result = parseBackgroundImage("url('image.png')");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("url");
    });
  });

  describe("gradients", () => {
    it("should parse and round-trip linear-gradient", () => {
      const input = "linear-gradient(red, blue)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;

      // Round-trip validation
      const gradient = result.value.layers[0].gradient;
      const generated = Generators.Gradient.generate(gradient);
      const reparsed = parseBackgroundImage(generated);
      expect(reparsed.ok).toBe(true);
    });

    it("should parse and round-trip linear-gradient with direction", () => {
      const input = "linear-gradient(to right, red, blue)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;

      // Round-trip validation
      const gradient = result.value.layers[0].gradient;
      const generated = Generators.Gradient.generate(gradient);
      const reparsed = parseBackgroundImage(generated);
      expect(reparsed.ok).toBe(true);
    });

    it("should parse and round-trip radial-gradient", () => {
      const input = "radial-gradient(circle, red, blue)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;

      // Round-trip validation
      const gradient = result.value.layers[0].gradient;
      const generated = Generators.Gradient.generate(gradient);
      const reparsed = parseBackgroundImage(generated);
      expect(reparsed.ok).toBe(true);
    });

    it("should parse and round-trip radial-gradient with size and position", () => {
      const input = "radial-gradient(circle closest-side at center, red, blue)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;

      // Round-trip validation
      const gradient = result.value.layers[0].gradient;
      const generated = Generators.Gradient.generate(gradient);
      const reparsed = parseBackgroundImage(generated);
      expect(reparsed.ok).toBe(true);
    });

    it("should parse and round-trip conic-gradient", () => {
      const input = "conic-gradient(red, blue)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;

      // Round-trip validation
      const gradient = result.value.layers[0].gradient;
      const generated = Generators.Gradient.generate(gradient);
      const reparsed = parseBackgroundImage(generated);
      expect(reparsed.ok).toBe(true);
    });

    it("should parse and round-trip conic-gradient with angle and position", () => {
      const input = "conic-gradient(from 45deg at center, red, blue)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;

      // Round-trip validation
      const gradient = result.value.layers[0].gradient;
      const generated = Generators.Gradient.generate(gradient);
      const reparsed = parseBackgroundImage(generated);
      expect(reparsed.ok).toBe(true);
    });

    it("should parse repeating-linear-gradient", () => {
      const input = "repeating-linear-gradient(red 0%, blue 10%)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;
      expect(result.value.layers[0].gradient.repeating).toBe(true);
    });

    it("should parse repeating-radial-gradient", () => {
      const input = "repeating-radial-gradient(red 0%, blue 10%)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;
      expect(result.value.layers[0].gradient.repeating).toBe(true);
    });

    it("should parse repeating-conic-gradient", () => {
      const input = "repeating-conic-gradient(red 0deg, blue 45deg)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
      if (result.value.layers[0].kind !== "gradient") return;
      expect(result.value.layers[0].gradient.repeating).toBe(true);
    });

    it("should fail for invalid gradient", () => {
      const input = "linear-gradient(invalid)";
      const result = parseBackgroundImage(input);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error).toContain("Invalid linear-gradient");
    });
  });

  describe("multiple layers", () => {
    it("should parse comma-separated layers", () => {
      const result = parseBackgroundImage("url(a.png), url(b.png)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(2);
      expect(result.value.layers[0].kind).toBe("url");
      expect(result.value.layers[1].kind).toBe("url");
    });

    it("should parse mixed url and gradient layers", () => {
      const result = parseBackgroundImage("url(image.png), linear-gradient(red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(2);
      expect(result.value.layers[0].kind).toBe("url");
      expect(result.value.layers[1].kind).toBe("gradient");
    });

    it("should parse multiple gradients", () => {
      const result = parseBackgroundImage(
        "linear-gradient(red, blue), radial-gradient(circle, green, yellow), conic-gradient(red, blue)",
      );
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(3);
      expect(result.value.layers[0].kind).toBe("gradient");
      expect(result.value.layers[1].kind).toBe("gradient");
      expect(result.value.layers[2].kind).toBe("gradient");
    });

    it("should handle none in layer list", () => {
      const result = parseBackgroundImage("url(image.png), none");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(2);
      expect(result.value.layers[1].kind).toBe("none");
    });
  });

  describe("invalid values", () => {
    it("should fail for unsupported values", () => {
      const result = parseBackgroundImage("invalid-value");
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error).toContain("Unsupported image type");
    });
  });
});

describe("rgb colors in gradients", () => {
  it("should parse radial gradient with rgb colors", () => {
    const input = "radial-gradient(rgb(255, 255, 255, 0) 0, rgb(255, 255, 255, 0.15) 30%)";
    const result = parseBackgroundImage(input);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      console.error("Parse error:", result.error);
      return;
    }
    expect(result.value.kind).toBe("layers");
    if (result.value.kind !== "layers") return;
    expect(result.value.layers[0].kind).toBe("gradient");
  });
});
