// b_path:: packages/b_declarations/src/declaration-list-generator.test.ts
import { describe, it, expect } from "vitest";
import { generateDeclarationList } from "./declaration-list-generator";
import { parseDeclarationList } from "./declaration-list-parser";
import "./properties/custom-property"; // Ensure custom property is registered
import "./properties/background-image"; // Ensure background-image is registered

describe("generateDeclarationList", () => {
  describe("basic generation", () => {
    it("should generate single declaration", () => {
      const parseResult = parseDeclarationList("--color: red");
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok) {
        const result = generateDeclarationList(parseResult.value);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe("--color: red");
        }
      }
    });

    it("should generate multiple declarations", () => {
      const parseResult = parseDeclarationList("--color: red; --size: 10px");
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok) {
        const result = generateDeclarationList(parseResult.value);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe("--color: red; --size: 10px");
        }
      }
    });

    it("should join with semicolons", () => {
      const parseResult = parseDeclarationList("--a: 1; --b: 2; --c: 3");
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok) {
        const result = generateDeclarationList(parseResult.value);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe("--a: 1; --b: 2; --c: 3");
        }
      }
    });

    it("should handle empty array", () => {
      const result = generateDeclarationList([]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("");
      }
    });
  });

  describe("round-trip", () => {
    it("should round-trip simple declarations", () => {
      const input = "--color: blue; --size: 16px";
      const parseResult = parseDeclarationList(input);

      expect(parseResult.ok).toBe(true);
      if (parseResult.ok) {
        const genResult = generateDeclarationList(parseResult.value);
        expect(genResult.ok).toBe(true);
        if (genResult.ok) {
          expect(genResult.value).toBe(input);
        }
      }
    });

    it("should round-trip complex declarations", () => {
      const input = "background-image: url(test.png), linear-gradient(red, blue); --custom: value";
      const parseResult = parseDeclarationList(input);

      expect(parseResult.ok).toBe(true);
      if (parseResult.ok) {
        const genResult = generateDeclarationList(parseResult.value);
        expect(genResult.ok).toBe(true);
        if (genResult.ok) {
          // Round-trip should preserve structure
          expect(genResult.value).toContain("background-image:");
          expect(genResult.value).toContain("--custom: value");
        }
      }
    });

    it("should round-trip with multiple custom properties", () => {
      const input = "--primary: #007bff; --secondary: #6c757d; --success: #28a745";
      const parseResult = parseDeclarationList(input);

      expect(parseResult.ok).toBe(true);
      if (parseResult.ok) {
        const genResult = generateDeclarationList(parseResult.value);
        expect(genResult.ok).toBe(true);
        if (genResult.ok) {
          expect(genResult.value).toBe(input);
        }
      }
    });
  });

  describe("real-world examples", () => {
    it("should generate inline style", () => {
      const parseResult = parseDeclarationList("--color: red; --size: 14px; --weight: bold");

      expect(parseResult.ok).toBe(true);
      if (parseResult.ok) {
        const result = generateDeclarationList(parseResult.value);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe("--color: red; --size: 14px; --weight: bold");
        }
      }
    });

    it("should generate CSSOM style", () => {
      const parseResult = parseDeclarationList("--theme: dark; --spacing: 20px");

      expect(parseResult.ok).toBe(true);
      if (parseResult.ok) {
        const result = generateDeclarationList(parseResult.value);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe("--theme: dark; --spacing: 20px");
        }
      }
    });
  });
});
