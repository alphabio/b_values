# 🚀 Font Properties - Quick Start Guide

**Read this first, then dive into FONT_MASTER_PLAN.md**

---

## 🎯 TL;DR

**Implementing 7 font properties** (NO shorthands):

- `font-family` ⭐⭐⭐ (hardest - quote logic)
- `font-size` ⭐⭐⭐ (medium - multiple unions)
- `font-weight` ⭐⭐ (medium - numeric validation)
- `font-style` ⭐⭐ (medium - oblique + angle)
- `font-stretch` ⭐ (easy - keyword enum)
- `font-variant` ⭐⭐ (easy for CSS2, complex for CSS3)
- `line-height` ⭐⭐ (medium - number vs length-percentage)

**Estimated time:** 15 hours total (across multiple sessions)

---

## 📚 Prerequisites

### Read These Documents First

1. `docs/architecture/decisions/001-longhands-only.md` - NO SHORTHANDS
2. `docs/architecture/patterns/006-PROPERTY_CREATION_HANDBOOK.md` - How to create properties
3. `TMP/FONT_MASTER_PLAN.md` - Full implementation plan

### Study Existing Patterns

```bash
# Simple keyword property (like font-stretch)
cat packages/b_declarations/src/properties/background-attachment/types.ts

# Numeric validation (pattern for font-weight)
cat packages/b_parsers/src/angle.ts | grep -A10 "parseFloat"

# Length-percentage (pattern for font-size)
cat packages/b_types/src/length-percentage.ts
cat packages/b_parsers/src/length.ts
```

---

## 🏗️ Implementation Order

**Start with simplest, end with hardest:**

1. ✅ **Phase 0: Keywords** (30 min)
   - Create all keyword files in `b_keywords/src/`
   - Update exports in `b_keywords/src/index.ts`

2. ✅ **Phase 0: Number type** (30 min)
   - `b_types/src/number.ts`
   - `b_parsers/src/number.ts`

3. ✅ **font-stretch** (1h) - Simplest, establish workflow
4. ✅ **font-variant** (1h) - Simple for CSS2 only
5. ✅ **font-weight** (2h) - Numeric validation pattern
6. ✅ **font-size** (2h) - Multiple union branches
7. ✅ **font-style** (2h) - Oblique with optional angle
8. ✅ **line-height** (2h) - Number vs length-percentage
9. ✅ **font-family** (4h) - Save for last, most complex

---

## 🔑 Key Design Decisions

### Font-Family

```typescript
// Three distinct types:
// 1. String literal: "Times New Roman"
// 2. Custom-ident sequence: Times New Roman (unquoted)
// 3. Generic family: serif, sans-serif, monospace

// Generator MUST:
// - Always quote strings
// - Quote custom-idents with spaces/special chars
// - NEVER quote generic families
```

### Font-Weight

```typescript
// Accept:
// - Keywords: normal (400), bold (700), bolder, lighter
// - Numbers: 1-1000 (inclusive)

// Validation:
if (value < 1 || value > 1000) {
  return parseErr("font-weight", createError("invalid-value", `Font weight must be between 1 and 1000, got ${value}`));
}
```

### Font-Style

```typescript
// Oblique with optional angle:
// - "oblique" alone → no angle specified
// - "oblique 15deg" → angle between -90deg and 90deg

// Validation:
if (angle < -90 || angle > 90) {
  return parseErr(
    "font-style",
    createError("invalid-value", `Oblique angle must be between -90deg and 90deg, got ${angle}`)
  );
}
```

### Font-Size

```typescript
// Four union branches:
// 1. absolute-size: xx-small, x-small, small, medium, large, x-large, xx-large, xxx-large
// 2. relative-size: smaller, larger
// 3. length-percentage: 16px, 1.5rem, 120%
// 4. math keyword

// Use existing lengthPercentageSchema from b_types
```

### Line-Height

```typescript
// Three union branches:
// 1. normal keyword
// 2. unitless number: 1.5 (multiplier, NOT pixels)
// 3. length-percentage: 20px, 120%

// Validation: non-negative values only
if (value < 0) {
  return parseErr("line-height", createError("invalid-value", `Line height must be non-negative, got ${value}`));
}
```

---

## 📁 File Template

### Minimal Property Structure

```
packages/b_declarations/src/properties/font-{name}/
├── index.ts              ← export * from "./definition"
├── definition.ts         ← defineProperty() call
├── types.ts              ← Zod schema + TypeScript type
├── parser.ts             ← parse{Name}(ast: csstree.Value): ParseResult<IR>
├── generator.ts          ← generate(ir: IR): GenerateResult<string>
├── parser.test.ts        ← Test suite
└── generator.test.ts     ← Test suite
```

### Example: font-stretch (Simplest)

