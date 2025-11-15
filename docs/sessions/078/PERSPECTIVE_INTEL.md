# Wave 4: Perspective Properties - Intelligence Gathering

**Date:** 2025-11-15
**Scope:** 2 properties (perspective, perspective-origin)
**Estimate:** 45 minutes
**Goal:** Complete 3D transform capabilities

---

## 🎯 Properties Overview

### 1. `perspective`

**Purpose:** Sets distance from viewer to z=0 plane for 3D transforms

**Syntax:**

```css
perspective:
  none | <length [0,
  ∞]>;
```

**Examples:**

```css
perspective: none; /* No perspective (default) */
perspective: 500px; /* 500px from viewer */
perspective: 1000px; /* Further away = less dramatic */
perspective: var(--depth); /* CSS variable */
perspective: calc(100vh - 200px); /* Calculated */
```

**Valid values:**

- `none` - No perspective transformation
- `<length>` - Distance in px, em, rem, etc. (MUST be positive, 0 invalid)

**Invalid values:**

- `0` - Zero not allowed (would create singularity)
- Negative lengths
- Percentages (not allowed in perspective)

**Spec:** https://drafts.csswg.org/css-transforms-2/#perspective-property

---

### 2. `perspective-origin`

**Purpose:** Vanishing point for 3D transforms (where perspective converges)

**Syntax:**

```css
perspective-origin: <position>;
```

**Examples:**

```css
perspective-origin: center; /* 50% 50% (default) */
perspective-origin: top left; /* 0% 0% */
perspective-origin: 100px 200px; /* Absolute offsets */
perspective-origin: 50% 50%; /* Center (explicit) */
perspective-origin: left 20px top 30px; /* 4-value syntax */
perspective-origin: var(--vanishing-point); /* Variable */
```

**Valid values:**

- `<position>` - Same as background-position
  - 1-value: x-axis (y defaults to center)
  - 2-value: x y
  - 4-value: x-keyword x-offset y-keyword y-offset
  - Keywords: left, center, right, top, bottom
  - Lengths: px, em, rem, vh, vw, etc.
  - Percentages: relative to element size

**Spec:** https://drafts.csswg.org/css-transforms-2/#perspective-origin-property

---

## 🏗️ Infrastructure Assessment

### ✅ Already Exists

**@b/types:**

- `LengthIR` - All length units covered
- `PositionIR` - Full position syntax (from background-position)

**@b/parsers:**

- `Length.parse()` - Length parsing with units
- `Position.parse()` - Position parsing (1-value, 2-value, 4-value)

**@b/generators:**

- `Length.generate()` - Length generation
- `Position.generate()` - Position generation

### 🆕 Need to Build

**perspective property:**

- Parser: Check for `none` keyword OR positive length (reject 0, negative, percentage)
- Generator: Simple - output `none` or length value
- Validation: Positive length constraint

**perspective-origin property:**

- Parser: Delegate to `Position.parse()` (already handles all syntax)
- Generator: Delegate to `Position.generate()`
- Validation: Position handles everything

---

## 📋 Implementation Checklist

### Step 1: Types (@b/types)

**File:** `packages/b_types/src/properties/perspective.ts`

```typescript
import { z } from "zod";
import { LengthIR, PositionIR } from "../index.js";

// perspective: none | <length [0,∞]>
export const PerspectiveIR = z.union([
  z.literal("none"),
  LengthIR, // Validation in parser (must be > 0)
]);

export type PerspectiveIR = z.infer<typeof PerspectiveIR>;

// perspective-origin: <position>
export const PerspectiveOriginIR = PositionIR;
export type PerspectiveOriginIR = z.infer<typeof PerspectiveOriginIR>;
```

**Update:** `packages/b_types/src/properties/index.ts`

```typescript
export * from "./perspective.js";
```

---

### Step 2: Parsers (@b/parsers)

**File:** `packages/b_parsers/src/properties/perspective.ts`

```typescript
import type * as csstree from "@eslint/css-tree";
import type { ParseResult } from "@b/types";
import type { PerspectiveIR } from "@b/types";
import * as Ast from "@b/utils";
import { Length } from "../values/length/index.js";
import { ok, err, aggregateIssues } from "@b/types";

export function parse(valueNode: csstree.Value): ParseResult<PerspectiveIR> {
  const nodes = Ast.nodeListToArray(valueNode.children);

  if (nodes.length !== 1) {
    return err("perspective requires exactly one value");
  }

  const node = nodes[0];

  // Check for 'none' keyword
  if (Ast.isIdentifierNode(node) && node.name.toLowerCase() === "none") {
    return ok("none");
  }

  // Parse as length
  const lengthResult = Length.parse(valueNode);
  if (!lengthResult.ok) {
    return lengthResult;
  }

  // Validate: must be positive (0 not allowed, negative not allowed)
  if (lengthResult.value.kind === "length") {
    if (lengthResult.value.value <= 0) {
      return err("perspective length must be positive (greater than 0)");
    }
  }

  // Reject percentages (not valid for perspective)
  if (lengthResult.value.kind === "percentage") {
    return err("perspective does not accept percentage values");
  }

  return lengthResult;
}
```

**File:** `packages/b_parsers/src/properties/perspective-origin.ts`

