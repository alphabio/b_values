# 🔄 Re-Audit: Transition Readiness Assessment

**Date:** 2025-11-12  
**Context:** Moving from background → transition properties  
**Goal:** Identify gaps before implementing transition family

---

## ✅ Background Family Complete (9/9)

All background longhand properties fully implemented with parsers, generators, and tests:

- background-attachment
- background-blend-mode
- background-clip
- background-color
- background-image
- background-origin
- background-position
- background-repeat
- background-size

**Status:** ✅ Ready to move on from background

---

## 🎯 Transition Family Requirements

### Longhand Properties (4)

1. **transition-property**: `<property-name>#`
   - Values: CSS property names | "none" | "all"
   - Pattern: Multi-value (comma-separated list)

2. **transition-duration**: `<time>#`
   - Values: `<number>s` | `<number>ms`
   - Pattern: Multi-value (comma-separated list)

3. **transition-timing-function**: `<easing-function>#`
   - Keywords: linear, ease, ease-in, ease-out, ease-in-out, step-start, step-end
   - Functions: `cubic-bezier(n,n,n,n)`, `steps(n[, start|end])`
   - Pattern: Multi-value (comma-separated list)

4. **transition-delay**: `<time>#`
   - Values: `<number>s` | `<number>ms` (can be negative)
   - Pattern: Multi-value (comma-separated list)

---

## 📊 Dependency Gap Analysis

### ✅ Already Have

| Type                | Location                        | Status      |
| ------------------- | ------------------------------- | ----------- |
| Angle               | `@b/types`, `@b/units`          | ✅ Complete |
| Length              | `@b/types`, `@b/units`          | ✅ Complete |
| Percentage          | `@b/types`, `@b/units`          | ✅ Complete |
| Color               | `@b/types` + parsers/generators | ✅ Complete |
| Multi-value pattern | All background-\* properties    | ✅ Proven   |

### ❌ Missing for Transition

| Type                 | Needed For          | Complexity | Notes                      |
| -------------------- | ------------------- | ---------- | -------------------------- |
| **Time**             | duration, delay     | LOW        | Similar to Length/Angle    |
| **Easing Functions** | timing-function     | MEDIUM     | Keyword + function parsing |
| **Property Names**   | transition-property | LOW        | String validation          |

---

## 🔧 Required New Types

### 1. Time Type (HIGH PRIORITY)

**Type Definition:**

```typescript
// packages/b_types/src/time.ts
export interface Time {
  kind: "time";
  value: number;
  unit: "s" | "ms";
}
```

**Unit Definition:**

```typescript
// packages/b_units/src/time.ts
export const timeUnits = ["s", "ms"] as const;
export type TimeUnit = (typeof timeUnits)[number];
export function isTimeUnit(u: string): u is TimeUnit {
  return timeUnits.includes(u as TimeUnit);
}
```

**Parser:**

```typescript
// packages/b_parsers/src/time.ts
export function parseTimeNode(node: csstree.CssNode): ParseResult<Time>;
```

**Generator:**

```typescript
// packages/b_generators/src/time.ts
export function generate(time: Time): GenerateResult;
```

**Similar to:** Angle, Length (proven pattern)

---

### 2. Easing Function Type (MEDIUM PRIORITY)

**Type Definition:**

```typescript
// packages/b_types/src/easing-function.ts
export type EasingFunction =
  | { kind: "keyword"; value: EasingKeyword }
  | { kind: "cubic-bezier"; x1: number; y1: number; x2: number; y2: number }
  | { kind: "steps"; steps: number; position?: "start" | "end" };

export type EasingKeyword = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "step-start" | "step-end";
```

**Keywords:**

```typescript
// packages/b_keywords/src/easing.ts
export const easingKeywords = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "step-start",
  "step-end",
] as const;
```

**Parser:**

```typescript
// packages/b_parsers/src/easing-function.ts
export function parseEasingFunction(node: csstree.CssNode): ParseResult<EasingFunction>;
```

**Generator:**

```typescript
// packages/b_generators/src/easing-function.ts
export function generate(easing: EasingFunction): GenerateResult;
```

**Similar to:** Gradient parsing (function + keywords)

---

### 3. Property Name Type (LOW PRIORITY)

**Type Definition:**

```typescript
// packages/b_types/src/property-name.ts
export type PropertyName = { kind: "keyword"; value: "none" | "all" } | { kind: "custom"; value: string };
```

**Parser:**

```typescript
// packages/b_parsers/src/property-name.ts
export function parsePropertyName(node: csstree.CssNode): ParseResult<PropertyName>;
```

**Generator:**

```typescript
// packages/b_generators/src/property-name.ts
export function generate(name: PropertyName): GenerateResult;
```

