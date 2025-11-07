// b_path:: packages/b_declarations/src/properties/background-clip/parser.test.ts
import { describe, expect, it } from "vitest";
import { parseBackgroundClip } from "./parser";
import { generateBackgroundClip } from "./generator";

describe("parseBackgroundClip", () => {
  describe("single value", () => {
    it("should parse 'border-box'", () => {
      const result = parseBackgroundClip("border-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("list");
      if (result.value.kind !== "list") return;
      expect(result.value.values).toHaveLength(1);
      expect(result.value.values[0]).toBe("border-box");
    });

    it("should parse 'padding-box'", () => {
      const result = parseBackgroundClip("padding-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("list");
      if (result.value.kind !== "list") return;
      expect(result.value.values[0]).toBe("padding-box");
    });

    it("should parse 'content-box'", () => {
      const result = parseBackgroundClip("content-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("list");
      if (result.value.kind !== "list") return;
      expect(result.value.values[0]).toBe("content-box");
    });

    it("should parse 'text'", () => {
      const result = parseBackgroundClip("text");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("list");
      if (result.value.kind !== "list") return;
      expect(result.value.values[0]).toBe("text");
    });
  });

  describe("multiple values", () => {
    it("should parse two values", () => {
      const result = parseBackgroundClip("border-box, padding-box");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("list");
      if (result.value.kind !== "list") return;
      expect(result.value.values).toHaveLength(2);
      expect(result.value.values[0]).toBe("border-box");
      expect(result.value.values[1]).toBe("padding-box");
    });

    it("should parse all valid values", () => {
      const result = parseBackgroundClip("border-box, padding-box, content-box, text");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("list");
      if (result.value.kind !== "list") return;
      expect(result.value.values).toHaveLength(4);
    });
  });

  describe("invalid values", () => {
    it("should reject invalid keyword", () => {
      const result = parseBackgroundClip("invalid");

      expect(result.ok).toBe(false);
    });
  });

  describe("round-trip", () => {
    it("should round-trip single value", () => {
      const input = "padding-box";
      const parseResult = parseBackgroundClip(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundClip(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });

    it("should round-trip multiple values", () => {
      const input = "border-box, padding-box, text";
      const parseResult = parseBackgroundClip(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundClip(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });
  });
});
