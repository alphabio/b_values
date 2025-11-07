# 🎯 Action Plan: CSS Custom Properties (--\*)

## 📋 Research Summary

**From MDN Spec:**

- Custom properties accept `<declaration-value>` = any sequence of valid tokens
- Values stored as **unparsed token streams** (no interpretation until `var()` usage)
- **Case-sensitive**: `--my-color` ≠ `--My-color`
- No transformation needed - store as raw string

---

## 🏗️ Implementation Plan

### **Phase 1: Type Definitions**

#### 1.1 Create Property IR Type

**File:** `packages/b_declarations/src/properties/custom-property/types.ts`

```typescript
/**
 * Custom property IR (--*)
 * Stores value as unparsed string per CSS spec
 */
export type CustomPropertyIR =
  | { kind: "keyword"; value: string } // inherit, initial, unset, revert
  | { kind: "value"; value: string }; // raw token stream
```

---

#### 1.2 Add to PropertyIRMap

**File:** `packages/b_declarations/src/types.ts`

```typescript
export interface PropertyIRMap {
  "background-image": BackgroundImageIR;
  [key: `--${string}`]: CustomPropertyIR; // ← Add this (index signature)
}
```

---

### **Phase 2: Parser Implementation**

#### 2.1 Create Parser

**File:** `packages/b_declarations/src/properties/custom-property/parser.ts`

**Architecture:** **MultiValueParser** (receives string directly)

```typescript
import type { ParseResult } from "@b/types";
import { parseOk, parseErr, createError } from "@b/types";
import { isCSSWideKeyword, parseCSSWideKeyword } from "../../utils";
import type { CustomPropertyIR } from "./types";

/**
 * Parse custom property value
 * Stores raw string per CSS spec (no interpretation)
 */
export function parseCustomProperty(value: string): ParseResult<CustomPropertyIR> {
  const trimmed = value.trim();

  // Handle CSS-wide keywords
  if (isCSSWideKeyword(trimmed)) {
    const result = parseCSSWideKeyword(trimmed);
    if (result.ok) {
      return parseOk({ kind: "keyword", value: result.value });
    }
  }

  // Empty value is invalid
  if (trimmed === "") {
    return parseErr(createError("missing-value", "Custom property value cannot be empty"));
  }

  // Store as-is (unparsed token stream)
  return parseOk({ kind: "value", value: trimmed });
}
```

**Key Points:**

- No AST parsing needed - just string validation
- Case-sensitive (no toLowerCase)
- Preserve whitespace (after trim)
- CSS-wide keywords only

---

### **Phase 3: Generator Implementation**

#### 3.1 Create Generator

**File:** `packages/b_declarations/src/properties/custom-property/generator.ts`

```typescript
import type { GenerateResult } from "@b/types";
import { generateOk } from "@b/types";
import type { CustomPropertyIR } from "./types";

/**
 * Generate CSS from custom property IR
 */
export function generateCustomProperty(ir: CustomPropertyIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  // Return raw value (no transformation)
  return generateOk(ir.value);
}
```

---

### **Phase 4: Property Definition**

#### 4.1 Create Definition

**File:** `packages/b_declarations/src/properties/custom-property/definition.ts`

```typescript
import { defineProperty } from "../../core";
import { parseCustomProperty } from "./parser";
import { generateCustomProperty } from "./generator";
import type { CustomPropertyIR } from "./types";

/**
 * Custom property definition (--*)
 * Note: This is a template - actual properties are dynamic
 */
export const customProperty = defineProperty<CustomPropertyIR>({
  name: "--*", // Placeholder
  syntax: "<declaration-value>",
  parser: parseCustomProperty,
  multiValue: false, // Parser receives string but not comma-separated
  generator: generateCustomProperty,
  inherited: true, // Custom properties inherit by default
  initial: "", // No universal initial value
});
```

---

#### 4.2 Create Barrel Export

**File:** `packages/b_declarations/src/properties/custom-property/index.ts`

```typescript
export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
```

---

#### 4.3 Update Properties Index

**File:** `packages/b_declarations/src/properties/index.ts`

```typescript
export * from "./background-image";
export * from "./custom-property"; // ← Add this
```

---

### **Phase 5: Core Registry Enhancement**

#### 5.1 Update Registry to Handle Dynamic Properties

**File:** `packages/b_declarations/src/core/registry.ts`

Add method to detect custom properties:

```typescript
/**
 * Check if a property name is a custom property (--*)
 */
export function isCustomProperty(name: string): boolean {
  return name.startsWith("--") && name.length > 2;
}

/**
 * Get property definition with custom property fallback
 */
export function getPropertyDefinition(name: string): PropertyDefinition | undefined {
  // Try exact match first
  const definition = propertyRegistry.get(name);
  if (definition) return definition;

  // Fallback for custom properties
  if (isCustomProperty(name)) {
    return customProperty; // Use template definition
  }

  return undefined;
}
```