**Similar to:** Simple keyword/string union (easiest)

---

## 📋 Implementation Checklist

### Phase 1: Foundation Types (Session 019?)

- [ ] Create `Time` type in `@b/types`
- [ ] Create time units in `@b/units`
- [ ] Create time parser in `@b/parsers`
- [ ] Create time generator in `@b/generators`
- [ ] Add comprehensive tests for time (positive, negative, 0, unit conversion awareness)

### Phase 2: Easing Functions (Session 020?)

- [ ] Create `EasingFunction` type in `@b/types`
- [ ] Create easing keywords in `@b/keywords`
- [ ] Create easing parser in `@b/parsers` (keyword + cubic-bezier + steps)
- [ ] Create easing generator in `@b/generators`
- [ ] Add comprehensive tests

### Phase 3: Property Names (Session 020?)

- [ ] Create `PropertyName` type in `@b/types`
- [ ] Create property-name parser
- [ ] Create property-name generator
- [ ] Add tests

### Phase 4: Transition Properties (Session 021?)

- [ ] Implement `transition-duration` (uses Time, multi-value)
- [ ] Implement `transition-delay` (uses Time, multi-value, allows negative)
- [ ] Implement `transition-timing-function` (uses EasingFunction, multi-value)
- [ ] Implement `transition-property` (uses PropertyName, multi-value)
- [ ] Full integration tests

---

## 🎯 Recommended Approach

### Option A: Sequential (Safer)

1. Session 019: Time type + transition-duration + transition-delay
2. Session 020: Easing function + transition-timing-function
3. Session 021: Property name + transition-property

**Pros:** Clear dependencies, can test each layer  
**Cons:** 3 sessions for 4 properties

### Option B: Batch Foundation (Faster)

1. Session 019: Time + EasingFunction + PropertyName types (no properties yet)
2. Session 020: All 4 transition properties at once

**Pros:** Faster overall, types proven before property implementation  
**Cons:** Larger session scope, foundation without immediate use

### Option C: Vertical Slice (Recommended)

1. Session 019: Time type + transition-duration + transition-delay (2 properties)
2. Session 020: Easing + PropertyName + transition-timing-function + transition-property (2 properties)

**Pros:** Each session delivers working properties, balanced scope  
**Cons:** None significant

---

## 🚨 Critical Questions Before Starting

### 1. Are we ready to leave background family?

**Answer:** ✅ YES - All 9 background longhands complete with full test coverage

### 2. Should we add transition to property-manifest.json?

**Answer:** 📝 YES - Add all 4 transition longhand properties to manifest for consistency

### 3. Do we need animation properties too?

**Answer:** ⏳ NO - Transition first, animation later (they share Time/Easing dependencies)

### 4. What about transform properties?

**Answer:** ⏳ LATER - Different complexity class, transition is more foundational

---

## 📈 Architecture Confidence

| Area                    | Status    | Evidence                                |
| ----------------------- | --------- | --------------------------------------- |
| ParseResult pattern     | ✅ Proven | All 167 tests passing                   |
| GenerateResult pattern  | ✅ Proven | All background props generate           |
| Multi-value properties  | ✅ Proven | background-image, background-size, etc. |
| Keyword handling        | ✅ Proven | blend-modes, attachment, clip, etc.     |
| Function parsing        | ✅ Proven | Gradients, colors                       |
| Type system consistency | ✅ Proven | Angle, Length, Percentage working       |

**Overall:** ✅ Architecture is solid for transition implementation

---

## 🎯 Session 019 Recommendation

**Goal:** Implement Time type + 2 transition properties

**Scope:**

1. Create Time type (similar to Angle/Length pattern)
2. Implement `transition-duration`
3. Implement `transition-delay`
4. Add to property-manifest.json
5. Comprehensive tests

**Duration Estimate:** 45-60 minutes  
**Complexity:** LOW (following proven patterns)  
**Risk:** LOW (Time is simpler than Color/Gradient)

**Success Criteria:**

- ✅ Time parsing/generation works (s, ms units)
- ✅ transition-duration property complete
- ✅ transition-delay property complete (including negative values)
- ✅ Tests passing
- ✅ `just check` passes

---

## ✅ Final Assessment

**Are we ready for transition?**  
**YES** - with minor foundation work (Time type)

**Blockers:** NONE  
**Risks:** LOW  
**Confidence:** HIGH

The background family implementation validated all core patterns. Transition properties are actually **simpler** than background-image (no gradients, no complex positioning). The only new primitive is Time, which follows the exact same pattern as Angle and Length.

**Recommendation:** Proceed with Session 019 focused on Time + duration/delay properties.

---
