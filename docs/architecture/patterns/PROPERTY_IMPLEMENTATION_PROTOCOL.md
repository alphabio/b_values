# Property Implementation Protocol

**Purpose:** Fool-proof process for implementing new CSS properties at scale

**Date:** 2025-11-12

**Status:** ACTIVE - This is the ONE TRUE WAY to implement properties

---

## 🎯 Core Philosophy

**We implement properties DECLARATIVELY, not imperatively.**

1. **Detect patterns FIRST** → Identify reusable CSS value types
2. **Implement dependencies** → Create shared types/parsers/generators if needed
3. **Scaffold property** → Wire everything together
4. **Test & validate** → Ensure correctness

**NO guesswork. NO "generate everything then delete". NO shortcuts.**

---

## 📋 The 5-Phase Protocol

### Phase 1: CSS Value Pattern Detection

**Goal:** Identify ALL CSS value types used by the property

**Process:**

1. **Get the official CSS syntax** from MDN or CSS specs
2. **Extract all `<value-types>`** in angle brackets
3. **For each value type**, classify using the decision tree

**Example: background-blend-mode**

```
Syntax: <blend-mode>#

Extract: <blend-mode>

Classify:
- Pure keywords? YES (normal, multiply, screen, ...)
- Used by multiple properties? YES (background-blend-mode, mix-blend-mode)
→ Category: REUSABLE KEYWORDS
→ Location: @b/keywords/src/blend-mode.ts
```

**Deliverable:** Dependency checklist

```markdown
## background-blend-mode Dependencies

- [ ] Keywords: <blend-mode> (REUSABLE, needs implementation)
- [ ] Types: None
- [ ] Parsers: BlendMode.parse (REUSABLE, needs implementation)
- [ ] Generators: BlendMode.generate (REUSABLE, needs implementation)
```

**Reference:** See `docs/architecture/patterns/CSS_VALUE_PATTERN_DETECTION.md`

---

### Phase 2: Dependency Audit

**Goal:** Verify which dependencies exist vs need implementation

**Process:**

1. **Check @b/keywords** for existing keyword enums
2. **Check @b/types** for existing type schemas
3. **Check @b/parsers** for existing parsers
4. **Check @b/generators** for existing generators

**Commands:**

```bash
# Search for existing keywords
grep -r "export const blendMode" packages/b_keywords/src/

# Search for existing types
grep -r "export const blendModeSchema" packages/b_types/src/

# Search for existing parsers
grep -r "export const BlendMode" packages/b_parsers/src/

# Search for existing generators
grep -r "export const BlendMode" packages/b_generators/src/
```

**Deliverable:** Audit report

```markdown
## Dependency Audit Results

✅ READY (exists, no action needed):
- Keywords.cssWide
- Parsers.CssValue.parse
- Generators.CssValue.generate

❌ MISSING (needs implementation):
- Keywords.blendMode
- BLEND_MODE array
- Parsers.BlendMode.parse
- Generators.BlendMode.generate

📊 Status: BLOCKED - Must implement 4 missing dependencies
```

---

### Phase 3: Implement Missing Dependencies

**Goal:** Create all reusable types/parsers/generators identified as MISSING

**Process:** For each missing dependency, follow the appropriate guide:

#### 3A. Implement Reusable Keyword Enum

**If:** Pure keyword enum (no units, no functions)

**Location:** `@b/keywords/src/<type>.ts`

**Template:**

```typescript
// @b/keywords/src/blend-mode.ts
import { getLiteralValues } from "./utils";
import { z } from "zod";

/**
 * Blend mode keywords for compositing operations
 * @see https://drafts.fxtf.org/compositing/#ltblendmodegt
 */
export const blendMode = z.union([
  z.literal("normal"),
  z.literal("multiply"),
  z.literal("screen"),
  // ... all keywords from spec
]);

export const BLEND_MODE = getLiteralValues(blendMode);
export type BlendMode = z.infer<typeof blendMode>;
```

**Export from index:**

```typescript
// @b/keywords/src/index.ts
export * from "./blend-mode";
```

**Then implement parser:**

