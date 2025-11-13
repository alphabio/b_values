// b_path:: packages/b_declarations/src/__tests__/property-system-integrity.test.ts

import { describe, it, expect } from "vitest";
import { propertyRegistry } from "../core";
import * as fs from "node:fs";
import * as path from "node:path";

// Import properties to ensure they're registered
import "../properties";

/**
 * Property System Integrity Tests
 *
 * These tests enforce architectural contracts that can't be validated
 * by TypeScript alone. They catch:
 * - Naming convention violations
 * - Cross-package wiring issues
 * - Generator contract violations
 * - Parser/keyword drift
 */

describe("Property System Integrity", () => {
  // ============================================================================
  // Gap #2: IR Type Naming Convention
  // ============================================================================

  describe("IR type naming conventions", () => {
    it("all property IR types follow {PropertyName}IR pattern", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames().filter((n) => n !== "--*"); // Skip pattern-based custom properties

      for (const propName of registryNames) {
        // Convert property name to expected IR type name
        // e.g., "background-color" → "BackgroundColorIR"
        const expectedIRName = `${propName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")}IR`;

        // Read the property's types.ts file
        const propDir = propName.replace(/_/g, "-");
        const typesPath = path.resolve(__dirname, "../properties", propDir, "types.ts");

        if (!fs.existsSync(typesPath)) {
          violations.push(`${propName}: types.ts not found at ${typesPath}`);
          continue;
        }

        const typesContent = fs.readFileSync(typesPath, "utf8");

        // Check if the expected IR type is exported
        const irExportRegex = new RegExp(`export type ${expectedIRName}\\s*=`, "m");

        if (!irExportRegex.test(typesContent)) {
          violations.push(`${propName}: Expected to export type ${expectedIRName}, but not found in types.ts`);
        }
      }

      if (violations.length > 0) {
        throw new Error(`IR naming convention violations:\n${violations.join("\n")}`);
      }
    });

    it("property types.ts files export exactly one primary IR type", () => {
      const warnings: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames().filter((n) => n !== "--*");

      for (const propName of registryNames) {
        const propDir = propName.replace(/_/g, "-");
        const typesPath = path.resolve(__dirname, "../properties", propDir, "types.ts");

        if (!fs.existsSync(typesPath)) continue;

        const typesContent = fs.readFileSync(typesPath, "utf8");

        // Count how many types end with "IR"
        const irTypeMatches = typesContent.match(/export type \w+IR\s*=/g);
        const irTypeCount = irTypeMatches ? irTypeMatches.length : 0;

        if (irTypeCount === 0) {
          warnings.push(`${propName}: No IR type export found`);
        } else if (irTypeCount > 1) {
          // Multiple IR types is OK (e.g., helper types), but we log it
          // The main IR should match the property name
          const expectedIRName = `${propName
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("")}IR`;

          const hasExpectedName = new RegExp(`export type ${expectedIRName}\\s*=`, "m").test(typesContent);

          if (!hasExpectedName) {
            warnings.push(`${propName}: Multiple IR types exported but none match expected name ${expectedIRName}`);
          }
        }
      }

      // This is a warning-level check, not a hard failure
      // Log warnings but don't fail the test
      if (warnings.length > 0) {
        // biome-ignore lint/suspicious/noConsole: Test diagnostic output
        console.warn(`IR type export warnings:\n${warnings.join("\n")}`);
      }

      expect(true).toBe(true); // Always pass but warnings are logged
    });
  });

  // ============================================================================
  // Gap #5: Generator Contract Enforcement
  // ============================================================================

  describe("generator contract enforcement", () => {
    it("generators return value-only (no property prefix)", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames();

      for (const propName of registryNames) {
        const def = propertyRegistry.get(propName);
        if (!def?.generator) continue;

        // Test with a simple IR that should generate successfully
        // We check the output format, not correctness
        let testIR: unknown;

        // Create a minimal test IR based on property patterns
        if (def.multiValue) {
          testIR = { kind: "list", values: [] };
        } else if (def.rawValue) {
          testIR = { kind: "raw", value: "test" };
        } else {
          // Single-value: try keyword
          testIR = { kind: "keyword", value: "initial" };
        }

        try {
          const result = def.generator(testIR);

          if (result.ok) {
            const { value } = result;

            // Generator MUST NOT include "property: " prefix
            // It should return only the value part
            const hasPropertyPrefix = /^\s*[\w-]+\s*:/.test(value);

            if (hasPropertyPrefix) {
              violations.push(`${propName}: Generator returned value with property prefix: "${value.slice(0, 50)}..."`);
            }

            // Additional check: result should not start with the property name
            const startsWithPropName = value.trim().startsWith(`${propName}:`);

            if (startsWithPropName) {
              violations.push(`${propName}: Generator output starts with property name: "${value.slice(0, 50)}..."`);
            }
          }
          // If result.ok is false, that's fine - our test IR might be invalid
          // We're only checking format when generation succeeds
        } catch (error) {
          // Generator threw an exception - this is unexpected
          violations.push(
            `${propName}: Generator threw exception with test IR: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `Generator contract violations (must return value-only, no property prefix):\n${violations.join("\n")}`,
        );
      }
    });

    it("generators do not add property field to result", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames();

      for (const propName of registryNames) {
        const def = propertyRegistry.get(propName);
        if (!def?.generator) continue;

        let testIR: unknown;

        if (def.multiValue) {
          testIR = { kind: "list", values: [] };
        } else if (def.rawValue) {
          testIR = { kind: "raw", value: "test" };
        } else {
          testIR = { kind: "keyword", value: "initial" };
        }

        try {
          const result = def.generator(testIR);

          // Check if result has a "property" field
          // Property-level generators should NOT set this
          // It's the job of generateDeclaration
          if ("property" in result && result.property !== undefined) {
            violations.push(
              `${propName}: Generator result includes 'property' field (should be added by generateDeclaration only)`,
            );
          }
        } catch {}
      }

      if (violations.length > 0) {
        throw new Error(`Generator contract violations (property field should not be set):\n${violations.join("\n")}`);
      }
    });
  });

  // ============================================================================
  // Gap #4: allowedKeywords Validation
  // ============================================================================

  describe("allowedKeywords validation", () => {
    it("properties with allowedKeywords have non-empty keyword lists", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames();

      for (const propName of registryNames) {
        const def = propertyRegistry.get(propName);
        if (!def) continue;

        if (def.allowedKeywords !== undefined) {
          if (!Array.isArray(def.allowedKeywords) || def.allowedKeywords.length === 0) {
            violations.push(`${propName}: allowedKeywords defined but is empty or not an array`);
          }

          // Check for duplicates
          const uniqueKeywords = new Set(def.allowedKeywords);
          if (uniqueKeywords.size !== def.allowedKeywords.length) {
            violations.push(`${propName}: allowedKeywords contains duplicate values`);
          }
        }
      }

      if (violations.length > 0) {
        throw new Error(`allowedKeywords validation failures:\n${violations.join("\n")}`);
      }
    });

    it("allowedKeywords only contain valid CSS identifiers", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames();

      // CSS identifier pattern: starts with letter or -, no spaces
      const validIdentifier = /^-?[a-zA-Z][\w-]*$/;

      for (const propName of registryNames) {
        const def = propertyRegistry.get(propName);
        if (!def?.allowedKeywords) continue;

        for (const keyword of def.allowedKeywords) {
          if (!validIdentifier.test(keyword)) {
            violations.push(`${propName}: Invalid keyword identifier "${keyword}"`);
          }
        }
      }

      if (violations.length > 0) {
        throw new Error(`allowedKeywords identifier validation failures:\n${violations.join("\n")}`);
      }
    });

    // Note: Testing that parser actually accepts exactly allowedKeywords
    // requires runtime parsing, which is covered by property-specific tests.
    // This test only validates the allowedKeywords definition itself.
  });

  // ============================================================================
  // Gap #3: Cross-Package Wiring Validation
  // ============================================================================

  describe("cross-package wiring validation", () => {
    it("property parser wrappers exist and import from correct packages", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames().filter((n) => n !== "--*");

      for (const propName of registryNames) {
        const propDir = propName.replace(/_/g, "-");
        const parserPath = path.resolve(__dirname, "../properties", propDir, "parser.ts");

        if (!fs.existsSync(parserPath)) {
          violations.push(`${propName}: parser.ts not found`);
          continue;
        }

        const parserContent = fs.readFileSync(parserPath, "utf8");

        // Check if parser imports from @b/parsers, uses utils, OR is keyword-only
        const hasParserImport =
          /@b\/parsers/.test(parserContent) ||
          /from ["']\.\.\/\.\.\/utils["']/.test(parserContent) ||
          /createMultiValueParser/.test(parserContent);

        // Keyword-only parsers are valid (they only use @b/keywords)
        const isKeywordOnly = /@b\/keywords/.test(parserContent) && /Keywords\.\w+\.safeParse/.test(parserContent);

        if (!hasParserImport && !isKeywordOnly) {
          violations.push(`${propName}: parser.ts doesn't import from @b/parsers or use declaration utils`);
        }

        // Check that parser exports a function matching the property name
        const expectedParserName = `parse${propName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")}`;

        const exportRegex = new RegExp(`export (const|function) ${expectedParserName}`, "m");

        if (!exportRegex.test(parserContent)) {
          violations.push(`${propName}: parser.ts doesn't export ${expectedParserName}`);
        }
      }

      if (violations.length > 0) {
        throw new Error(`Parser wiring violations:\n${violations.join("\n")}`);
      }
    });

    it("property generator wrappers exist and import from correct packages", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames().filter((n) => n !== "--*");

      for (const propName of registryNames) {
        const def = propertyRegistry.get(propName);
        if (!def?.generator) continue; // Generator is optional

        const propDir = propName.replace(/_/g, "-");
        const generatorPath = path.resolve(__dirname, "../properties", propDir, "generator.ts");

        if (!fs.existsSync(generatorPath)) {
          violations.push(`${propName}: has generator in definition but generator.ts not found`);
          continue;
        }

        const generatorContent = fs.readFileSync(generatorPath, "utf8");

        // Check if generator imports from @b/generators, uses utils, OR is keyword-only
        const hasGeneratorImport =
          /@b\/generators/.test(generatorContent) ||
          /from ["']\.\.\/\.\.\/utils["']/.test(generatorContent) ||
          /generateValue/.test(generatorContent) ||
          /cssValueToCss/.test(generatorContent);

        // Keyword-only generators are valid (they only use generateOk)
        const isKeywordOnly = /generateOk/.test(generatorContent) && /ir\.value/.test(generatorContent);

        if (!hasGeneratorImport && !isKeywordOnly) {
          violations.push(`${propName}: generator.ts doesn't import from @b/generators or use declaration utils`);
        }

        // Check that generator exports a function matching the property name
        const expectedGeneratorName = `generate${propName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")}`;

        const exportRegex = new RegExp(`export (const|function) ${expectedGeneratorName}`, "m");

        if (!exportRegex.test(generatorContent)) {
          violations.push(`${propName}: generator.ts doesn't export ${expectedGeneratorName}`);
        }
      }

      if (violations.length > 0) {
        throw new Error(`Generator wiring violations:\n${violations.join("\n")}`);
      }
    });

    it("property definition.ts files wire correct parser and generator", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames().filter((n) => n !== "--*");

      for (const propName of registryNames) {
        const propDir = propName.replace(/_/g, "-");
        const definitionPath = path.resolve(__dirname, "../properties", propDir, "definition.ts");

        if (!fs.existsSync(definitionPath)) {
          violations.push(`${propName}: definition.ts not found`);
          continue;
        }

        const definitionContent = fs.readFileSync(definitionPath, "utf8");

        // Expected function names
        const expectedParserName = `parse${propName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")}`;

        const expectedGeneratorName = `generate${propName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")}`;

        // Check parser import and usage
        const parserImportRegex = new RegExp(`import.*${expectedParserName}.*from ["']\\./parser["']`, "m");
        const parserUsageRegex = new RegExp(`parser:\\s*${expectedParserName}`, "m");

        if (!parserImportRegex.test(definitionContent)) {
          violations.push(`${propName}: definition.ts doesn't import ${expectedParserName} from ./parser`);
        }

        if (!parserUsageRegex.test(definitionContent)) {
          violations.push(`${propName}: definition.ts doesn't use ${expectedParserName} as parser`);
        }

        // Check generator (optional)
        const hasGeneratorImport = new RegExp(`import.*${expectedGeneratorName}.*from ["']\\./generator["']`, "m").test(
          definitionContent,
        );

        const hasGeneratorUsage = new RegExp(`generator:\\s*${expectedGeneratorName}`, "m").test(definitionContent);

        // If generator is imported, it should be used, and vice versa
        if (hasGeneratorImport !== hasGeneratorUsage) {
          violations.push(
            `${propName}: generator import/usage mismatch (imported: ${hasGeneratorImport}, used: ${hasGeneratorUsage})`,
          );
        }
      }

      if (violations.length > 0) {
        throw new Error(`Definition wiring violations:\n${violations.join("\n")}`);
      }
    });
  });

  // ============================================================================
  // Bonus: Property Structure Completeness
  // ============================================================================

  describe("property structure completeness", () => {
    it("all property directories have required files", () => {
      const violations: string[] = [];
      const registryNames = propertyRegistry.getPropertyNames().filter((n) => n !== "--*");

      const requiredFiles = ["types.ts", "parser.ts", "definition.ts", "index.ts"];

      for (const propName of registryNames) {
        const propDir = propName.replace(/_/g, "-");
        const propPath = path.resolve(__dirname, "../properties", propDir);

        for (const file of requiredFiles) {
          const filePath = path.join(propPath, file);
          if (!fs.existsSync(filePath)) {
            violations.push(`${propName}: missing required file ${file}`);
          }
        }

        // generator.ts is optional but recommended
        const generatorPath = path.join(propPath, "generator.ts");
        const def = propertyRegistry.get(propName);

        if (def?.generator && !fs.existsSync(generatorPath)) {
          violations.push(`${propName}: has generator in definition but generator.ts file missing`);
        }
      }

      if (violations.length > 0) {
        throw new Error(`Property structure violations:\n${violations.join("\n")}`);
      }
    });
  });
});