**types.ts:**

```typescript
import { z } from "zod";
import * as Keywords from "@b/keywords";

export const fontStretchIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("value"), value: Keywords.fontStretchKeywordSchema }),
]);

export type FontStretchIR = z.infer<typeof fontStretchIRSchema>;
```

**parser.ts:**

```typescript
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type { FontStretchIR } from "./types";

export function parseFontStretch(ast: csstree.Value): ParseResult<FontStretchIR> {
  const firstNode = ast.children.first;

  if (!firstNode || firstNode.type !== "Identifier") {
    return parseErr("font-stretch", createError("invalid-syntax", "Expected keyword value"));
  }

  const value = firstNode.name.toLowerCase();

  // CSS-wide keywords
  const cssWideResult = Keywords.cssWide.safeParse(value);
  if (cssWideResult.success) {
    return parseOk({ kind: "keyword", value: cssWideResult.data });
  }

  // font-stretch keywords
  const stretchResult = Keywords.fontStretchKeywordSchema.safeParse(value);
  if (stretchResult.success) {
    return parseOk({ kind: "value", value: stretchResult.data });
  }

  return parseErr("font-stretch", createError("invalid-value", `Invalid font-stretch: ${value}`));
}
```

---

## ✅ Per-Property Checklist

For EACH property:

1. **Keywords** (if needed)
   - [ ] Create `b_keywords/src/font-{name}.ts`
   - [ ] Export from `b_keywords/src/index.ts`

2. **Types** (if needed)
   - [ ] Create `b_types/src/font/{name}.ts`
   - [ ] Export from `b_types/src/font/index.ts`
   - [ ] Export from `b_types/src/index.ts`

3. **Parser** (if needed)
   - [ ] Create `b_parsers/src/font/{name}.ts`
   - [ ] Implement `parse()` function
   - [ ] Export from `b_parsers/src/font/index.ts`
   - [ ] Export as namespace from `b_parsers/src/index.ts`

4. **Generator** (if needed)
   - [ ] Create `b_generators/src/font/{name}.ts`
   - [ ] Implement `generate()` function
   - [ ] Export from `b_generators/src/font/index.ts`
   - [ ] Export as namespace from `b_generators/src/index.ts`

5. **Property**
   - [ ] Create `b_declarations/src/properties/font-{name}/` directory
   - [ ] Create `types.ts`, `parser.ts`, `generator.ts`, `definition.ts`, `index.ts`
   - [ ] Update `b_declarations/src/properties/definitions.ts`
   - [ ] Update `b_declarations/src/properties/index.ts`
   - [ ] Update `b_declarations/src/manifest.json`

6. **Tests**
   - [ ] Create `parser.test.ts` with >90% coverage
   - [ ] Create `generator.test.ts` with >90% coverage

7. **Verify**
   - [ ] Run `just check`
   - [ ] Fix any issues
   - [ ] Commit with conventional commit message

---

## 🔍 Research Needed

**Before implementing, verify these:**

1. **Font-weight decimals**: Can it be `400.5`? (Check spec + test browsers)
2. **Font-family quoting**: Exact algorithm for custom-ident quoting
3. **Generic family names**: Full list + are they case-sensitive?
4. **Oblique default angle**: What's the effective angle if not specified?
5. **Line-height unitless**: Confirm it's a multiplier, not pixels

**Resources:**

- CSS Fonts Module Level 4: https://www.w3.org/TR/css-fonts-4/
- MDN font properties: https://developer.mozilla.org/en-US/docs/Web/CSS/font

---

## ⚠️ Common Pitfalls

1. **DON'T implement `font` shorthand** - We only do longhands (ADR 001)
2. **DON'T confuse generic families with custom-idents** - `serif` is generic, `Serif` is custom
3. **DON'T skip numeric validation** - font-weight MUST reject 0 and 1001
4. **DON'T forget CSS-wide keywords** - All properties support inherit, initial, etc.
5. **DON'T assume existing types exist** - Check before using (e.g., number type doesn't exist yet)

---

## 🎯 Ready to Start?

1. Read `TMP/FONT_MASTER_PLAN.md` in full
2. Run these commands to explore existing code:

```bash
# Study a simple keyword property
cat packages/b_declarations/src/properties/visibility/types.ts

# Study numeric validation
cat packages/b_parsers/src/angle.ts | grep -A10 "parseFloat"

# Study length-percentage union
cat packages/b_types/src/length-percentage.ts

# Check test patterns
cat packages/b_declarations/src/properties/background-color/parser.test.ts | head -50
```

3. Start with Phase 0: Keywords + Number type
4. Then implement font-stretch (simplest property)
5. Establish workflow, then tackle the rest

**Good luck! Remember: we break inconsistency, we don't work around it.** 🚀
