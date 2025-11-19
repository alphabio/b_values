# Session 081: Concrete Type Layer Audit

**Date:** 2025-11-19
**Focus:** Missing concrete type layer in property parsers
**Status:** 🔴 ANALYSIS COMPLETE - Ready for implementation

---

## The Bug

User reported: `animation-delay` type declares `{ kind: "time"; value: Type.Time }` but parser never produces it.

**Root cause:** Parser skips concrete type parsing and jumps straight to `CssValue`.

---

## Scope

**32 properties** use `Parsers.Utils.parseNodeToCssValue()` directly, potentially skipping concrete types.

### Breakdown by Category

| Category | Count | Examples |
|----------|-------|----------|
| Time | 4 | animation-delay, transition-duration |
| Length/Percentage | 20 | margins, paddings, borders, spacing |
| Position | 2 | background-position-x/y |
| Number | 2+ | opacity, animation-iteration-count |
| Special | 6 | filter, backdrop-filter, border-radius (4) |

---

## The Pattern

### ❌ Current (Broken)

```typescript
// types.ts - Declares concrete type
export type AnimationDelayIR =
  | { kind: "keyword"; value: CssWide }
  | { kind: "time"; value: Type.Time }     // ← Never produced!
  | { kind: "value"; value: CssValue };

// parser.ts - Skips concrete type
const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
return { kind: "value", value: valueResult.value };  // ← Always CssValue
```

**Result:** `animation-delay: 1s` produces `{ kind: "value", value: { kind: "literal", value: 1, unit: "s" } }`
**Should be:** `{ kind: "time", value: { value: 1, unit: "s" } }`

---

### ✅ Correct (Reference: background-color)

```typescript
// types.ts
export const backgroundColorIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("value"), value: colorSchema }),  // ← Color includes concrete + CssValue
]);

// parser.ts
const colorResult = Parsers.Color.parseNode(firstNode);  // ← Tries concrete first, then CssValue
if (colorResult.ok) {
  return { kind: "value", value: colorResult.value };
}
```

**Why it works:** `Parsers.Color.parseNode` internally handles concrete formats (hex, rgb, hsl) AND CssValue (var, calc). The parser does the right thing.

---

## Fix Template

**For each broken property:**

1. **Parse concrete type first:**
   ```typescript
   const concreteResult = Parsers.Time.parseTimeNode(firstNode);
   if (concreteResult.ok) {
     return { kind: "time", value: concreteResult.value };
   }
   ```

2. **Fallback to CssValue:**
   ```typescript
   const cssValueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
   if (cssValueResult.ok) {
     return { kind: "value", value: cssValueResult.value };
   }
   ```

---

## Documents Created

1. **`concrete-type-audit.md`** - Full analysis of all 32 properties
2. **`TODO.md`** - Prioritized task list with implementation template
3. **`SUMMARY.md`** - This file (quick reference)

---

## Next Actions

1. **Get architectural decisions** (see TODO.md questions)
2. **Start with Priority 1** (Time properties - 4 props)
3. **Batch fix by type** (all margins together, all paddings together, etc.)
4. **Add tests** for each fix (concrete value + var() fallback)
5. **Verify no regressions** with `just check && just test`

---

## Impact

**Benefits of fixing:**
- Proper type discrimination in IR
- More semantic representation (time vs generic value)
- Better tooling support (LSP, analyzers)
- Consistent with architecture (concrete types before CssValue)

**Breaking changes:**
- IR structure changes for affected properties
- But we're greenfield, no external consumers
- Per AGENTS.md: "We break things to make them consistent"

---

## Estimated Effort

- **Per property:** 15-20 minutes (type + parser + tests)
- **Total:** 28 properties × 15 min = ~7 hours
- **Sessions:** 2-3 sessions to complete all

**Priority 1 (Time):** 4 properties × 15 min = 1 hour
