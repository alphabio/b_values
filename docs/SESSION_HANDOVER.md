# Session 072: Execution Protocol & Background-Position Longhands

**Date:** 2025-11-13  
**Status:** 🟡 IN-PROGRESS

---

## 🎯 What Was Attempted

### ❌ First Attempt Failed (reverted)

- Tried to implement background-position-x/y
- **ERROR:** Used non-existent function names
- **ERROR:** Didn't check existing code patterns
- **ERROR:** Didn't run `just check` before committing
- **WASTE:** ~$0.30 in tokens, 28 TypeScript errors

### ✅ Added Execution Protocol to AGENTS.md

**Commit:** `ab6133b`

Added mandatory protocol:

1. Find existing examples FIRST
2. Verify API surface before using
3. Copy-paste-modify working code
4. Run `just check` BEFORE committing

**Why:** Prevent assumption-based implementation that wastes money.

---

## 📊 Current State

### Working ✅

- ✅ Utilities pattern established (Session 071)
- ✅ 10 properties registered
- ✅ Git clean, all committed
- ✅ AGENTS.md updated with execution protocol

### Not Working ❌

- ❌ background-position-x NOT implemented
- ❌ background-position-y NOT implemented

---

## 🎯 Next Steps (Priority Order)

### **P1: Implement background-position-x/y (FOLLOW PROTOCOL)**

**Step 1: Look at existing property**

```bash
# Use background-color as template
cat packages/b_declarations/src/properties/background-color/parser.ts
cat packages/b_declarations/src/properties/background-color/generator.ts
cat packages/b_declarations/src/properties/background-color/definition.ts
```

**Step 2: Verify actual API exports**

```bash
# Check what's actually exported
cat packages/b_parsers/src/index.ts
cat packages/b_generators/src/index.ts
```

**Step 3: Copy-paste-modify**

- Copy background-color structure exactly
- Modify only property-specific parts
- Keep all patterns identical

**Step 4: Verify BEFORE commit**

```bash
just check    # Must pass
just build    # Must succeed
```

**DO NOT:**

- ❌ Assume function names exist
- ❌ Guess API shapes
- ❌ Commit without `just check`
- ❌ Claim complete without verification

### P2: After both properties work

```bash
pnpm generate:definitions  # Should show 12 properties
git add -A
git commit -m "feat(declarations): implement background-position-x/y longhands"
```

---

## 💡 Key Learning

**Problem:** Agent ignored existing patterns, invented APIs, wasted money.

**Solution:** Execution Protocol in AGENTS.md enforces:

- Look before implementing
- Verify before using
- Check before committing

**Cost of skipping protocol:** 15x more expensive (~$0.30 vs $0.02)

---

## 🔴 Critical for Next Agent

**YOU MUST:**

1. Read AGENTS.md Execution Protocol (lines 58-97)
2. Follow it exactly - no shortcuts
3. Look at existing code FIRST
4. Verify API exports BEFORE using
5. Run `just check` BEFORE claiming done

**The protocol exists because I failed. Don't repeat my mistake.**

---

## Handover Checklist

- [x] AGENTS.md updated with execution protocol
- [x] Git clean and committed
- [x] Session 072 marked IN-PROGRESS
- [ ] background-position-x/y to be implemented (next agent)
- [ ] Must follow protocol exactly

---

**Ready for next agent to execute correctly.**