```typescript
import type * as csstree from "@eslint/css-tree";
import type { ParseResult, PerspectiveOriginIR } from "@b/types";
import { Position } from "../values/position/index.js";

export function parse(valueNode: csstree.Value): ParseResult<PerspectiveOriginIR> {
  // Delegate entirely to Position parser (handles all syntax)
  return Position.parse(valueNode);
}
```

**Update:** `packages/b_parsers/src/properties/index.ts`

```typescript
export * as Perspective from "./perspective.js";
export * as PerspectiveOrigin from "./perspective-origin.js";
```

---

### Step 3: Generators (@b/generators)

**File:** `packages/b_generators/src/properties/perspective.ts`

```typescript
import type { GenerateResult, PerspectiveIR } from "@b/types";
import { ok } from "@b/types";
import { Length } from "../values/length/index.js";

export function generate(value: PerspectiveIR): GenerateResult {
  if (value === "none") {
    return ok("none");
  }

  return Length.generate(value);
}
```

**File:** `packages/b_generators/src/properties/perspective-origin.ts`

```typescript
import type { GenerateResult, PerspectiveOriginIR } from "@b/types";
import { Position } from "../values/position/index.js";

export function generate(value: PerspectiveOriginIR): GenerateResult {
  return Position.generate(value);
}
```

**Update:** `packages/b_generators/src/properties/index.ts`

```typescript
export * as Perspective from "./perspective.js";
export * as PerspectiveOrigin from "./perspective-origin.js";
```

---

### Step 4: Declarations (@b/declarations)

**Directory:** `packages/b_declarations/src/properties/perspective/`

```
perspective/
├── index.ts
├── parser.ts
└── generator.ts
```

**File:** `parser.ts`

```typescript
import type * as csstree from "@eslint/css-tree";
import type { ParseResult, PerspectiveIR } from "@b/types";
import * as Parser from "@b/parsers";

export function parse(valueNode: csstree.Value): ParseResult<PerspectiveIR> {
  return Parser.Perspective.parse(valueNode);
}
```

**File:** `generator.ts`

```typescript
import type { GenerateResult, PerspectiveIR } from "@b/types";
import * as Generator from "@b/generators";

export function generate(value: PerspectiveIR): GenerateResult {
  return Generator.Perspective.generate(value);
}
```

**File:** `index.ts`

```typescript
import { defineProperty } from "../../core/index.js";
import type { PerspectiveIR } from "@b/types";

export const perspective = defineProperty<PerspectiveIR>({
  name: "perspective",
  initial: "none",
});
```

**Directory:** `packages/b_declarations/src/properties/perspective-origin/`

```
perspective-origin/
├── index.ts
├── parser.ts
└── generator.ts
```

**Similar structure, delegates to PerspectiveOrigin parsers/generators**

**Update:** `packages/b_declarations/src/properties/index.ts`

```typescript
export { perspective } from "./perspective/index.js";
export { perspectiveOrigin } from "./perspective-origin/index.js";
```

---

### Step 5: Register Properties

**File:** `packages/b_declarations/src/index.ts`

```typescript
import { perspective } from "./properties/perspective/index.js";
import { perspectiveOrigin } from "./properties/perspective-origin/index.js";

// ... existing exports ...

export { perspective, perspectiveOrigin };
```

---

## 🧪 Test Strategy

### Smoke Tests

**perspective:**

```typescript
"perspective: none"; // ✅ none keyword
"perspective: 500px"; // ✅ positive length
"perspective: 1000px"; // ✅ positive length
"perspective: var(--depth)"; // ✅ CSS variable
"perspective: 0"; // ❌ zero not allowed
"perspective: -100px"; // ❌ negative not allowed
"perspective: 50%"; // ❌ percentage not allowed
```

**perspective-origin:**

```typescript
"perspective-origin: center"; // ✅ 1-value keyword
"perspective-origin: top left"; // ✅ 2-value keywords
"perspective-origin: 50% 50%"; // ✅ 2-value percentages
"perspective-origin: 100px 200px"; // ✅ 2-value lengths
"perspective-origin: left 20px top 30px"; // ✅ 4-value syntax
"perspective-origin: var(--vanishing-point)"; // ✅ CSS variable
```

### Run Tests

```bash
just test              # All tests
just build             # Verify no type errors
just check             # Format + lint + typecheck
```

---

## 📊 Success Metrics

**Code volume:**

- ~120 lines new code (types, parsers, generators, declarations)
- ~80 lines tests

**Properties:**

- 57 → 59 (+2)

**Quality gates:**

- ✅ All tests passing
- ✅ No TypeScript errors
- ✅ No lint issues
- ✅ Smoke tests verified

---

## 🎯 Why This Matters

**Completes 3D transform stack:**

- ✅ transform (Session 076)
- ✅ transform-origin (Session 076)
- ✅ transform-style (Session 076)
- ✅ backface-visibility (Session 076)
- ✅ perspective (this session)
- ✅ perspective-origin (this session)

**Enables:**

- 3D card flips
- 3D carousels
- Parallax effects
- Z-axis transformations with proper depth perception

**Phase 1 COMPLETE:** Full visualization effects foundation (59 properties)

---

## 🚀 Execution Notes

**Pattern to follow:**

1. Look at existing property (e.g., background-position for position syntax)
2. Copy-paste-modify
3. Keep structure identical
4. Smoke test before committing

**Estimated time:** 45 minutes
**Actual time:** [To be recorded]

**Key insight:** Leverage existing Position infrastructure = trivial implementation

---

**Ready to execute** ✅
