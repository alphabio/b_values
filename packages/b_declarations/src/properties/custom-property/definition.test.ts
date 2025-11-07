// b_path:: packages/b_declarations/src/properties/custom-property/definition.test.ts
import { describe, it, expect } from "vitest";
import { customProperty } from "./definition";
import { parseCustomProperty } from "./parser";
import { generateCustomProperty } from "./generator";
import type { CustomPropertyIR } from "./types";
import type { MultiValueParser } from "../../types";

describe("customProperty definition", () => {
  it("should have correct name", () => {
    expect(customProperty.name).toBe("--*");
  });

  it("should have correct syntax", () => {
    expect(customProperty.syntax).toBe("<declaration-value>");
  });

  it("should use parseCustomProperty as parser", () => {
    expect(customProperty.parser).toBe(parseCustomProperty);
  });

  it("should use generateCustomProperty as generator", () => {
    expect(customProperty.generator).toBe(generateCustomProperty);
  });

  it("should be inherited", () => {
    expect(customProperty.inherited).toBe(true);
  });

  it("should have empty initial value", () => {
    expect(customProperty.initial).toBe("");
  });

  it("should not be multi-value", () => {
    expect(customProperty.multiValue).toBe(false);
  });

  describe("round-trip", () => {
    it("should round-trip simple value", () => {
      const parseResult = (customProperty.parser as MultiValueParser<CustomPropertyIR>)("blue");
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok && customProperty.generator) {
        const genResult = customProperty.generator(parseResult.value);
        expect(genResult.ok).toBe(true);

        if (genResult.ok) {
          expect(genResult.value).toBe("blue");
        }
      }
    });

    it("should round-trip complex value", () => {
      const value = "linear-gradient(red, blue)";
      const parseResult = (customProperty.parser as MultiValueParser<CustomPropertyIR>)(value);
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok && customProperty.generator) {
        const genResult = customProperty.generator(parseResult.value);
        expect(genResult.ok).toBe(true);

        if (genResult.ok) {
          expect(genResult.value).toBe(value);
        }
      }
    });

    it("should round-trip keyword", () => {
      const parseResult = (customProperty.parser as MultiValueParser<CustomPropertyIR>)("inherit");
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok && customProperty.generator) {
        const genResult = customProperty.generator(parseResult.value);
        expect(genResult.ok).toBe(true);

        if (genResult.ok) {
          expect(genResult.value).toBe("inherit");
        }
      }
    });

    it("should preserve whitespace in round-trip", () => {
      const value = "10px  20px   30px";
      const parseResult = (customProperty.parser as MultiValueParser<CustomPropertyIR>)(value);
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok && customProperty.generator) {
        const genResult = customProperty.generator(parseResult.value);
        expect(genResult.ok).toBe(true);

        if (genResult.ok) {
          expect(genResult.value).toBe(value);
        }
      }
    });
  });
});
