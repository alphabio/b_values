# Session 064: Final Implementation Plan - Keyword Wrapping

**Date:** 2025-11-10  
**Status:** 🟢 READY FOR EXECUTION  
**Estimated Time:** 45 minutes  
**Complexity:** Low (surgical changes)

---

## 🎯 Objective

Make all parsers return discriminated unions with `.kind` field for uniform consumer API.

**Principle:** "Parse Authorship, Not Evaluation" + "Everything has `.kind`"

---

## 📊 Current State

**Typecheck:** ✅ All green (9/9 packages)  
**Tests:** 🟡 8 failing (expect correct pattern - will pass after fix)  
- 5x `background-clip/parser.test.ts`
- 3x `var-support.integration.test.ts`

**Architecture:** ✅ Injection already complete (line 144-152 in `createMultiValueParser.ts`)

---

## 🔍 The Issue

**Three parsers return bare strings:**
- `packages/b_parsers/src/background/clip.ts` line 28
- `packages/b_parsers/src/background/attachment.ts` line 26
- `packages/b_parsers/src/background/origin.ts` line 26

**Tests expect (correctly):**
```ts
{ kind: "keyword", value: "border-box" }
```

**Parsers return (incorrectly):**
```ts
"border-box"
```

---

## 📋 Implementation Checklist

### Phase 1: Update Parsers (3 files, 1 line each)

#### File 1: `packages/b_parsers/src/background/clip.ts`

**Line 28 - Change:**
```typescript
return parseOk(val as BackgroundClip);
```

**To:**
```typescript
return parseOk({ kind: "keyword", value: val as BackgroundClip });
```

**Full context (lines 24-30):**
```typescript
const val = node.name.toLowerCase();
if (BACKGROUND_CLIP.includes(val as BackgroundClip)) {
  return parseOk({ kind: "keyword", value: val as BackgroundClip });
}

return parseErr(
```

---

#### File 2: `packages/b_parsers/src/background/attachment.ts`

**Line 26 - Change:**
```typescript
return parseOk(val as BackgroundAttachment);
```

**To:**
```typescript
return parseOk({ kind: "keyword", value: val as BackgroundAttachment });
```

**Full context (lines 22-28):**
```typescript
const val = node.name.toLowerCase();
if (BACKGROUND_ATTACHMENT.includes(val as BackgroundAttachment)) {
  return parseOk({ kind: "keyword", value: val as BackgroundAttachment });
}

return parseErr(
```

---

#### File 3: `packages/b_parsers/src/background/origin.ts`

**Line 26 - Change:**
```typescript
return parseOk(val as BackgroundOrigin);
```

**To:**
```typescript
return parseOk({ kind: "keyword", value: val as BackgroundOrigin });
```

**Full context (lines 22-28):**
```typescript
const val = node.name.toLowerCase();
if (BACKGROUND_ORIGIN.includes(val as BackgroundOrigin)) {
  return parseOk({ kind: "keyword", value: val as BackgroundOrigin });
}

return parseErr(
```

---

### Phase 2: Update Type Schemas (3 files)

These files already have the correct schema structure, but we need to ensure the parser return types match.

#### File 1: `packages/b_declarations/src/properties/background-clip/types.ts`

**Check line 16 - Should already be:**
```typescript
const backgroundClipValueSchema = z.union([backgroundClipSchema, cssValueSchema]);
```

**This is ALREADY CORRECT** ✅ (accepts both keywords and CssValue)

**But `backgroundClipSchema` (line 11) needs wrapping:**

**Change:**
```typescript
const backgroundClipSchema = Keywords.backgroundClip;
```

**To:**
```typescript
const backgroundClipKeywordSchema = z.object({
  kind: z.literal("keyword"),
  value: Keywords.backgroundClip,
}).strict();

const backgroundClipValueSchema = z.union([backgroundClipKeywordSchema, cssValueSchema]);
```

**Remove line 16** (now redundant)

---

#### File 2: `packages/b_declarations/src/properties/background-attachment/types.ts`

Check if this file exists:
```bash
ls packages/b_declarations/src/properties/background-attachment/types.ts
```

If it exists, apply same pattern as background-clip.

If it doesn't exist, check how background-attachment is typed.

---

#### File 3: `packages/b_declarations/src/properties/background-origin/types.ts`

Same as attachment - check existence and apply pattern.

---

### Phase 3: Verify Generators (Already Correct ✅)

**File:** `packages/b_declarations/src/utils/generate-value.ts`

