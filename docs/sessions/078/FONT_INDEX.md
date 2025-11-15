# 📚 Font Properties Documentation Index

**Complete planning documentation for implementing font-related CSS properties**

---

## 📄 Documents

### 1. **FONT_SUMMARY.txt** ⭐ START HERE
- Visual roadmap with ASCII art
- High-level overview of all 7 properties
- Phase breakdown and time estimates
- Critical design decisions summary

**Read this in: 2 minutes**

---

### 2. **FONT_QUICK_START.md** 🚀 DEVELOPER GUIDE
- Implementation order and rationale
- File structure templates
- Example code snippets (font-stretch)
- Per-property checklist
- Common pitfalls and warnings

**Read this in: 10 minutes**  
**Best for: Starting implementation today**

---

### 3. **FONT_MASTER_PLAN.md** 📖 FULL SPECIFICATION
- Complete property inventory (7 properties)
- Infrastructure requirements (keywords, types, parsers, generators)
- Detailed design decisions with code examples
- Testing strategy and acceptance criteria
- Research tasks and specification references
- Complexity estimates per property

**Read this in: 30 minutes**  
**Best for: Understanding full scope and architecture**

---

## 🎯 Quick Navigation

### I want to...

**...understand the scope**
→ Read `FONT_SUMMARY.txt` (2 min)

**...start coding today**
→ Read `FONT_QUICK_START.md` (10 min) → Start with font-stretch

**...understand the full architecture**
→ Read `FONT_MASTER_PLAN.md` (30 min)

**...know what NOT to do**
→ Read `FONT_QUICK_START.md` → "Common Pitfalls" section

**...see implementation order**
→ All 3 documents have this, but `FONT_SUMMARY.txt` is quickest

**...understand complexity**
→ `FONT_MASTER_PLAN.md` → "Complexity Estimates" table

---

## 🏗️ Implementation Phases

```
Phase 0: Foundation (1h)
  ├─ Keywords (6 files)
  └─ Number type + parser

Phase 1: Core Properties (12h)
  ├─ font-stretch (1h) ⭐ START HERE
  ├─ font-variant (1h)
  ├─ font-weight (2h)
  ├─ font-size (2h)
  ├─ font-style (2h)
  └─ font-family (4h) 🔥 HARDEST

Phase 2: Typography (2h)
  └─ line-height (2h)

Total: ~15 hours
```

---

## 🔑 Key Insights

### Why this order?
1. **font-stretch** (easiest) → Establish workflow
2. **font-variant** (simple) → Build confidence
3. **font-weight** (medium) → Learn numeric validation
4. **font-size** (medium) → Learn union patterns
5. **font-style** (medium) → Learn optional components
6. **font-family** (hardest) → Tackle quoting logic last

### What's the hardest part?
**font-family quoting rules:**
- String literals always quoted: `"Times New Roman"`
- Custom-idents conditionally quoted: `Times New Roman` vs `"Special Font!"`
- Generic families never quoted: `serif`, `sans-serif`

### What's the most important validation?
**font-weight numeric range: 1-1000**
- Accept: `1`, `400`, `700`, `1000`
- Reject: `0`, `1001`, `-100`

---

## ⚠️ Critical Reminders

1. **NO SHORTHAND PROPERTIES** - ADR 001: Longhands Only
   - ❌ `font` property is NOT supported
   - ✅ Only individual longhands: `font-family`, `font-size`, etc.

2. **Start simple, end complex**
   - Don't start with font-family
   - Establish workflow with font-stretch first

3. **Research before implementing**
   - Font-weight decimals: Check spec
   - Font-family quoting: Verify algorithm
   - Oblique default angle: Find spec value

4. **Test coverage expectations**
   - >90% coverage per property
   - Parser + Generator test suites

5. **Validation is non-negotiable**
   - font-weight: 1-1000 range
   - font-style oblique: -90deg to 90deg
   - line-height: non-negative

---

## 📚 External Resources

### Specifications
- CSS Fonts Module Level 4: https://www.w3.org/TR/css-fonts-4/
- CSS Values and Units Level 4: https://www.w3.org/TR/css-values-4/

### MDN References
- font-family: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
- font-size: https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
- font-weight: https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
- font-style: https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
- line-height: https://developer.mozilla.org/en-US/docs/Web/CSS/line-height

### Internal Docs
- ADR 001: Longhands Only (`docs/architecture/decisions/001-longhands-only.md`)
- Property Creation Handbook (`docs/architecture/patterns/006-PROPERTY_CREATION_HANDBOOK.md`)

---

## 🚀 Ready to Start?

1. ✅ Read `FONT_SUMMARY.txt` (2 min)
2. ✅ Read `FONT_QUICK_START.md` (10 min)
3. ✅ Review ADR 001 (no shorthands)
4. ✅ Study existing patterns (background-color, visibility)
5. 🎯 Start Phase 0: Create keywords + number type
6. 🎯 Implement font-stretch (easiest property)
7. 🎯 Proceed through Phase 1 in order

**Good luck! Remember: We break inconsistency, we don't work around it.** 🚀

---

**Last Updated:** 2025-11-15  
**Status:** Planning Complete - Ready for Implementation
