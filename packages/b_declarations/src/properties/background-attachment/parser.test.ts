// b_path:: packages/b_declarations/src/properties/background-attachment/parser.test.ts
import { describe, expect, it } from "vitest";
import { parseBackgroundAttachment } from "./parser";
import { generateBackgroundAttachment } from "./generator";

describe("parseBackgroundAttachment", () => {
  describe("CSS-wide keywords", () => {
    it("should parse 'inherit'", () => {
      const result = parseBackgroundAttachment("inherit");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("keyword");
      if (result.value.kind !== "keyword") return;
      expect(result.value.value).toBe("inherit");
    });

    it("should parse 'initial'", () => {
      const result = parseBackgroundAttachment("initial");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("keyword");
      if (result.value.kind !== "keyword") return;
      expect(result.value.value).toBe("initial");
    });

    it("should parse 'unset'", () => {
      const result = parseBackgroundAttachment("unset");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("keyword");
      if (result.value.kind !== "keyword") return;
      expect(result.value.value).toBe("unset");
    });

    it("should parse 'revert'", () => {
      const result = parseBackgroundAttachment("revert");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("keyword");
      if (result.value.kind !== "keyword") return;
      expect(result.value.value).toBe("revert");
    });
  });

  describe("single value", () => {
    it("should parse 'scroll'", () => {
      const result = parseBackgroundAttachment("scroll");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0]).toBe("scroll");
    });

    it("should parse 'fixed'", () => {
      const result = parseBackgroundAttachment("fixed");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0]).toBe("fixed");
    });

    it("should parse 'local'", () => {
      const result = parseBackgroundAttachment("local");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0]).toBe("local");
    });
  });

  describe("multiple values", () => {
    it("should parse two values", () => {
      const result = parseBackgroundAttachment("scroll, fixed");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(2);
      expect(result.value.layers[0]).toBe("scroll");
      expect(result.value.layers[1]).toBe("fixed");
    });

    it("should parse three values", () => {
      const result = parseBackgroundAttachment("fixed, local, scroll");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(3);
      expect(result.value.layers[0]).toBe("fixed");
      expect(result.value.layers[1]).toBe("local");
      expect(result.value.layers[2]).toBe("scroll");
    });
  });

  describe("invalid values", () => {
    it("should reject invalid keyword", () => {
      const result = parseBackgroundAttachment("invalid");

      expect(result.ok).toBe(false);
    });

    it("should reject empty string", () => {
      const result = parseBackgroundAttachment("");

      expect(result.ok).toBe(false);
    });
  });

  describe("round-trip", () => {
    it("should round-trip single value", () => {
      const input = "fixed";
      const parseResult = parseBackgroundAttachment(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundAttachment(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });

    it("should round-trip multiple values", () => {
      const input = "scroll, fixed, local";
      const parseResult = parseBackgroundAttachment(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundAttachment(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });
  });
});
