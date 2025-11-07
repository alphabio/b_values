# Complete Removal of `original` Field

**Date:** 2025-11-07
**Status:** ✅ Complete

---

## 🎯 Goal

Remove the `original` field from `DeclarationResult` everywhere in the codebase.

**Reason:** Broken implementation (captures regenerated values, not source) and waste of bytes.

---

## 📊 Files Changed

### Implementation (3 files)

1. **`packages/b_declarations/src/types.ts`** (-1 line)
   - Removed `original: string;` from `DeclarationResult` interface

2. **`packages/b_declarations/src/parser.ts`** (-1 line)
   - Removed `original: value,` from return object

3. **`packages/b_declarations/src/declaration-list-generator.ts`** (-2 lines)
   - Updated JSDoc example to remove `original` field

### Tests (3 files, -12 lines)

4. **`packages/b_declarations/src/parser.test.ts`** (-2 assertions)
   - Removed 2 `expect(result.value.original).toBe("red")`

5. **`packages/b_declarations/src/declaration-list-parser.test.ts`** (-8 lines)
   - Removed 3 property checks
   - Removed 2 whitespace trimming checks

6. **`packages/b_declarations/src/integration.test.ts`** (-1 assertion)
   - Removed `expect(result.value.original).toBe("url(image.png)")`

---

## ✅ Verification

**Tests:** 2206/2206 passing ✅
**Lines removed:** 15 lines total
**Zero references remaining:** Confirmed via `rg "original"` search

---

## 🎉 Result

Clean, simple interface:

```ts
interface DeclarationResult<T = unknown> {
  property: string;
  ir: T;
  // original: string; ❌ GONE
}
```

**Savings:** Cleaner API, less memory, no broken field, no maintenance burden.
