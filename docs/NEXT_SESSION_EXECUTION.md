# Session 068 → Next Session: Execution Plan

**Date:** 2025-11-12

**Current Status:** ✅ Architecture finalized, ready to execute

---

## 🎯 What We Accomplished This Session

1. **Identified the root cause** of blend-mode implementation confusion
   - We created property-specific parsers/generators when blend-mode is REUSABLE
   - Missing: Clear pattern detection process

2. **Created comprehensive architectural docs**
   - `CSS_VALUE_PATTERN_DETECTION.md` - How to identify reusable patterns
   - `PROPERTY_IMPLEMENTATION_PROTOCOL.md` - 5-phase fool-proof process

3. **Reset git cleanly** - Ready for proper implementation

---

## 🚀 Next Session: Execute background-blend-mode

### Pre-flight Checklist

Before starting, verify:
```bash
git status                    # Should be clean
git log --oneline -1         # Should show architecture docs commit
```

### Execution Steps (Follow Protocol Exactly)

#### Step 1: CSS Value Pattern Detection (5 min)

```markdown
Property: background-blend-mode
Syntax: <blend-mode>#

Extracted CSS value types:
- <blend-mode>

Classification:
- Pure keywords? YES (normal, multiply, screen, overlay, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, hue, saturation, color, luminosity)
- Used by multiple properties? YES (background-blend-mode, mix-blend-mode)
→ Category: REUSABLE KEYWORDS
→ Location: @b/keywords

Dependencies Needed:
- @b/keywords/src/blend-mode.ts (keyword enum + BLEND_MODE array)
- @b/parsers/src/blend-mode.ts (BlendMode.parse)
- @b/generators/src/blend-mode.ts (BlendMode.generate)
```

#### Step 2: Dependency Audit (2 min)

```bash
# Check if blend-mode already exists
grep -r "export const blendMode" packages/b_keywords/src/
grep -r "export.*as BlendMode" packages/b_parsers/src/
grep -r "export.*as BlendMode" packages/b_generators/src/

# Expected: All should return nothing (doesn't exist yet)
```

Status: ❌ ALL MISSING - must implement

#### Step 3: Implement Dependencies (15 min)

**3A. Create @b/keywords/src/blend-mode.ts**

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
  z.literal("overlay"),
  z.literal("darken"),
  z.literal("lighten"),
  z.literal("color-dodge"),
  z.literal("color-burn"),
  z.literal("hard-light"),
  z.literal("soft-light"),
  z.literal("difference"),
  z.literal("exclusion"),
  z.literal("hue"),
  z.literal("saturation"),
  z.literal("color"),
  z.literal("luminosity"),
]);

export const BLEND_MODE = getLiteralValues(blendMode);
export type BlendMode = z.infer<typeof blendMode>;
```

**Export from @b/keywords/src/index.ts:**

```typescript
export * from "./blend-mode";
```

**3B. Create @b/parsers/src/blend-mode.ts**

```typescript
// @b/parsers/src/blend-mode.ts
import { parseOk, parseErr, createError, type ParseResult } from "@b/types";
import { BLEND_MODE, type BlendMode } from "@b/keywords";

/**
 * Parse CSS <blend-mode> value
 * @see https://drafts.fxtf.org/compositing/#ltblendmodegt
 */
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

export const BlendMode = { parse };
```

**Export from @b/parsers/src/index.ts:**

```typescript
export * as BlendMode from "./blend-mode";
```

**3C. Create @b/generators/src/blend-mode.ts**

```typescript
// @b/generators/src/blend-mode.ts
import { generateOk, type GenerateResult } from "@b/types";
import type { BlendMode } from "@b/keywords";

/**
 * Generate CSS <blend-mode> value
 */
export function generate(value: BlendMode): GenerateResult {
  return generateOk(value);
}

