# How to Add a CSS Property

**Purpose:** Add support for a new CSS property to the library.

**Time estimate:** 30-60 minutes per property

---

## 📋 Prerequisites

1. **MDN Schema** - Property definition from MDN data
2. **Property name** - e.g., `color`, `margin-top`, `background-image`
3. **Syntax** - CSS value syntax (from MDN formal syntax)

---

## 🎯 High-Level Flow

```
1. Generate (IR → CSS)
   └─ keyword → unit → type → test → implementation
   
2. Parse (CSS → IR)
   └─ test → implementation
   
3. Register (add to registry)
```

**Why generate first?** Easier to validate - you control the IR structure.

---

## 📁 File Structure

```
packages/b_declarations/src/properties/{property-name}/
├── types.ts           # IR type definition
├── generator.ts       # IR → CSS
├── generator.test.ts  # Generation tests
├── parser.ts          # CSS → IR
├── parser.test.ts     # Parser tests
├── definition.ts      # Property registration
├── definition.test.ts # Registry tests
└── index.ts          # Barrel export
```

---

## 🛠️ Available Utilities

### From `@b/keywords`
```typescript
import { NamedColor, SystemColor } from "@b/keywords";
// Pre-defined keyword enums
```

### From `@b/units`
```typescript
import { LengthAbsolute, Percentage } from "@b/units";
// Unit type definitions
```

### From `@b/types`
```typescript
import { 
  parseOk, parseErr,      // Result constructors
  generateOk, generateErr,
  createError,             // Issue creators
  createWarning,
  type ParseResult,        // Result types
  type GenerateResult
} from "@b/types";
```

### From `@b/generators`
```typescript
import { generateColor } from "@b/generators/color";
import { generateLength } from "@b/generators/length";
import { generateAngle } from "@b/generators/angle";
// Reusable generators for common value types
```

### From `@b/parsers`
```typescript
import { parseColor } from "@b/parsers/color";
import { parseLength } from "@b/parsers/length";
import { parseAngle } from "@b/parsers/angle";
// Reusable parsers for common value types
```

### From `@b/utils`
```typescript
import { parseCSSValue } from "@b/utils/parse";
// CSS-tree helpers
```

---

## 📝 Step-by-Step Protocol

### Step 1: Create Property Directory

```bash
mkdir -p packages/b_declarations/src/properties/{property-name}
cd packages/b_declarations/src/properties/{property-name}
```

### Step 2: Define IR Type

**`types.ts`**
```typescript
// Simple value (e.g., color)
export interface ColorIR {
  kind: "color";
  value: ColorValue; // Reuse from @b/types
}

// Keyword value (e.g., display)
export interface DisplayIR {
  kind: "keyword";
  value: "block" | "inline" | "none";
}

// Complex value (e.g., background-image)
export interface BackgroundImageIR {
  kind: "layers";
  layers: BackgroundLayer[];
}
```

**Pattern:** Always have a `kind` field for discriminated unions.

### Step 3: Generate Tests First

**`generator.test.ts`**
```typescript
import { describe, it, expect } from "vitest";
import { generateColor } from "./generator";

describe("generateColor", () => {
  it("should generate named color", () => {
    const ir = { kind: "color", value: "red" };
    const result = generateColor(ir);
    
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("red");
    }
  });
  
  // Add more test cases
});
```

### Step 4: Implement Generator

**`generator.ts`**
```typescript
import { generateOk, generateErr, createError } from "@b/types";
import type { ColorIR } from "./types";

export function generateColor(ir: ColorIR): GenerateResult {
  // Validate IR structure
  if (!ir.value) {
    return generateErr(createError("missing-required-field", "Missing color value"));
  }
  
  // Generate CSS string
  return generateOk(ir.value);
}
```

**Run tests:** `pnpm test generator.test.ts`

### Step 5: Parse Tests

**`parser.test.ts`**
```typescript
import { describe, it, expect } from "vitest";
import { generate } from "@eslint/css-tree";
import { parseOk } from "@b/types";
import { parseColor } from "./parser";

describe("parseColor", () => {
  it("should parse named color", () => {
    // Create AST node for testing
    const input = "red";
    const result = parseColor(input); // Multi-value parser
    
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("color");
      expect(result.value.value).toBe("red");
    }
  });
});
```

### Step 6: Implement Parser

**`parser.ts`**
```typescript
import { parseOk, parseErr, createError } from "@b/types";
import type { ParseResult } from "@b/types";
import type { ColorIR } from "./types";

// Single-value parser (receives AST node)
export function parseColor(node: Value): ParseResult<ColorIR> {
  if (node.type !== "Identifier") {
    return parseErr(createError("invalid-syntax", "Expected color"));
  }
  
  return parseOk({
    kind: "color",
    value: node.name
  });
}
```

