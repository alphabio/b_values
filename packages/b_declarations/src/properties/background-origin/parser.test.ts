// b_path:: packages/b_declarations/src/properties/background-origin/parser.test.ts
import { describe, expect, it } from "vitest";
import { parseBackgroundOrigin } from "./parser";
import { generateBackgroundOrigin } from "./generator";

describe("parseBackgroundOrigin", () => {
  describe("single value", () => {
    it("should parse 'border-box'", () => {
      const result = parseBackgroundOrigin("border-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0]).toBe("border-box");
    });

    it("should parse 'padding-box'", () => {
      const result = parseBackgroundOrigin("padding-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0]).toBe("padding-box");
    });

    it("should parse 'content-box'", () => {
      const result = parseBackgroundOrigin("content-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0]).toBe("content-box");
    });
  });

  describe("multiple values", () => {
    it("should parse two values", () => {
      const result = parseBackgroundOrigin("padding-box, border-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(2);
      expect(result.value.layers[0]).toBe("padding-box");
      expect(result.value.layers[1]).toBe("border-box");
    });

    it("should parse all valid values", () => {
      const result = parseBackgroundOrigin("border-box, padding-box, content-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(3);
    });
  });

  describe("invalid values", () => {
    it("should reject 'text' (not valid for origin)", () => {
      const result = parseBackgroundOrigin("text");

      expect(result.ok).toBe(false);
    });

    it("should reject invalid keyword", () => {
      const result = parseBackgroundOrigin("invalid");

      expect(result.ok).toBe(false);
    });
  });

  describe("round-trip", () => {
    it("should round-trip single value", () => {
      const input = "padding-box";
      const parseResult = parseBackgroundOrigin(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundOrigin(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });

    it("should round-trip multiple values", () => {
      const input = "border-box, padding-box, content-box";
      const parseResult = parseBackgroundOrigin(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundOrigin(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });
  });
});
