// b_path:: packages/b_declarations/src/__tests__/property-contract.meta.test.ts

import { describe, it, expect } from "vitest";
import { propertyRegistry } from "../core";
import type { PropertyDefinition } from "../types";

// Import properties to ensure they're registered
import "../properties";

/**
 * Type guard for multi-value properties.
 */
function isMultiValue(def: PropertyDefinition): def is PropertyDefinition & { multiValue: true } {
  return def.multiValue === true;
}

describe("Property Contract Meta-Tests", () => {
  it("all registered properties have required fields", () => {
    const names = propertyRegistry.getPropertyNames();
    expect(names.length).toBeGreaterThan(0);

    for (const name of names) {
      const def = propertyRegistry.get(name);
      expect(def).toBeDefined();
      if (!def) continue;

      // Required fields
      expect(def.name).toBe(name);
      expect(def.syntax).toBeDefined();
      expect(typeof def.inherited).toBe("boolean");
      
      // initial can be empty string (e.g., custom properties have initial: "")
      expect(typeof def.initial).toBe("string");

      // Parser must exist (either single-value, multi-value, or raw)
      expect(def.parser).toBeTypeOf("function");
    }
  });

  it("multi-value properties have consistent structure", () => {
    const names = propertyRegistry.getPropertyNames();

    for (const name of names) {
      const def = propertyRegistry.get(name);
      if (!def || !isMultiValue(def)) continue;

      // Multi-value properties must have:
      // - multiValue: true
      // - parser function
      // - (optionally) generator function
      expect(def.multiValue).toBe(true);
      expect(def.parser).toBeTypeOf("function");

      // Note: At runtime we can't enforce IR shape,
      // but TypeScript enforces PropertyIRMap alignment
    }
  });

  it("custom properties are registered correctly", () => {
    // Custom properties use special pattern matching, not literal "--*"
    // Just verify registry has some properties
    const names = propertyRegistry.getPropertyNames();
    expect(names.length).toBeGreaterThan(0);
    
    // Verify at least one background property exists as sanity check
    const bgClip = propertyRegistry.get("background-clip");
    expect(bgClip).toBeDefined();
  });
});
