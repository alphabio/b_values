# 🚀 Quick Start - Session 064 Completion

**For the next agent: Start here**

---

## ⚡ TL;DR

Make 3 parsers return `{ kind: "keyword", value: "..." }` instead of bare strings.

**Time:** 30 minutes  
**Risk:** Low  
**Changes:** 3 files, 1 line each

---

## 🎯 The Changes

### 1. background-clip

```bash
vim packages/b_parsers/src/background/clip.ts
# Line 28: Add wrapper
return parseOk({ kind: "keyword", value: val as BackgroundClip });
```

### 2. background-attachment

```bash
vim packages/b_parsers/src/background/attachment.ts
# Line 26: Add wrapper
return parseOk({ kind: "keyword", value: val as BackgroundAttachment });
```

### 3. background-origin

```bash
vim packages/b_parsers/src/background/origin.ts
# Line 26: Add wrapper
return parseOk({ kind: "keyword", value: val as BackgroundOrigin });
```

---

## ✅ Validation

```bash
just test    # Should show 2396 passing (8 newly fixed)
just check   # Should be all green
```

---

## 📖 Need Details?

Read: `FINAL_IMPLEMENTATION_PLAN.md`

---

## 🎯 Why?

**Current:** 8 tests failing because parsers return strings  
**Tests expect:** `{ kind: "keyword", value }` (discriminated unions)  
**After:** All tests pass, architecture consistent with bg-size pattern

---

**That's it. Three lines. Ship it.** 🚀