```typescript
// @b/parsers/src/blend-mode.ts
import { parseOk, parseErr, createError, type ParseResult } from "@b/types";
import { BLEND_MODE, type BlendMode } from "@b/keywords";

export function parse(value: string): ParseResult<BlendMode> {
  const normalized = value.toLowerCase();
  
  if (BLEND_MODE.includes(normalized as BlendMode)) {
    return parseOk(normalized as BlendMode);
  }
  
  return parseErr(
    "blend-mode",
    createError("invalid-value", `Invalid blend mode: ${value}`)
  );
}

// Export as namespace for consistency
export const BlendMode = { parse };
```

**Export from index:**

```typescript
// @b/parsers/src/index.ts
export * as BlendMode from "./blend-mode";
```

**Then implement generator:**

```typescript
// @b/generators/src/blend-mode.ts
import { generateOk, type GenerateResult } from "@b/types";
import type { BlendMode } from "@b/keywords";

export function generate(value: BlendMode): GenerateResult {
  return generateOk(value);
}

// Export as namespace for consistency
export const BlendMode = { generate };
```

**Export from index:**

```typescript
// @b/generators/src/index.ts
export * as BlendMode from "./blend-mode";
```

---

#### 3B. Implement Reusable Type

**If:** Complex type with units or structured data

**Location:** `@b/types/src/<category>/<type>.ts`

**Example:** See existing implementations like:
- `@b/types/src/length/index.ts`
- `@b/types/src/color/index.ts`
- `@b/types/src/image/index.ts`

**Follow established patterns** for parsers and generators in corresponding packages.

---

#### 3C. Implement Reusable Function Type

**If:** Function-based values used by multiple properties

**Location:** `@b/types/src/<category>/function.ts`

**Example:** Transform functions, filter functions, etc.

**Follow established patterns** for complex function parsers/generators.

---

### Phase 4: Scaffold Property

**Goal:** Create property directory with all boilerplate

**Process:**

1. **Create property directory structure**
2. **Implement types.ts** (IR schema)
3. **Implement parser.ts** (delegates to shared parsers)
4. **Implement generator.ts** (delegates to shared generators)
5. **Implement definition.ts** (wire it all together)
6. **Create test files** (parser.test.ts, generator.test.ts)
7. **Export from index.ts**

#### 4A. Create Directory Structure

```bash
mkdir -p packages/b_declarations/src/properties/background-blend-mode
cd packages/b_declarations/src/properties/background-blend-mode
```

#### 4B. Implement types.ts

**Pattern:** Multi-value list property (background-* family)

```typescript
// packages/b_declarations/src/properties/background-blend-mode/types.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

/**
 * background-blend-mode value with universal CSS function support.
 * Can be a blend mode keyword OR a CssValue (var(), attr(), etc.)
 */
const backgroundBlendModeValueSchema = z.union([
  Keywords.blendMode,  // ← Reuse from @b/keywords
  cssValueSchema,
]);

export type BackgroundBlendModeValue = z.infer<typeof backgroundBlendModeValueSchema>;

/**
 * The final IR for the entire `background-blend-mode` property.
 */
export const backgroundBlendModeIRSchema = z.discriminatedUnion("kind", [
  // CSS-wide keyword (inherit, initial, unset, revert)
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  
  // List of blend mode values (comma-separated, one per layer)
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundBlendModeValueSchema).min(1),
  }),
]);

export type BackgroundBlendModeIR = z.infer<typeof backgroundBlendModeIRSchema>;
```

#### 4C. Implement parser.ts

```typescript
// packages/b_declarations/src/properties/background-blend-mode/parser.ts
import type * as csstree from "@eslint/css-tree";
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import * as Ast from "@b/utils";
import { createMultiValueParser } from "../../utils";
import type { BackgroundBlendModeIR, BackgroundBlendModeValue } from "./types";

/**
 * Parse background-blend-mode property value.
 * Syntax: <blend-mode>#
 */
export const parseBackgroundBlendMode = createMultiValueParser<
  BackgroundBlendModeValue,
  BackgroundBlendModeIR
>({
  propertyName: "background-blend-mode",

  itemParser(valueNode: csstree.Value): ParseResult<BackgroundBlendModeValue> {
    const nodes = Ast.nodeListToArray(valueNode.children);
    const node = nodes[0];

    // Try to parse as blend mode keyword
    if (Ast.isIdentifier(node)) {
      const result = Parsers.BlendMode.parse(node.name);  // ← Reuse parser
      if (result.ok) return result;
    }

    // Fall back to CSS value (var, attr, etc.)
    return Parsers.CssValue.parse(node);
  },

  aggregator(values: BackgroundBlendModeValue[]): BackgroundBlendModeIR {
    return { kind: "list", values };
  },
});
```

