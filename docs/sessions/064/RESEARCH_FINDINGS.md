# Session 064: Research Findings - Universal CSS Functions

**Date:** 2025-11-10
**Status:** ✅ CORRECTED UNDERSTANDING

---

## 🔍 Key Discovery

**Phase 1 injection is working!** Tests show:
- ✅ background-clip with var() - PASSING
- ✅ background-repeat with var() - PASSING  
- ✅ background-size with var() - PASSING
- ❌ background-image with var() - FAILING

**Root cause:** Schema mismatch, NOT parser logic.

---

## 📊 Architecture Analysis

### What's Already Working

**Parser injection (Phase 1):**
```typescript
// packages/b_declarations/src/utils/create-multi-value-parser.ts:140-150
if (firstNode && isUniversalFunction(firstNode)) {
  const universalResult = Utils.parseNodeToCssValue(itemAst);
  if (universalResult.ok) {
    itemResults.push(universalResult as ParseResult<TItem>);
    continue;
  }
}
```

This code is **CORRECTLY** parsing var/calc/etc and returning CssValue IR.

### Schema Patterns

**Pattern 1: Direct cssValueSchema (simplest)**
```typescript
// background-clip/types.ts:13
const backgroundClipValueSchema = cssValueSchema;
```
✅ Works because `cssValueSchema` includes all universal functions

**Pattern 2: Union with concrete schema**
```typescript
// background-repeat/types.ts:8
const repeatStyleOrCssValueSchema = z.union([repeatStyleSchema, cssValueSchema]);
```
✅ Works because union allows EITHER structured type OR CssValue

**Pattern 3: imageSchema (broken)**
```typescript
// background-image/types.ts:29
values: z.array(imageSchema).min(1),
```
❌ Fails because `imageSchema` only allows `{kind: "url"}` and `{kind: "gradient"}`

---

## 🎯 Solution

**Change needed:** ONE line per property that uses a concrete schema

### background-image Fix

```diff
// packages/b_declarations/src/properties/background-image/types.ts

 import { imageSchema } from "@b/types";
+import { cssValueSchema } from "@b/types";
 import { z } from "zod";
 import * as Keywords from "@b/keywords";

+// Union of Image OR generic CssValue (for var(), calc(), etc.)
+const imageOrCssValueSchema = z.union([imageSchema, cssValueSchema]);

 export const backgroundImageIR = z.discriminatedUnion("kind", [
   z.object({
     kind: z.literal("keyword"),
     value: z.union([Keywords.cssWide, Keywords.none]),
   }),
   z.object({
     kind: z.literal("list"),
-    values: z.array(imageSchema).min(1),
+    values: z.array(imageOrCssValueSchema).min(1),
   }),
 ]);
```

### Changes Required

**background-image:**
- ✅ Parser injection: DONE (already working)
- ⏳ Schema: Add `z.union([imageSchema, cssValueSchema])`

**background-size:**
- ✅ Parser injection: DONE (already working)
- ✅ Schema: Already uses cssValueSchema in nested types (gradients)

**background-repeat:**
- ✅ Parser injection: DONE (already working)
- ✅ Schema: Already done (line 8)

**background-clip:**
- ✅ Parser injection: DONE (already working)
- ✅ Schema: Already done (direct cssValueSchema)

**background-attachment:**
- ⏳ Check schema
- ✅ Parser injection: DONE (already working)

**background-origin:**
- ⏳ Check schema
- ✅ Parser injection: DONE (already working)

---

## 📈 Progress Update

**Phase 0:** ✅ COMPLETE (type guards)
**Phase 1:** ✅ COMPLETE (multi-value parser injection) - already working!
**Phase 2:** ⏳ NOT NEEDED (single-value properties don't have this issue)
**Phase 3:** ⏳ Schema updates (1-2 properties, 1 line each)
**Phase 4:** ⏳ Integration tests (fix expectations)

---

## 🔥 Critical Insight

**The original CORRECTED_PLAN was right about injection, but we didn't realize:**

1. **Parser injection works IMMEDIATELY** - no per-property changes
2. **Schema updates are MINIMAL** - one line per property that needs it
3. **Most properties already support it** - background-clip, background-repeat, background-size
4. **Only background-image needs schema fix** - it uses `imageSchema` which is too restrictive

**This is NOT boilerplate** - it's a one-time schema update per property.

---

## 🚀 Next Actions

1. ✅ Update background-image schema (ONE line)
2. ✅ Check background-attachment/origin schemas
3. ✅ Fix integration test expectations
4. ✅ Verify all tests pass
5. ✅ Commit Phase 1 complete

**Estimated time:** 15 minutes

---

## �� Lessons Learned

- Parser injection works at abstraction layer ✅
- Schema updates are separate concern (type-level, not logic-level)
- Test failures revealed schema issue, not parser issue
- Most properties already follow the pattern
- `cssValueSchema` is the foundation for universal function support
