# 🚀 Session 064 - Handoff Checklist

**Status:** 🔴 TDD RED → Ready for 🟢 GREEN

---

## ✅ Completed

- [x] Deep research (9 session docs analyzed)
- [x] Architecture decision (parsers wrap keywords)
- [x] TDD tests written (26 tests RED)
- [x] Implementation plan documented
- [x] Quick start guide created
- [x] Session handover updated

---

## 📋 Next Agent TODO

### Immediate (30 min)

- [ ] Read `QUICK_START.md`
- [ ] Update 3 parser files:
  - [ ] `packages/b_parsers/src/background/clip.ts:28`
  - [ ] `packages/b_parsers/src/background/attachment.ts:26`
  - [ ] `packages/b_parsers/src/background/origin.ts:26`
- [ ] Run `pnpm test clip.test attachment.test origin.test`
- [ ] Run `just test` (expect 2414 passing)
- [ ] Commit

### Validation (15 min)

- [ ] Run `just typecheck` (expect all green)
- [ ] Run `just check` (full quality gate)
- [ ] Verify no regressions
- [ ] Update SESSION_HANDOVER.md (mark 🟢 COMPLETE)

---

## 📁 Key Files

**Read first:**
- `docs/sessions/064/QUICK_START.md` ⭐
- `docs/sessions/064/SESSION_SUMMARY.md`

**Reference:**
- `docs/sessions/064/FINAL_IMPLEMENTATION_PLAN.md`
- `docs/sessions/064/TDD_APPROACH.md`

**Test files (26 tests RED):**
- `packages/b_parsers/src/background/clip.test.ts`
- `packages/b_parsers/src/background/attachment.test.ts`
- `packages/b_parsers/src/background/origin.test.ts`

---

## 🎯 Success Criteria

**Tests:**
```bash
just test
# Before: 2388 passing, 26 failing
# After:  2414 passing, 0 failing ✅
```

**Typecheck:**
```bash
just typecheck
# All 9 packages green ✅
```

**Quality:**
```bash
just check
# Format ✅ Lint ✅ Typecheck ✅
```

---

## 🔧 The Change

**Find:** `return parseOk(val as Type);`  
**Replace:** `return parseOk({ kind: "keyword", value: val as Type });`

**Files:** 3 (clip, attachment, origin)  
**Lines:** 3 (one per file)  
**Risk:** Low (TDD validated, pattern proven)

---

## 📊 Test Status

**Current:**
```
🔴 Parser tests:     18 failing | 4 passing  (22 total)
🔴 Declaration tests: 8 failing | 0 passing  (8 total)
🟢 Other tests:      2388 passing
```

**After implementation:**
```
🟢 Parser tests:     22 passing | 0 failing  (22 total)
🟢 Declaration tests: 8 passing | 0 failing  (8 total)
🟢 Other tests:      2388 passing
🎉 Total:            2418 passing | 0 failing
```

---

## 💡 If Issues Arise

**Type errors:**
- Check parser return types match schema
- Verify `KeywordValue` type imported

**Test failures:**
- Compare with `bg-size.ts` (reference implementation)
- Check generator handles `{ kind: "keyword" }`
- Verify schemas accept union types

**Need help:**
- Read `FINAL_IMPLEMENTATION_PLAN.md` Edge Cases section
- All generators already handle keyword objects ✅
- Schemas already correct or need minor fix ✅

---

## 🎓 Context

**Why this change:**
- Consistency: Matches bg-size pattern
- DX: Uniform consumer API (switch on .kind)
- Type safety: Honest signatures

**Architecture:**
- Universal functions: Handled at declaration layer ✅
- Keywords: Should be discriminated unions ✅
- Generators: Already support both ✅

**Tests validate:**
- Returns `{ kind: "keyword", value }`
- Not bare strings
- Architecture alignment

---

**Ready to ship. Change 3 lines. Tests go green.** 🚀
