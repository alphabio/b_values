# Audit: Removing `original` Field from DeclarationResult

**Date:** 2025-11-07
**Decision:** Remove the `original` field - it's broken and adds unnecessary complexity

---

## 📊 Impact Analysis

### Files to Modify

1. **`src/types.ts`** - Remove field from interface
   - Line 60: `original: string;` in `DeclarationResult<T>`

2. **`src/parser.ts`** - Remove from return value
   - Line 132: `original: value,` in parseOk call

3. **`src/declaration-list-generator.ts`** - Update JSDoc example
   - Lines 16-17: Remove `original` from example comments

### Tests to Update

4. **`src/parser.test.ts`** - 2 assertions
   - Line 34: `expect(result.value.original).toBe("red");`
   - Line 132: `expect(result.value.original).toBe("red");`

5. **`src/declaration-list-parser.test.ts`** - 5 assertions
   - Line 209: `expect(result.value[0].original).toBe("10deg");`
   - Line 212: `expect(result.value[1].original).toBe("red");`
   - Line 215: `expect(result.value[2].original).toBe("blue");`
   - Lines 220-221: Whitespace trimming checks on `original`

6. **`src/integration.test.ts`** - 1 assertion
   - Line 17: `expect(result.value.original).toBe("url(image.png)");`

---

## 📝 Summary

**Total files:** 6
**Implementation files:** 3
**Test files:** 3
**Total lines to change:** ~11 lines

**Complexity:** Low - straightforward removal, no logic dependencies

---

## ✅ Rationale

Current implementation is broken:

- Captures css-tree's regenerated output, not actual source
- No clear use case - client already has original input
- Adds maintenance burden

Clean removal is the right call.
