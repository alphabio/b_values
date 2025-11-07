# Background Properties Audit - Session 057

**Date:** 2025-11-08
**Purpose:** Ensure all background properties align with background-size architecture

---

## ✅ Reference: background-size (Post Session 056)

### Architecture

```
@b/keywords/src/bg-size.ts          ← Zod schema (auto, cover, contain)
@b/types/src/bg-size.ts             ← Uses cssValueSchema for width/height
@b/parsers/src/background/size.ts   ← Uses parseNodeToCssValue
@b/generators/src/background/size.ts ← Uses cssValueToCss
@b/declarations/properties/background-size/
  ├── types.ts       ← Re-exports from @b/types
  ├── parser.ts      ← Thin orchestrator (createMultiValueParser)
  ├── generator.ts   ← Thin orchestrator
  └── definition.ts  ← Register property
```

### Key Patterns

✅ Keywords in `@b/keywords` with Zod schema
✅ Component values use `cssValueSchema` → var(), calc() for free
✅ Generic utilities (parseNodeToCssValue, cssValueToCss)
✅ Thin property-level orchestrators
✅ Package separation (keywords → types → parsers → generators → declarations)

---

## 🔍 Audit Findings

### 1. background-repeat

**Current Structure:**

- ❌ No `@b/keywords` - Keywords inline in parser
- ❌ No `@b/types` - Types inline in declarations
- ✅ Parser in `@b/parsers/src/background/repeat.ts`
- ❌ No generator in `@b/generators` - Inline in declarations
- ✅ Property orchestrator follows pattern

**Keywords:** `repeat`, `space`, `round`, `no-repeat`, `repeat-x`, `repeat-y`

**Current IR:**

```typescript
type RepeatStyle =
  | { kind: "shorthand"; value: "repeat-x" | "repeat-y" }
  | { kind: "explicit"; horizontal: RepetitionValue; vertical: RepetitionValue };
```

**Assessment:**

- ⚠️ **Does NOT use cssValueSchema** - Keywords only, no length/percentage values
- ⚠️ **Would NOT benefit from var()/calc()** - Spec doesn't support dynamic values
- ❌ **Missing package separation** - Keywords and types not in shared packages
- ✅ **Parser is clean** - Simple keyword validation

**Recommendation:**

- **Refactor for consistency** - Move keywords to `@b/keywords`, types to `@b/types`
- **Keep current approach** - `cssValueSchema` not appropriate (keyword-only property)
- **Add generator** - Move to `@b/generators` for consistency

---

### 2. background-origin

**Current Structure:**

- ❌ No `@b/keywords` - Keywords inline in parser
- ❌ No `@b/types` - Types inline in declarations
- ✅ Parser in `@b/parsers/src/background/origin.ts`
- ❌ No generator in `@b/generators` - Inline in declarations
- ✅ Property orchestrator follows pattern

**Keywords:** `border-box`, `padding-box`, `content-box`

**Current IR:**

```typescript
type OriginBoxValue = "border-box" | "padding-box" | "content-box";
```

**Assessment:**

- ⚠️ **Does NOT use cssValueSchema** - Keywords only
- ⚠️ **Would NOT benefit from var()/calc()** - Box keywords only
- ❌ **Missing package separation** - Keywords and types not in shared packages
- ✅ **Parser is trivial** - Single keyword validation

**Recommendation:**

- **Refactor for consistency** - Move keywords to `@b/keywords`, types to `@b/types`
- **Keep current approach** - `cssValueSchema` not appropriate
- **Add generator** - Move to `@b/generators`
- **Consider:** Could share box keywords with background-clip (almost same values)

---

### 3. background-clip

**Current Structure:**

- ❌ No `@b/keywords` - Keywords inline in parser
- ❌ No `@b/types` - Types inline in declarations
- ✅ Parser in `@b/parsers/src/background/clip.ts`
- ❌ No generator in `@b/generators` - Inline in declarations
- ✅ Property orchestrator follows pattern

**Keywords:** `border-box`, `padding-box`, `content-box`, `text`

**Current IR:**

```typescript
type BoxValue = "border-box" | "padding-box" | "content-box" | "text";
```

**Assessment:**

- ⚠️ **Does NOT use cssValueSchema** - Keywords only
- ⚠️ **Would NOT benefit from var()/calc()** - Box keywords only
- ❌ **Missing package separation** - Keywords and types not in shared packages
- ✅ **Parser is trivial** - Single keyword validation
- ⚠️ **Shares 3/4 keywords with background-origin** - Could extract common box keywords

**Recommendation:**

- **Refactor for consistency** - Move keywords to `@b/keywords`, types to `@b/types`
- **Keep current approach** - `cssValueSchema` not appropriate
- **Add generator** - Move to `@b/generators`
- **Extract common keywords** - Create `boxKeywordSchema` for border-box, padding-box, content-box

---

### 4. background-attachment

**Current Structure:**

- ❌ No `@b/keywords` - Keywords inline in parser
- ❌ No `@b/types` - Types inline in declarations
- ✅ Parser in `@b/parsers/src/background/attachment.ts`
- ❌ No generator in `@b/generators` - Inline in declarations
- ✅ Property orchestrator follows pattern

**Keywords:** `scroll`, `fixed`, `local`

**Current IR:**

```typescript
type AttachmentValue = "scroll" | "fixed" | "local";
```

