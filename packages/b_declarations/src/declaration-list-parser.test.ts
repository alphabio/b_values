// b_path:: packages/b_declarations/src/declaration-list-parser.test.ts
import { describe, it, expect } from "vitest";
import { parseDeclarationList } from "./declaration-list-parser";
import "./properties/custom-property"; // Ensure custom property is registered
import "./properties/background-image"; // Ensure background-image is registered

describe("parseDeclarationList", () => {
  describe("basic parsing", () => {
    it("should parse single declaration", () => {
      const result = parseDeclarationList("--my-color: red");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].property).toBe("--my-color");
      }
    });

    it("should parse multiple declarations", () => {
      const result = parseDeclarationList("--color: red; --size: 10px; --name: value");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
        expect(result.value[0].property).toBe("--color");
        expect(result.value[1].property).toBe("--size");
        expect(result.value[2].property).toBe("--name");
      }
    });

    it("should parse with trailing semicolon", () => {
      const result = parseDeclarationList("--color: red; --size: 10px;");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });

    it("should parse without trailing semicolon", () => {
      const result = parseDeclarationList("--color: red; --size: 10px");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });
  });

  describe("whitespace handling", () => {
    it("should handle extra whitespace", () => {
      const result = parseDeclarationList("  --color:   red  ;  --size:  10px  ");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });

    it("should handle newlines", () => {
      const result = parseDeclarationList("--color: red;\n--size: 10px");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });

    it("should handle mixed whitespace", () => {
      const result = parseDeclarationList("--color: red;\n  --size: 10px;\n\t--name: value");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
      }
    });
  });

  describe("edge cases", () => {
    it("should parse empty string", () => {
      const result = parseDeclarationList("");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should handle only semicolons", () => {
      const result = parseDeclarationList(";;;");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should handle whitespace only", () => {
      const result = parseDeclarationList("   \n\t  ");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe("mixed properties", () => {
    it("should parse standard and custom properties", () => {
      const result = parseDeclarationList("background-image: url(test.png); --custom: value");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].property).toBe("background-image");
        expect(result.value[1].property).toBe("--custom");
      }
    });

    it("should parse multi-value properties", () => {
      const result = parseDeclarationList("background-image: url(a.png), linear-gradient(red, blue); --color: red");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].property).toBe("background-image");
      }
    });
  });

  describe("partial failures", () => {
    it("should continue on invalid property", () => {
      const result = parseDeclarationList("unknown-prop: value; --valid: blue");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].property).toBe("--valid");
      }
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should collect all errors", () => {
      const result = parseDeclarationList("unknown1: val; unknown2: val; --valid: blue");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
      }
      expect(result.issues.length).toBeGreaterThan(1);
    });

    it("should fail if all declarations invalid", () => {
      const result = parseDeclarationList("unknown1: val; unknown2: val");

      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("real-world examples", () => {
    it("should parse inline style", () => {
      const result = parseDeclarationList("--primary: blue; --size: 16px; --spacing: 10px");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
      }
    });

    it("should parse complex declarations", () => {
      const result = parseDeclarationList(
        "background-image: linear-gradient(to right, red, blue); --shadow: 0 2px 4px rgba(0,0,0,0.1)",
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });

    it("should handle HTML style attribute format", () => {
      const result = parseDeclarationList("--color: red; --size: 14px; --weight: bold");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
        expect(result.value[0].property).toBe("--color");
        expect(result.value[1].property).toBe("--size");
        expect(result.value[2].property).toBe("--weight");
      }
    });

    it("should handle multi-line declarations with custom properties", () => {
      const result = parseDeclarationList(`
        --angle: 10deg;
        --color-1: red;
        --color-4: blue;
        background-image:
          repeating-conic-gradient(from var(--angle) at 25% 25%, var(--color-1) calc(5 * var(--angle)) 5%, var(--color-4) 5% 10%);
      `);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(4);

        // Check custom properties
        expect(result.value[0].property).toBe("--angle");
        expect(result.value[1].property).toBe("--color-1");
        expect(result.value[2].property).toBe("--color-4");

        // Check background-image
        expect(result.value[3].property).toBe("background-image");
      }
    });
  });

  describe("syntax errors", () => {
    it("should reject invalid syntax", () => {
      const result = parseDeclarationList("not valid css at all!");

      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should handle missing colons", () => {
      const result = parseDeclarationList("--color red");

      expect(result.ok).toBe(false);
    });
  });

  describe("duplicate properties", () => {
    it("should warn on duplicate properties", () => {
      const result = parseDeclarationList(`
        --color: red;
        --angle: 10deg;
        --color: blue;
      `);

      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(3); // All declarations returned

      // Check for warning issue
      const duplicateWarning = result.issues.find(
        (issue) => issue.code === "duplicate-property" && issue.property === "--color",
      );
      expect(duplicateWarning).toBeDefined();
      expect(duplicateWarning?.severity).toBe("warning");
      expect(duplicateWarning?.message).toContain("--color");
      expect(duplicateWarning?.message).toContain("multiple times");
    });

    it("should warn on multiple duplicates of same property", () => {
      const result = parseDeclarationList(`
        --color: red;
        --color: blue;
        --color: green;
      `);

      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(3);

      // Should have 2 warnings (second and third occurrence)
      const warnings = result.issues.filter((issue) => issue.code === "duplicate-property");
      expect(warnings).toHaveLength(2);
      expect(warnings.every((w) => w.property === "--color")).toBe(true);
    });

    it("should track duplicates per property independently", () => {
      const result = parseDeclarationList(`
        --color: red;
        --angle: 10deg;
        --color: blue;
        --angle: 20deg;
      `);

      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(4);

      // Should have 2 warnings (one for --color, one for --angle)
      const warnings = result.issues.filter((issue) => issue.code === "duplicate-property");
      expect(warnings).toHaveLength(2);

      const colorWarning = warnings.find((w) => w.property === "--color");
      const angleWarning = warnings.find((w) => w.property === "--angle");

      expect(colorWarning).toBeDefined();
      expect(angleWarning).toBeDefined();
    });

    it("should not warn when properties are not duplicated", () => {
      const result = parseDeclarationList(`
        --color: red;
        --angle: 10deg;
      `);

      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(2);

      // Should have no warnings
      const warnings = result.issues.filter((issue) => issue.code === "duplicate-property");
      expect(warnings).toHaveLength(0);
    });

    it("should only warn on successful parse duplicates", () => {
      const result = parseDeclarationList(`
        --color: red;
        background-image: INVALID;
        --color: blue;
      `);

      expect(result.ok).toBe(true); // Has warnings but parsed successfully (2 valid declarations)
      expect(result.value).toHaveLength(2); // Only valid ones

      // Should have 1 duplicate warning for --color
      const duplicateWarnings = result.issues.filter((issue) => issue.code === "duplicate-property");
      expect(duplicateWarnings).toHaveLength(1);
      expect(duplicateWarnings[0].property).toBe("--color");

      // Should also have parse error for background-image
      const parseErrors = result.issues.filter((issue) => issue.severity === "error");
      expect(parseErrors.length).toBeGreaterThan(0);
    });
  });
});