#### 4D. Implement generator.ts

```typescript
// packages/b_declarations/src/properties/background-blend-mode/generator.ts
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundBlendModeIR } from "./types";

/**
 * Generate CSS string for background-blend-mode property.
 */
export function generateBackgroundBlendMode(ir: BackgroundBlendModeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const layerStrings: string[] = [];
  
  for (const value of ir.values) {
    const result = generateValue(value, (v) => {
      // If string, it's a blend mode keyword
      if (typeof v === "string") {
        return Generators.BlendMode.generate(v);  // ← Reuse generator
      }
      // Otherwise it's a CssValue
      return Generators.CssValue.generate(v);
    });
    
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "));
}
```

#### 4E. Implement definition.ts

```typescript
// packages/b_declarations/src/properties/background-blend-mode/definition.ts
import { defineProperty } from "../../core";
import { parseBackgroundBlendMode } from "./parser";
import { generateBackgroundBlendMode } from "./generator";
import type { BackgroundBlendModeIR } from "./types";

export const backgroundBlendMode = defineProperty<BackgroundBlendModeIR>({
  name: "background-blend-mode",
  syntax: "<blend-mode>#",
  parser: parseBackgroundBlendMode,
  generator: generateBackgroundBlendMode,
  inherited: false,
  initial: "normal",
});
```

#### 4F. Create Tests

```typescript
// packages/b_declarations/src/properties/background-blend-mode/parser.test.ts
import { describe, it, expect } from "vitest";
import { parseDeclaration } from "../../../index";

describe("background-blend-mode parser", () => {
  it("parses single blend mode", () => {
    const result = parseDeclaration("background-blend-mode: multiply");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ir.kind).toBe("list");
      expect(result.value.ir.values).toHaveLength(1);
      expect(result.value.ir.values[0]).toBe("multiply");
    }
  });

  it("parses multiple blend modes (layers)", () => {
    const result = parseDeclaration("background-blend-mode: multiply, screen, overlay");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ir.kind).toBe("list");
      expect(result.value.ir.values).toHaveLength(3);
      expect(result.value.ir.values).toEqual(["multiply", "screen", "overlay"]);
    }
  });

  it("parses CSS-wide keywords", () => {
    const result = parseDeclaration("background-blend-mode: inherit");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ir.kind).toBe("keyword");
      expect(result.value.ir.value).toBe("inherit");
    }
  });

  it("rejects invalid blend mode", () => {
    const result = parseDeclaration("background-blend-mode: invalid-mode");
    expect(result.ok).toBe(false);
  });
});
```

```typescript
// packages/b_declarations/src/properties/background-blend-mode/generator.test.ts
import { describe, it, expect } from "vitest";
import { generateBackgroundBlendMode } from "./generator";

describe("background-blend-mode generator", () => {
  it("generates single blend mode", () => {
    const result = generateBackgroundBlendMode({
      kind: "list",
      values: ["multiply"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("multiply");
    }
  });

  it("generates multiple blend modes (layers)", () => {
    const result = generateBackgroundBlendMode({
      kind: "list",
      values: ["multiply", "screen", "overlay"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("multiply, screen, overlay");
    }
  });

  it("generates CSS-wide keywords", () => {
    const result = generateBackgroundBlendMode({
      kind: "keyword",
      value: "inherit",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("inherit");
    }
  });
});
```

#### 4G. Export from index.ts

```typescript
// packages/b_declarations/src/properties/background-blend-mode/index.ts
export { backgroundBlendMode } from "./definition";
export type { BackgroundBlendModeIR } from "./types";
```

#### 4H. Register in property registry

```typescript
// packages/b_declarations/src/registry.ts
import { backgroundBlendMode } from "./properties/background-blend-mode";

export const propertyRegistry = {
  // ... existing properties
  "background-blend-mode": backgroundBlendMode,
};
```