export const BlendMode = { generate };
```

**Export from @b/generators/src/index.ts:**

```typescript
export * as BlendMode from "./blend-mode";
```

**Verify:**

```bash
pnpm typecheck
# Should pass
```

#### Step 4: Scaffold Property (20 min)

Follow the exact structure from `PROPERTY_IMPLEMENTATION_PROTOCOL.md` Section 4:

Files to create:
1. `packages/b_declarations/src/properties/background-blend-mode/types.ts`
2. `packages/b_declarations/src/properties/background-blend-mode/parser.ts`
3. `packages/b_declarations/src/properties/background-blend-mode/generator.ts`
4. `packages/b_declarations/src/properties/background-blend-mode/definition.ts`
5. `packages/b_declarations/src/properties/background-blend-mode/parser.test.ts`
6. `packages/b_declarations/src/properties/background-blend-mode/generator.test.ts`
7. `packages/b_declarations/src/properties/background-blend-mode/index.ts`

**Copy templates directly from protocol doc** - they're production-ready.

**Register in registry:**

```typescript
// packages/b_declarations/src/registry.ts
import { backgroundBlendMode } from "./properties/background-blend-mode";

export const propertyRegistry = {
  // ... existing
  "background-blend-mode": backgroundBlendMode,
};
```

**Export from public API:**

```typescript
// packages/b_declarations/src/index.ts
export { backgroundBlendMode } from "./properties/background-blend-mode";
export type { BackgroundBlendModeIR } from "./properties/background-blend-mode";
```

#### Step 5: Test & Validate (10 min)

```bash
# Type check
pnpm typecheck

# Run tests
pnpm test background-blend-mode

# Run all tests (ensure no regressions)
pnpm test

# Lint
pnpm lint

# Build
pnpm build
```

**Manual validation:**

```bash
# Test in REPL or create quick script
node -e "
const { parseDeclaration } = require('./packages/b_declarations/dist/index.js');

console.log('Test 1:', parseDeclaration('background-blend-mode: multiply'));
console.log('Test 2:', parseDeclaration('background-blend-mode: multiply, screen'));
console.log('Test 3:', parseDeclaration('background-blend-mode: inherit'));
"
```

---

## 📋 Success Criteria

- [ ] All files created in correct locations
- [ ] TypeScript compiles
- [ ] All tests pass
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Manual validation confirms correct parsing/generation
- [ ] Git commit with clear message

---

## 🎯 Commit Message Template

```
feat(declarations): implement background-blend-mode property

Implements background-blend-mode following the Property Implementation Protocol.

Dependencies added:
- @b/keywords: blendMode enum (reusable across background-blend-mode and mix-blend-mode)
- @b/parsers: BlendMode.parse (reusable)
- @b/generators: BlendMode.generate (reusable)

Property implementation:
- IR: Multi-value list pattern (background-* family)
- Parser: Delegates to shared BlendMode parser, falls back to CssValue
- Generator: Iterates list, generates comma-separated values
- Tests: Parser and generator tests covering valid/invalid cases

Syntax: <blend-mode>#
Values: normal | multiply | screen | overlay | darken | lighten | color-dodge | 
        color-burn | hard-light | soft-light | difference | exclusion | 
        hue | saturation | color | luminosity

Ref: Session 068
```

---

## 🚀 After background-blend-mode: Next Steps

Once background-blend-mode is complete and committed:

### Immediate Next Property: mix-blend-mode

**Why this is perfect next:**
- Reuses the SAME blend-mode dependencies we just created ✅
- Tests our "reusable pattern" approach ✅
- Single-value pattern (simpler than multi-value) ✅

**Pattern difference:**
- background-blend-mode: Multi-value list `{ kind: "list", values: [] }`
- mix-blend-mode: Single value `{ kind: "value", value: ... }`

**Syntax difference:**
```
background-blend-mode: <blend-mode>#              (list)
mix-blend-mode: <blend-mode> | plus-lighter      (single, with one extra keyword)
```

**Implementation:**
- Add "plus-lighter" to blendMode enum in @b/keywords
- Create mix-blend-mode property (single-value pattern)
- Tests

**Estimated time:** 15 min (dependencies already exist!)

---

## 📊 Roadmap After First 2 Properties

With background-blend-mode + mix-blend-mode complete, we'll have proven:
1. ✅ Reusable keyword pattern works
2. ✅ Multi-value list pattern works
3. ✅ Single-value pattern works
4. ✅ Dependency reuse works

**Next batch (Layout properties):**
- width, height (reuse existing length-percentage)
- margin-*, padding-* (composite longhands, box model pattern)

**This validates the entire protocol at scale.**

---

## 🎯 Remember

**DO NOT deviate from the protocol.**
**DO NOT take shortcuts.**
**DO NOT implement things in property directories that belong in shared packages.**

**The protocol exists to ensure consistency and scalability.**

**Follow it exactly. Trust the process.**
