// b_path:: packages/b_declarations/src/properties/background-repeat/parser.test.ts
import { describe, expect, it } from "vitest";
import { parseBackgroundRepeat } from "./parser";
import { generateBackgroundRepeat } from "./generator";

describe("parseBackgroundRepeat", () => {
  describe("CSS-wide keywords", () => {
    it("should parse 'inherit'", () => {
      const result = parseBackgroundRepeat("inherit");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("keyword");
      if (result.value.kind !== "keyword") return;
      expect(result.value.value).toBe("inherit");
    });

    it("should parse 'initial'", () => {
      const result = parseBackgroundRepeat("initial");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("keyword");
      if (result.value.kind !== "keyword") return;
      expect(result.value.value).toBe("initial");
    });
  });

  describe("shorthand", () => {
    it("should parse 'repeat-x'", () => {
      const result = parseBackgroundRepeat("repeat-x");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0].kind).toBe("shorthand");
      if (result.value.layers[0].kind !== "shorthand") return;
      expect(result.value.layers[0].value).toBe("repeat-x");
    });

    it("should parse 'repeat-y'", () => {
      const result = parseBackgroundRepeat("repeat-y");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0].kind).toBe("shorthand");
      if (result.value.layers[0].kind !== "shorthand") return;
      expect(result.value.layers[0].value).toBe("repeat-y");
    });
  });

  describe("single value (both axes)", () => {
    it("should parse 'repeat'", () => {
      const result = parseBackgroundRepeat("repeat");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(1);
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("repeat");
      expect(result.value.layers[0].vertical).toBe("repeat");
    });

    it("should parse 'space'", () => {
      const result = parseBackgroundRepeat("space");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("space");
      expect(result.value.layers[0].vertical).toBe("space");
    });

    it("should parse 'round'", () => {
      const result = parseBackgroundRepeat("round");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("round");
      expect(result.value.layers[0].vertical).toBe("round");
    });

    it("should parse 'no-repeat'", () => {
      const result = parseBackgroundRepeat("no-repeat");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("no-repeat");
      expect(result.value.layers[0].vertical).toBe("no-repeat");
    });
  });

  describe("two values (different axes)", () => {
    it("should parse 'repeat space'", () => {
      const result = parseBackgroundRepeat("repeat space");

      if (!result.ok) {
        console.log("ERROR:", result.issues);
      }

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("repeat");
      expect(result.value.layers[0].vertical).toBe("space");
    });

    it("should parse 'repeat no-repeat'", () => {
      const result = parseBackgroundRepeat("repeat no-repeat");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("repeat");
      expect(result.value.layers[0].vertical).toBe("no-repeat");
    });

    it("should parse 'space round'", () => {
      const result = parseBackgroundRepeat("space round");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("space");
      expect(result.value.layers[0].vertical).toBe("round");
    });

    it("should parse 'no-repeat repeat'", () => {
      const result = parseBackgroundRepeat("no-repeat repeat");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("no-repeat");
      expect(result.value.layers[0].vertical).toBe("repeat");
    });

    it("should parse 'repeat repeat' (identical values)", () => {
      const result = parseBackgroundRepeat("repeat repeat");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers[0].kind).toBe("explicit");
      if (result.value.layers[0].kind !== "explicit") return;
      expect(result.value.layers[0].horizontal).toBe("repeat");
      expect(result.value.layers[0].vertical).toBe("repeat");
    });
  });

  describe("multiple layers", () => {
    it("should parse mixed layers", () => {
      const result = parseBackgroundRepeat("repeat-x, space, repeat no-repeat");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(3);

      expect(result.value.layers[0].kind).toBe("shorthand");
      if (result.value.layers[0].kind !== "shorthand") return;
      expect(result.value.layers[0].value).toBe("repeat-x");

      expect(result.value.layers[1].kind).toBe("explicit");
      if (result.value.layers[1].kind !== "explicit") return;
      expect(result.value.layers[1].horizontal).toBe("space");
      expect(result.value.layers[1].vertical).toBe("space");

      expect(result.value.layers[2].kind).toBe("explicit");
      if (result.value.layers[2].kind !== "explicit") return;
      expect(result.value.layers[2].horizontal).toBe("repeat");
      expect(result.value.layers[2].vertical).toBe("no-repeat");
    });

    it("should parse all shorthand layers", () => {
      const result = parseBackgroundRepeat("repeat-x, repeat-y");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("layers");
      if (result.value.kind !== "layers") return;
      expect(result.value.layers).toHaveLength(2);
      expect(result.value.layers[0].kind).toBe("shorthand");
      expect(result.value.layers[1].kind).toBe("shorthand");
    });
  });

  describe("invalid values", () => {
    it("should reject invalid keyword", () => {
      const result = parseBackgroundRepeat("invalid");

      expect(result.ok).toBe(false);
    });

    it("should reject too many values", () => {
      const result = parseBackgroundRepeat("repeat space round");

      expect(result.ok).toBe(false);
    });
  });

  describe("round-trip", () => {
    it("should round-trip shorthand", () => {
      const input = "repeat-x";
      const parseResult = parseBackgroundRepeat(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundRepeat(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });

    it("should round-trip single value", () => {
      const input = "space";
      const parseResult = parseBackgroundRepeat(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundRepeat(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });

    it("should round-trip two values", () => {
      const input = "repeat no-repeat";
      const parseResult = parseBackgroundRepeat(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundRepeat(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });

    it("should round-trip multiple layers", () => {
      const input = "repeat-x, space, repeat no-repeat";
      const parseResult = parseBackgroundRepeat(input);

      expect(parseResult.ok).toBe(true);
      if (!parseResult.ok) return;

      const generateResult = generateBackgroundRepeat(parseResult.value);

      expect(generateResult.ok).toBe(true);
      if (!generateResult.ok) return;
      expect(generateResult.value).toBe(input);
    });
  });
});
