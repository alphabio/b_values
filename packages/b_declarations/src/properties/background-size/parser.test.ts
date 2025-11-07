// b_path:: packages/b_declarations/src/properties/background-size/parser.test.ts

import { describe, it, expect } from "vitest";
import { parseBackgroundSize } from "./parser";

describe("parseBackgroundSize", () => {
  describe("keyword sizes", () => {
    it("should parse cover", () => {
      const result = parseBackgroundSize("cover");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.values).toHaveLength(1);
        expect(result.value.values[0].kind).toBe("keyword");
        if (result.value.values[0].kind === "keyword") {
          expect(result.value.values[0].value).toBe("cover");
        }
      }
    });

    it("should parse contain", () => {
      const result = parseBackgroundSize("contain");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.values[0].kind).toBe("keyword");
        if (result.value.values[0].kind === "keyword") {
          expect(result.value.values[0].value).toBe("contain");
        }
      }
    });
  });

  describe("explicit sizes - single value", () => {
    it("should parse auto", () => {
      const result = parseBackgroundSize("auto");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        const layer = result.value.values[0];
        // "auto" is a valid bg-size keyword, so it's parsed as { kind: "keyword", value: "auto" }
        expect(layer.kind).toBe("keyword");
        if (layer.kind === "keyword") {
          expect(layer.value).toBe("auto");
        }
      }
    });

    it("should parse percentage", () => {
      const result = parseBackgroundSize("50%");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        const layer = result.value.values[0];
        expect(layer.kind).toBe("explicit");
        if (layer.kind === "explicit") {
          expect(layer.width.kind).toBe("literal");
          expect(layer.height.kind).toBe("literal");
          if (layer.width.kind === "literal") {
            expect(layer.width.value).toBe(50);
            expect(layer.width.unit).toBe("%");
          }
        }
      }
    });

    it("should parse length", () => {
      const result = parseBackgroundSize("100px");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        const layer = result.value.values[0];
        expect(layer.kind).toBe("explicit");
        if (layer.kind === "explicit") {
          expect(layer.width.kind).toBe("literal");
          expect(layer.height.kind).toBe("literal");
          if (layer.width.kind === "literal") {
            expect(layer.width.value).toBe(100);
            expect(layer.width.unit).toBe("px");
          }
        }
      }
    });
  });

  describe("explicit sizes - two values", () => {
    it("should parse 50% auto", () => {
      const result = parseBackgroundSize("50% auto");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        const layer = result.value.values[0];
        expect(layer.kind).toBe("explicit");
        if (layer.kind === "explicit") {
          expect(layer.width.kind).toBe("literal");
          expect(layer.height.kind).toBe("keyword");
          if (layer.height.kind === "keyword") {
            expect(layer.height.value).toBe("auto");
          }
        }
      }
    });

    it("should parse 100px 50px", () => {
      const result = parseBackgroundSize("100px 50px");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        const layer = result.value.values[0];
        expect(layer.kind).toBe("explicit");
        if (layer.kind === "explicit") {
          expect(layer.width.kind).toBe("literal");
          expect(layer.height.kind).toBe("literal");
          if (layer.width.kind === "literal" && layer.height.kind === "literal") {
            expect(layer.width.value).toBe(100);
            expect(layer.height.value).toBe(50);
          }
        }
      }
    });

    it("should parse auto 100px", () => {
      const result = parseBackgroundSize("auto 100px");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        const layer = result.value.values[0];
        expect(layer.kind).toBe("explicit");
        if (layer.kind === "explicit") {
          expect(layer.width.kind).toBe("keyword");
          expect(layer.height.kind).toBe("literal");
        }
      }
    });
  });

  describe("multiple layers", () => {
    it("should parse comma-separated layers", () => {
      const result = parseBackgroundSize("cover, contain, 50% auto");
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.values).toHaveLength(3);
        expect(result.value.values[0].kind).toBe("keyword");
        expect(result.value.values[1].kind).toBe("keyword");
        expect(result.value.values[2].kind).toBe("explicit");
      }
    });
  });

  describe("invalid values", () => {
    it("should reject invalid keyword", () => {
      const result = parseBackgroundSize("fill");
      expect(result.ok).toBe(false);
    });

    it("should reject too many values", () => {
      const result = parseBackgroundSize("50% 50% 50%");
      expect(result.ok).toBe(false);
    });
  });

  describe("round-trip", () => {
    const cases = ["cover", "contain", "auto", "50%", "100px", "50% auto", "100px 50px", "cover, contain, 50% auto"];

    for (const input of cases) {
      it(`should round-trip ${input}`, () => {
        const result = parseBackgroundSize(input);
        expect(result.ok).toBe(true);
      });
    }
  });
});