**Assessment:**

- ⚠️ **Does NOT use cssValueSchema** - Keywords only
- ⚠️ **Would NOT benefit from var()/calc()** - Attachment keywords only
- ❌ **Missing package separation** - Keywords and types not in shared packages
- ✅ **Parser is trivial** - Single keyword validation

**Recommendation:**

- **Refactor for consistency** - Move keywords to `@b/keywords`, types to `@b/types`
- **Keep current approach** - `cssValueSchema` not appropriate
- **Add generator** - Move to `@b/generators`

---

## 📊 Summary Table

| Property                  | Keywords in @b/keywords | Types in @b/types | Parser in @b/parsers | Generator in @b/generators | Uses cssValueSchema | Should use cssValueSchema |
| ------------------------- | ----------------------- | ----------------- | -------------------- | -------------------------- | ------------------- | ------------------------- |
| **background-size**       | ✅                      | ✅                | ✅                   | ✅                         | ✅                  | ✅ (length/percentage)    |
| **background-repeat**     | ❌                      | ❌                | ✅                   | ❌                         | ❌                  | ❌ (keywords only)        |
| **background-origin**     | ❌                      | ❌                | ✅                   | ❌                         | ❌                  | ❌ (box keywords only)    |
| **background-clip**       | ❌                      | ❌                | ✅                   | ❌                         | ❌                  | ❌ (box keywords only)    |
| **background-attachment** | ❌                      | ❌                | ✅                   | ❌                         | ❌                  | ❌ (keywords only)        |

---

## 🎯 Recommendations

### Priority 1: Package Separation (Consistency)

All four properties should follow the same package structure as background-size:

1. **Move keywords to `@b/keywords`**
   - `bg-repeat.ts` - repeat, space, round, no-repeat, repeat-x, repeat-y
   - `box.ts` - border-box, padding-box, content-box (shared!)
   - `bg-clip.ts` - extends box with `text`
   - `bg-attachment.ts` - scroll, fixed, local

2. **Move types to `@b/types`**
   - `bg-repeat.ts` - RepeatStyle, BackgroundRepeat
   - `bg-origin.ts` - OriginBoxValue, BackgroundOrigin
   - `bg-clip.ts` - BoxValue, BackgroundClip
   - `bg-attachment.ts` - AttachmentValue, BackgroundAttachment

3. **Add generators to `@b/generators`**
   - `background/repeat.ts`
   - `background/origin.ts`
   - `background/clip.ts`
   - `background/attachment.ts`

### Priority 2: Extract Common Box Keywords

**Create shared box keyword schema:**

```typescript
// packages/b_keywords/src/box.ts
export const boxKeywordSchema = z.union([z.literal("border-box"), z.literal("padding-box"), z.literal("content-box")]);
```

Used by:

- `background-origin` (exactly these 3)
- `background-clip` (extends with `text`)
- Future: `mask-origin`, `mask-clip`, etc.

### Priority 3: Verify CSS-Wide Keywords

✅ All properties now correctly delegate CSS-wide keywords to `parseDeclaration`
✅ Property parsers simplified (no CSS-wide checks)

---

## ❌ NOT Recommended: Use cssValueSchema

**None of these properties should use `cssValueSchema`:**

- **background-repeat**: Keywords only (repeat, space, etc.) - no dynamic values
- **background-origin**: Box keywords only - no lengths/percentages
- **background-clip**: Box keywords only (+ text) - no dynamic values
- **background-attachment**: Attachment keywords only - no dynamic values

**Why?** The CSS spec for these properties doesn't accept `<length>`, `<percentage>`, or other value types that would benefit from `var()` / `calc()` support.

**Correct pattern:** Simple keyword validation (current approach is fine, just needs package separation)

---

## ✅ Action Items

### Phase 1: Consistency Refactor (All 4 Properties)

For each property:

1. Create keyword schema in `@b/keywords`
2. Create type schemas in `@b/types`
3. Create generator in `@b/generators`
4. Update property orchestrators to use shared packages
5. Update tests

**Estimated effort:** ~2-3 hours total (straightforward refactor)

### Phase 2: Box Keywords Extraction

1. Create `@b/keywords/src/box.ts` with shared schema
2. Update `background-origin` to use it
3. Extend in `background-clip` for `text` keyword
4. Document for future `mask-*` properties

**Estimated effort:** ~30 minutes

---

## 📈 Impact

**Benefits:**

- ✅ Consistent architecture across all background properties
- ✅ Shared keywords package for reuse (box keywords)
- ✅ Clear separation of concerns (keywords → types → parsers → generators)
- ✅ Easier to add new properties (clear pattern)
- ✅ Better type safety (Zod schemas in one place)

**Non-benefits (avoided):**

- ❌ Using `cssValueSchema` where not appropriate
- ❌ Over-engineering keyword-only properties

---

## 🎓 Key Insight

**Not every property needs `cssValueSchema`!**

- **Use `cssValueSchema`:** Properties with length, percentage, number values (background-size, width, margin, etc.)
- **Don't use `cssValueSchema`:** Keyword-only properties (background-repeat, background-origin, etc.)

**The pattern is about consistency and package separation, not about forcing every property to use the same value type.**

---

**Status:** 📋 Audit Complete - Ready for Refactor

**Next:** Decide if we refactor all 4 properties now or incrementally