---

### Phase 5: Test & Validate

**Goal:** Ensure implementation is correct and complete

**Process:**

1. **Run type checks** → `pnpm typecheck`
2. **Run unit tests** → `pnpm test background-blend-mode`
3. **Run linter** → `pnpm lint`
4. **Manual validation** → Test edge cases

**Commands:**

```bash
# Type checking
pnpm typecheck

# Run specific property tests
pnpm test background-blend-mode

# Run all tests
pnpm test

# Lint
pnpm lint

# Build
pnpm build
```

**Validation checklist:**

```markdown
- [ ] TypeScript compiles without errors
- [ ] All unit tests pass
- [ ] Linter passes
- [ ] Parser handles valid values
- [ ] Parser rejects invalid values
- [ ] Parser handles CSS-wide keywords
- [ ] Parser handles CSS functions (var, calc, etc.)
- [ ] Generator produces valid CSS
- [ ] Round-trip (parse → generate → parse) works
```

---

## 🎯 Decision Matrix: Which Pattern?

| Property Syntax | IR Pattern | Example |
|----------------|------------|---------|
| Single keyword or value | `{ kind: "keyword" \| "value" }` | `mix-blend-mode`, `opacity` |
| List of values (comma-separated) | `{ kind: "keyword" \| "list", values: [] }` | `background-blend-mode`, `background-image` |
| Special 2D structure | `{ kind: "keyword" \| "value", value: { x, y } }` | `background-position` |
| Complex union | Custom discriminated union | Property-specific |

**Reference existing properties:**
- Single value: `background-color`, `opacity`
- Multi-value list: `background-image`, `background-size`
- Composite longhand: `background-position`

---

## 📊 Cheat Sheet: File Checklist

For EVERY new property, create these files:

```
packages/b_declarations/src/properties/<property-name>/
├── types.ts           # IR schema (REQUIRED)
├── parser.ts          # Parser function (REQUIRED)
├── generator.ts       # Generator function (REQUIRED)
├── definition.ts      # defineProperty call (REQUIRED)
├── parser.test.ts     # Parser tests (REQUIRED)
├── generator.test.ts  # Generator tests (REQUIRED)
└── index.ts           # Barrel exports (REQUIRED)
```

**DO NOT create:**
- ❌ Property-specific keyword files (use @b/keywords)
- ❌ Property-specific parser utilities (use @b/parsers)
- ❌ Property-specific generator utilities (use @b/generators)
- ❌ Duplicate logic from existing properties

**ONLY IF truly property-specific:**
- ✅ Custom IR structures (rare, document why)
- ✅ Complex parsing logic unique to this property (rare)

---

## ⚠️ Common Pitfalls

### ❌ WRONG: Implementing reusable patterns in property directory

```typescript
// packages/b_declarations/src/properties/background-blend-mode/blend-mode.ts
// ❌ DON'T DO THIS - blend-mode is reusable!
```

### ✅ RIGHT: Implementing reusable patterns in shared packages

```typescript
// packages/b_keywords/src/blend-mode.ts
// ✅ DO THIS - make it reusable for mix-blend-mode too
```

---

### ❌ WRONG: Switching on property name in parsers/generators

```typescript
if (propertyName === "background-blend-mode") {
  // ❌ DON'T - parsers should be property-agnostic
}
```

### ✅ RIGHT: Pure value parsing/generation

```typescript
export function parse(value: string): ParseResult<BlendMode> {
  // ✅ Parse the VALUE, not the property
}
```

---

### ❌ WRONG: Generating everything then deleting

```bash
# Generate all boilerplate...
# ... now delete what you don't need
# ❌ Chaos, inconsistency, mistakes
```

### ✅ RIGHT: Declarative dependency-driven generation

```bash
# 1. Detect patterns
# 2. Check what exists
# 3. Implement ONLY what's missing
# 4. Scaffold property
# ✅ Clean, consistent, scalable
```

---

## 🚀 This Protocol Scales to 50+ Properties

**Follow this protocol for EVERY new property.**

**Do not deviate. Do not take shortcuts. Do not guess.**

**This is the foundation for scaling to 50+ properties with consistency and quality.**