**Or multi-value parser (receives string):**
```typescript
import { parseCSSValue } from "@b/utils";

export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  // Parse with css-tree
  const ast = parseCSSValue(value);
  
  // Process AST...
  
  return parseOk({ kind: "layers", layers: [] });
}
```

**Run tests:** `pnpm test parser.test.ts`

### Step 7: Register Property

**`definition.ts`**
```typescript
import { defineProperty } from "../../core/registry";
import { parseColor } from "./parser";
import { generateColor } from "./generator";

defineProperty({
  name: "color",
  syntax: "<color>",
  parser: parseColor,
  generator: generateColor,
  inherited: true,
  initial: "black",
});
```

**For multi-value properties:**
```typescript
defineProperty({
  name: "background-image",
  syntax: "<bg-image>#",
  parser: parseBackgroundImage,
  generator: generateBackgroundImage,
  multiValue: true,  // ⚠️ Important!
  inherited: false,
  initial: "none",
});
```

### Step 8: Add Barrel Export

**`index.ts`**
```typescript
export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
```

### Step 9: Register in Package

**`packages/b_declarations/src/properties/index.ts`**
```typescript
export * from "./color";  // Add this line
```

### Step 10: Add Tests & Verify

**`definition.test.ts`**
```typescript
import { describe, it, expect } from "vitest";
import "./definition"; // Import to register
import { parseDeclaration } from "../../parser";

describe("color property", () => {
  it("should be registered", () => {
    const result = parseDeclaration("color: red");
    expect(result.ok).toBe(true);
  });
});
```

**Run all checks:**
```bash
pnpm test color  # Run all color tests
just check       # Format, lint, typecheck
just build       # Verify builds
```

---

## 🎯 Key Patterns

### 1. Parser Type Detection

**Single-value:** Property takes one value
```typescript
parser: (node: Value) => ParseResult<T>
multiValue: undefined
```

**Multi-value:** Property takes comma-separated list
```typescript
parser: (value: string) => ParseResult<T>
multiValue: true
```

### 2. IR Structure

Always use discriminated unions with `kind`:
```typescript
type ColorIR = 
  | { kind: "named"; value: string }
  | { kind: "hex"; value: string }
  | { kind: "rgb"; r: number; g: number; b: number };
```

### 3. Error Handling

```typescript
// Parse errors
return parseErr(createError("invalid-syntax", "Message"));

// Generate errors
return generateErr(createError("invalid-ir", "Message"));

// Warnings
const warning = createWarning("deprecated-syntax", "Message");
return { ...parseOk(ir), issues: [warning] };
```

### 4. Reuse Existing Types

Don't reinvent the wheel:
```typescript
import type { ColorValue } from "@b/types";
import { generateColor } from "@b/generators";
```

---

## 📊 Example: Simple Property (color)

**MDN Schema:**
```json
{
  "name": "color",
  "syntax": "<color>",
  "inherited": true,
  "initial": "black"
}
```

**Implementation:** See `packages/b_declarations/src/properties/custom-property/`

---

## 📊 Example: Complex Property (background-image)

**MDN Schema:**
```json
{
  "name": "background-image",
  "syntax": "<bg-image>#",
  "inherited": false,
  "initial": "none"
}
```

**Implementation:** See `packages/b_declarations/src/properties/background-image/`

---

## ✅ Checklist

- [ ] Created property directory
- [ ] Defined IR type in `types.ts`
- [ ] Wrote generator tests
- [ ] Implemented generator
- [ ] Wrote parser tests
- [ ] Implemented parser
- [ ] Created `definition.ts`
- [ ] Added barrel export
- [ ] Registered in package
- [ ] All tests passing
- [ ] `just check` passing
- [ ] `just build` passing

---

## 🚨 Common Pitfalls

1. **Forgetting `multiValue: true`** for comma-separated properties
2. **Not handling all keyword variants** (check MDN syntax)
3. **Forgetting to export from package** `properties/index.ts`
4. **Not reusing existing parsers/generators**
5. **Missing discriminated union `kind` field**

---

## 🎯 Next Steps

After adding a property:
1. Test integration: `parseDeclaration("property: value")`
2. Add to type map if needed
3. Update documentation
4. Commit with `feat(b_declarations): add {property} support`

---

**Questions? Check existing implementations:**
- Simple: `custom-property/`
- Complex: `background-image/`
