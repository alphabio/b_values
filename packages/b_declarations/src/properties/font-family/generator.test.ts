// b_path:: packages/b_declarations/src/properties/font-family/generator.test.ts

import { describe, expect, it } from "vitest";
import { generateFontFamily } from "./generator";
import type { FontFamilyIR } from "./types";

describe("generateFontFamily", () => {
  describe("generic families", () => {
    it("generates serif", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["serif"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("serif");
      }
    });

    it("generates sans-serif", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["sans-serif"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("sans-serif");
      }
    });

    it("generates system-ui", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["system-ui"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("system-ui");
      }
    });
  });

  describe("single word family names", () => {
    it("generates unquoted single word", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["Arial"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("Arial");
      }
    });

    it("generates unquoted with hyphen", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["Arial-Bold"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("Arial-Bold");
      }
    });
  });

  describe("family names requiring quotes", () => {
    it("quotes name with spaces", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["Times New Roman"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('"Times New Roman"');
      }
    });

    it("quotes name starting with digit", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["3Font"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('"3Font"');
      }
    });

    it("quotes name with special characters", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["Font!"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('"Font!"');
      }
    });

    it("escapes quotes in name", () => {
      const ir: FontFamilyIR = { kind: "list", families: ['My"Font'] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('"My\\"Font"');
      }
    });
  });

  describe("comma-separated lists", () => {
    it("generates two families", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["Arial", "serif"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("Arial, serif");
      }
    });

    it("generates three families", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["Arial", "Helvetica", "sans-serif"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("Arial, Helvetica, sans-serif");
      }
    });

    it("generates mixed quoted and unquoted", () => {
      const ir: FontFamilyIR = { kind: "list", families: ["Times New Roman", "Times", "serif"] };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('"Times New Roman", Times, serif');
      }
    });
  });

  describe("CSS-wide keywords", () => {
    it("generates inherit", () => {
      const ir: FontFamilyIR = { kind: "keyword", value: "inherit" };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("inherit");
      }
    });

    it("generates initial", () => {
      const ir: FontFamilyIR = { kind: "keyword", value: "initial" };
      const result = generateFontFamily(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("initial");
      }
    });
  });
});
