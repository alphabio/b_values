# Session 047: Cleanup Scope - Remove sourceContext

**Next Session Tasks**
**Estimated Time:** 30 minutes

---

## 🎯 What to Remove

### 1. Issue Type (packages/b_types/src/result/issue.ts)

**Remove:**
- ✅ `SourceLocation` interface (lines 51-58)
- ✅ `SourceLocationRange` interface (lines 67-74)
- ✅ `location?: SourceLocationRange` field from Issue (line 108)
- ✅ `sourceContext?: string` field from Issue (line 110)
- ✅ `location` parameter from createError/createWarning/createInfo helpers
- ✅ `sourceContext` parameter from createError/createWarning/createInfo helpers
- ✅ Example in JSDoc showing location/sourceContext (lines 89-90)

**Keep:**
- ✅ `property` field (valuable!)
- ✅ `path` field (excellent!)
- ✅ All other fields

---

### 2. Parser Enrichment (packages/b_declarations/src/parser.ts)

**Remove:**
- ✅ `import * as Ast from "@b/utils"` (line 7)
- ✅ `enrichIssues()` function (lines 175-201)
- ✅ Call to `enrichIssues()` before returns (lines 119, 127)

**Simplify to:**
```typescript
// Just add property, nothing else
const enrichedIssues = allIssues.map(issue => ({
  ...issue,
  property,
}));
```

---

### 3. Utils (packages/b_utils/src/parse/ast.ts)

**Remove:**
- ✅ `formatSourceContext()` function (lines 44-83)
- ✅ Related JSDoc/comments

**Keep:**
- ✅ `splitNodesByComma()` - still used!
- ✅ Other AST utilities

---

### 4. Tests (packages/b_declarations/src/parser.test.ts)

**Remove these test suites:**
- ✅ "issue enrichment - source context" (lines ~220-380)
  - should add sourceContext when issue has location (string input)
  - should add sourceContext when issue has location (object input)
  - should handle issues without location (multi-value parsers)
  - should format pointer alignment correctly
  - should enrich all issues (multiple errors)

**Keep these test suites:**
- ✅ "issue enrichment - property context" (lines ~160-220)
  - should add property to issues on parse failure
  - should add property to issues from string input
  - should add property to issues from object input
- ✅ "issue enrichment - success with warnings"
- ✅ "issue enrichment - partial success"

**Update:**
- ✅ Remove assertions checking `sourceContext` field
- ✅ Remove assertions checking `location` field

---

### 5. Type Tests (packages/b_types/src/result/issue.test.ts)

**Check and remove:**
- ✅ Any tests for `SourceLocation` type
- ✅ Any tests for `SourceLocationRange` type
- ✅ Tests checking `location` field in Issue

---

### 6. Documentation (docs/sessions/046/)

**Keep for historical record:**
- ✅ All investigation documents
- ✅ Decision rationale
- ✅ Why it didn't work

**Add:**
- ✅ Create CLEANUP_SUMMARY.md documenting what was removed

---

## 📋 Validation Checklist

After cleanup:

- [ ] All tests pass (expect ~1959 tests, maybe less)
- [ ] All typechecks pass
- [ ] All builds pass
- [ ] `just check` passes
- [ ] No references to `sourceContext` in codebase
- [ ] No references to `location` in Issue type
- [ ] `formatSourceContext` removed
- [ ] Property enrichment still works

---

## 🎯 What Remains (Good Code)

**Issue enrichment:**
```typescript
// Simple property enrichment
const enrichedIssues = allIssues.map(issue => ({
  ...issue,
  property,  // ← Always added, valuable!
}));
```

**Issue fields users get:**
- ✅ `property` - which CSS property failed
- ✅ `path` - IR navigation (generator issues)
- ✅ `code`, `severity`, `message` - core info
- ✅ `suggestion`, `expected`, `received` - helpful hints

---

## 📊 Lines of Code Impact

**Estimated removals:**
- Issue type: ~80 lines
- Parser enrichment: ~30 lines
- formatSourceContext: ~40 lines
- Tests: ~200 lines
- **Total: ~350 lines removed**

**Estimated additions:**
- Simplified enrichment: ~5 lines
- Documentation: ~20 lines
- **Total: ~25 lines added**

**Net: -325 lines of dead code removed** 🎉

---

## ⚠️ Breaking Changes

**Public API changes:**
- ❌ Remove `SourceLocation` export from `@b/types`
- ❌ Remove `SourceLocationRange` export from `@b/types`
- ❌ Remove `location` field from Issue
- ❌ Remove `sourceContext` field from Issue

**Impact:** Low - these fields were never populated anyway

---

## ✅ Result

**After cleanup:**
- Simpler codebase
- No dead code
- Consistent UX (`path` always there)
- Property enrichment still working
- All tests passing

**Better DX:**
- Users always get `path` (reliable)
- Users always get `property` (valuable)
- No "sometimes available" confusion
- Clear, predictable API

---

**Ready for Session 047!**
