// b_path:: packages/b_declarations/src/properties/custom-property/generator.test.ts
import { describe, it, expect } from "vitest";
import { generateCustomProperty } from "./generator";
import type { CustomPropertyIR } from "./types";

describe("generateCustomProperty", () => {
  describe("simple values", () => {
    it("should generate color keyword", () => {
      const ir: CustomPropertyIR = { kind: "raw", value: "blue" };
      const result = generateCustomProperty(ir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("blue");
      }
    });

    it("should generate hex color", () => {
      const ir: CustomPropertyIR = { kind: "raw", value: "#123456" };
      const result = generateCustomProperty(ir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("#123456");
      }
    });

    it("should generate length", () => {
      const ir: CustomPropertyIR = { kind: "raw", value: "10px" };
      const result = generateCustomProperty(ir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("10px");
      }
    });
  });

  describe("complex values", () => {
    it("should generate box-shadow", () => {
      const ir: CustomPropertyIR = { kind: "raw", value: "3px 6px rgb(20 32 54)" };
      const result = generateCustomProperty(ir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("3px 6px rgb(20 32 54)");
      }
    });

    it("should generate gradient", () => {
      const ir: CustomPropertyIR = { kind: "raw", value: "linear-gradient(red, blue)" };
      const result = generateCustomProperty(ir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear-gradient(red, blue)");
      }
    });

    it("should generate calc", () => {
      const ir: CustomPropertyIR = { kind: "raw", value: "calc(100% - 20px)" };
      const result = generateCustomProperty(ir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("calc(100% - 20px)");
      }
    });
  });

  describe("preservation", () => {
    it("should preserve case", () => {
      const ir: CustomPropertyIR = { kind: "raw", value: "MyCustomValue" };
      const result = generateCustomProperty(ir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("MyCustomValue");
      }
    });

    it("should preserve whitespace", () => {
      const ir: CustomPropertyIR = { kind: "raw", value: "10px  20px   30px" };
      const result = generateCustomProperty(ir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("10px  20px   30px");
      }
    });
  });
});
