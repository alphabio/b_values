// b_path:: packages/b_declarations/src/properties/background-image.test.ts
import { describe, expect, it } from "vitest";
import { parseBackgroundImage } from "./background-image";

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
    it("should parse linear-gradient (placeholder)", () => {
      const result = parseBackgroundImage("linear-gradient(red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
    });

    it("should parse radial-gradient (placeholder)", () => {
      const result = parseBackgroundImage("radial-gradient(red, blue)");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("gradient");
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

    it("should parse mixed layers", () => {
      const result = parseBackgroundImage(
        "url(image.png), linear-gradient(red, blue)"
      );
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(2);
      expect(result.value.layers[0].kind).toBe("url");
      expect(result.value.layers[1].kind).toBe("gradient");
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