---

### **Phase 6: Testing**

#### 6.1 Create Test Files (Co-located)

**Files:**

- `packages/b_declarations/src/properties/custom-property/parser.test.ts`
- `packages/b_declarations/src/properties/custom-property/generator.test.ts`
- `packages/b_declarations/src/properties/custom-property/definition.test.ts`

**Test Cases (~30 tests):**

```typescript
describe("parseCustomProperty", () => {
  describe("keywords", () => {
    it("should parse 'inherit'");
    it("should parse 'initial'");
    it("should parse 'unset'");
    it("should parse 'revert'");
  });

  describe("simple values", () => {
    it("should parse keyword: --my-color: blue");
    it("should parse hex: --my-color: #123456");
    it("should parse number: --my-spacing: 10");
    it("should parse unit: --my-width: 10px");
    it("should preserve case: --My-Color vs --my-color");
  });

  describe("complex values", () => {
    it("should parse: --shadow: 3px 6px rgb(20 32 54)");
    it("should parse: --gradient: linear-gradient(red, blue)");
    it("should parse: --calc: calc(100% - 20px)");
    it("should parse: --multi: 1px solid red");
    it("should preserve whitespace");
  });

  describe("edge cases", () => {
    it("should reject empty value");
    it("should handle leading/trailing whitespace");
    it("should preserve internal whitespace");
  });

  describe("round-trip", () => {
    it("should round-trip simple values");
    it("should round-trip complex values");
    it("should preserve exact formatting");
  });

  describe("case sensitivity", () => {
    it("--my-color and --My-Color are different");
  });
});
```

---

### **Phase 7: Utilities**

No new utilities needed! Custom properties are intentionally simple.

**Existing utilities we'll use:**

- `isCSSWideKeyword` from `packages/b_declarations/src/utils/keywords.ts`
- `parseCSSWideKeyword` from same file

---

## 📦 File Summary

### **New Files to Create:**

1. `packages/b_declarations/src/properties/custom-property/types.ts`
2. `packages/b_declarations/src/properties/custom-property/parser.ts`
3. `packages/b_declarations/src/properties/custom-property/parser.test.ts`
4. `packages/b_declarations/src/properties/custom-property/generator.ts`
5. `packages/b_declarations/src/properties/custom-property/generator.test.ts`
6. `packages/b_declarations/src/properties/custom-property/definition.ts`
7. `packages/b_declarations/src/properties/custom-property/definition.test.ts`
8. `packages/b_declarations/src/properties/custom-property/index.ts`

### **Files to Modify:**

1. `packages/b_declarations/src/properties/index.ts` - add export
2. `packages/b_declarations/src/types.ts` - add to PropertyIRMap
3. `packages/b_declarations/src/core/registry.ts` - add dynamic lookup

**Total:** 8 new files, 3 modifications

---

## 🎯 Implementation Order

1. ✅ **Types** → IR definition (simplest)
2. ✅ **Parser** → String validation only
3. ✅ **Parser Tests** → Comprehensive coverage
4. ✅ **Generator** → Pass-through
5. ✅ **Generator Tests** → Round-trip validation
6. ✅ **Definition** → Tie it together
7. ✅ **Definition Tests** → Metadata validation
8. ✅ **Registry** → Dynamic lookup
9. ✅ **Integration** → Add to exports

---

## ⚡ Key Design Decisions

1. **No AST parsing** - custom properties store raw strings
2. **Case-sensitive** - no normalization
3. **MultiValueParser signature** - receives string directly (not comma-separated list)
4. **Dynamic registry** - handle any `--*` property
5. **Minimal validation** - only check non-empty + CSS-wide keywords
6. **No type inference** - no attempt to parse color/length/etc
7. **Co-located tests** - following established pattern

---

## �� Test Strategy

- **Unit tests:** Parser, generator, round-trip
- **Edge cases:** Empty, whitespace, case sensitivity
- **Integration:** Registry lookup for `--any-name`
- **Examples:** All value types from spec

**Estimated:** ~30 tests across 3 test files

---

## ✅ Definition of Done

- [ ] All 8 new files created
- [ ] All 3 files modified
- [ ] ~30 tests written and passing
- [ ] No type errors
- [ ] No lint warnings
- [ ] Build succeeds
- [ ] Round-trip works for all examples
- [ ] Registry handles dynamic `--*` lookup

---

**Pattern Established:** Co-locate tests (parser.test.ts, generator.test.ts, definition.test.ts)
