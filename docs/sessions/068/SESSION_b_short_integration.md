# b_short v3.0.0 Integration Analysis

**Date:** 2025-11-13
**Context:** b_short upgraded to v3.0.0 with major architectural changes

---

## 🔍 Key Findings

### b_short v3.0.0 Changes

**Major Change:** Removed collapse (longhand → shorthand) API entirely

**What was removed:**

- All collapse handlers (`collapse.ts` files)
- `expandPartialLonghand` option
- Bidirectional support (expansion only now)
- ~4,600 lines of code removed

**What remains:**

- `expand()` API (shorthand → longhand)
- All 26 shorthand handlers preserved
- Type-safe expansion
- Named exports only

**Impact on b_values:** ✅ **ZERO IMPACT**

- Only uses `expand()` function
- No collapse API usage found
- Types remain compatible
- Dependency already upgraded to `^3.0.0`

---

## ⚠️ Critical Architecture Issue Identified

### Problem: Shorthand Properties in Declaration Registry

**Current state:**

- `background-position` registered as a property in `@b/declarations`
- Located: `packages/b_declarations/src/properties/background-position/`
- **But:** `background-position` is a SHORTHAND property (expands to `-x` and `-y`)

**Why this is wrong:**

1. `@b/declarations` should only handle **longhand** properties
2. Shorthand expansion is `b_short`'s job
3. Mixing concerns creates architectural inconsistency
4. We already have the dependency - use it correctly

**Properties affected (now or future):**

- `background-position` (current)
- `margin`, `padding`, `border`, `border-radius` (future)
- `inset`, `gap`, `place-items`, `place-content` (future)
- All box model shorthands
- All logical property shorthands

---

## 🎯 Solution Architecture

### Principle: Separation of Concerns

```
Shorthand (e.g., margin: 10px)
    ↓ b_short.expand()
Longhands (e.g., margin-top: 10px, margin-right: 10px, ...)
    ↓ @b/parsers
IR (structured data)
    ↓ @b/generators
CSS output
```

### Strategy: Leverage, Don't Duplicate

**For shorthand properties:**

1. **DO NOT** register in `PROPERTY_DEFINITIONS`
2. **DO** keep parser/generator utilities if useful
3. **DO** use as internal utilities for other properties
4. **DO NOT** expose as public property API

**Example: background-position**

- ❌ Don't register as property
- ✅ Keep parser utility (useful for `background` shorthand parsing)
- ✅ Use internally when needed
- ✅ Let `b_short` handle expansion to `-x/-y`

---

## 📋 Action Items for Next Session

### 1. Audit Property Registry

```bash
# Find all potentially shorthand properties
cd packages/b_declarations/src/properties
ls -d */ | while read dir; do
  prop=${dir%/}
  # Check if b_short handles it
  grep -l "$prop" /path/to/b_short/src/handlers/*/
done
```

### 2. Design Utility vs Property Distinction

**Option A: Internal Utilities Package**

```
packages/b_declarations/src/
├── properties/          # Only longhand properties
├── utilities/           # Reusable parsers/generators (not registered)
│   ├── position/       # background-position parser
│   ├── directional/    # TRBL box model parsers
│   └── ...
```

**Option B: Mark as Utility in Definition**

```typescript
export const backgroundPosition = defineProperty({
  name: "background-position",
  syntax: "<position>",
  // ...
  _internal: true, // Don't register, utility only
});
```

### 3. Create Shorthand Integration Guide

Document:

- When to register vs when to create utility
- How to use b_short for expansion
- Pattern for properties that reference shorthands
- Migration path for existing shorthand properties

### 4. Clean Up background-position

**Immediate:**

- Remove from `PROPERTY_DEFINITIONS`
- Keep parser/generator as utilities
- Update any code that references it
- Add test for b_short integration

**Future:**

- Apply same pattern to all box model props before implementing
- Document decision in ADR

---

## 🧪 Testing Strategy

**For shorthand-dependent properties:**

1. Test with `b_short.expand()` first
2. Then parse expanded longhand properties
3. Verify round-trip (expand → parse → generate)

**Example test:**

```typescript
import { expand } from "b_short";
import { parseDeclaration, generate } from "@b/declarations";

const css = "margin: 10px 20px";
const expanded = expand(css);
// expanded: margin-top: 10px; margin-right: 20px; ...

for (const longhand of expanded.properties) {
  const ir = parseDeclaration(longhand);
  const output = generate(ir);
  expect(output).toBe(longhand);
}
```

---

## 💡 Key Insight

**We have an excellent shorthand expander already - USE IT.**

Don't reimplement shorthand logic in `@b/declarations`. Let each tool do its job:

- `b_short`: CSS shorthand → longhand expansion
- `@b/declarations`: Longhand properties ↔ IR

This is **architectural consistency** - the principle we value most.

---

## 📝 Session Notes

- No breaking changes in b_short API that affect us
- Unused imports in `me.ts` (cleanup needed)
- v3.0.0 simplification actually helps our use case
- Integration is clean, just need to enforce boundaries

**Next session: Define and enforce longhand-only policy for property registry.**