**Lines 42-44 already handle keyword objects:**
```typescript
// Handle string literals (e.g., "border-box", "padding-box")
if (typeof value === "string") {
  return generateOk(value);
}
```

**Line 24-26 in `packages/b_utils/src/generate/css-value.ts` also handles:**
```typescript
case "keyword": {
  return value.value;
}
```

**No changes needed** ✅

---

### Phase 4: Validation

#### Step 1: Run Tests
```bash
just test
```

**Expected:**
- ✅ All 2396 tests pass
- ✅ 8 previously failing tests now pass
- ✅ No regressions

#### Step 2: Run Typecheck
```bash
just typecheck
```

**Expected:**
- ✅ All 9 packages green
- ✅ No type errors

#### Step 3: Run Full Quality Check
```bash
just check
```

**Expected:**
- ✅ Format: green
- ✅ Lint: green
- ✅ Typecheck: green

---

## 🎯 Success Criteria

- [ ] Parser changes: 3 files × 1 line = 3 lines changed
- [ ] Schema updates: 1-3 files (wrap keyword schemas)
- [ ] All tests passing (2396 tests)
- [ ] All typechecks passing (9 packages)
- [ ] No generator changes needed (already handles both)
- [ ] Architecture consistent with bg-size pattern

---

## 🔄 Rollback Plan

If anything fails:

```bash
git checkout packages/b_parsers/src/background/clip.ts
git checkout packages/b_parsers/src/background/attachment.ts
git checkout packages/b_parsers/src/background/origin.ts
git checkout packages/b_declarations/src/properties/background-clip/types.ts
```

All changes are in version control.

---

## 📝 Commit Message

```
fix(parsers): wrap keywords in discriminated unions

- Update background-clip/attachment/origin parsers to return { kind: "keyword", value }
- Align with "parse authorship" principle and bg-size pattern
- All parsers now return uniform discriminated unions
- Fixes 8 failing tests that expected correct pattern

Refs: Session 064
```

---

## 🚀 Execution Order

1. **Parse changes first** (3 parser files)
2. **Schema updates** (1-3 type files)
3. **Run tests** (validation)
4. **Run typecheck** (validation)
5. **Run full check** (quality gate)
6. **Commit** (if all green)

---

## ⚠️ Edge Cases

### Case 1: Type Errors in Schemas

If schema updates cause type errors, the issue is likely:
- Parser return type doesn't match schema
- Need to update type annotations in parser files

**Solution:** Add explicit return type to parser functions.

### Case 2: Tests Still Fail

If tests still fail after parser changes:
- Check test expectations match new IR shape
- Verify generators handle keyword objects
- Check createMultiValueParser injection (line 144-152)

### Case 3: Generator Fails

If generators break:
- Verify `generateValue()` handles both strings AND objects
- Check `cssValueToCss()` has keyword case
- Both should already be correct (verified above)

---

## 📚 Reference Files

**Parsers to modify:**
- `packages/b_parsers/src/background/clip.ts:28`
- `packages/b_parsers/src/background/attachment.ts:26`
- `packages/b_parsers/src/background/origin.ts:26`

**Schemas to update:**
- `packages/b_declarations/src/properties/background-clip/types.ts:11-16`
- `packages/b_declarations/src/properties/background-attachment/types.ts` (if exists)
- `packages/b_declarations/src/properties/background-origin/types.ts` (if exists)

**Reference implementations (already correct):**
- `packages/b_parsers/src/background/size.ts:34` (wraps keywords)
- `packages/b_types/src/bg-size.ts:13-27` (discriminated union schema)
- `packages/b_utils/src/generate/css-value.ts:24-26` (handles keyword objects)

---

## 🎓 Key Insights

1. **Tests were right all along** - They expect discriminated unions
2. **Generators already support it** - Both string and object handling
3. **bg-size is the reference** - Already implements the pattern
4. **Injection is complete** - Line 144-152 handles var/calc/etc
5. **Only keywords need wrapping** - Everything else already returns objects

---

## 🏁 Next Agent Instructions

If you're picking this up:

1. Read this file completely
2. Check current test status: `just test`
3. Make the 3 parser changes (Phase 1)
4. Update schemas (Phase 2)
5. Run tests: `just test`
6. Run typecheck: `just typecheck`
7. If all green → commit
8. If issues → check edge cases section above

**Estimated time:** 30-45 minutes for careful execution

**Risk:** Low - changes are surgical, pattern is proven
