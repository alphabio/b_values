# Architecture Comparison: Injection vs Wrapper Pattern

**Context:** Designing for 50+ properties, greenfield thinking

---

## 🏗️ Architectural Principles

### Injection Pattern (Current)

**Philosophy:** "Universal concerns belong at the framework layer"

```
┌─────────────────────────────────────┐
│   Framework Layer (declarations)    │
│   - Knows about CSS-wide keywords   │
│   - Knows about var/calc/etc       │◄── Universal logic HERE
│   - createMultiValueParser          │
│   - parseDeclaration                │
└──────────────┬──────────────────────┘
               │ delegates to
               ▼
┌─────────────────────────────────────┐
│   Property Layer (properties/*)     │
│   - background-clip parser          │
│   - background-image parser         │◄── Pure domain logic
│   - Knows ONLY property spec        │
└─────────────────────────────────────┘
```

**Pros:**

- ✅ Property code stays pure (no framework knowledge)
- ✅ Zero per-property boilerplate
- ✅ Universal features work automatically for new properties

**Cons:**

- ❌ Framework layer has more responsibility
- ❌ Magic behavior (properties don't "know" they support var)
- ❌ Harder to trace: "where does var() get handled?"

---

### Wrapper Pattern (Proposed)

**Philosophy:** "Universal concerns are property features, wrapped explicitly"

```
┌─────────────────────────────────────┐
│   Framework Layer (declarations)    │
│   - Minimal orchestration           │
│   - Just calls property parsers     │◄── Thin layer
└──────────────┬──────────────────────┘
               │ delegates to
               ▼
┌─────────────────────────────────────┐
│   Property Layer (properties/*)     │
│                                     │
│   // Concrete (pure)                │
│   parseClipConcrete()              │◄── Domain logic
│                                     │
│   // Public API (wrapped)           │
│   parseClipValue = parseValue(     │◄── Explicit wrapper
│     parseClipConcrete              │
│   )                                 │
└─────────────────────────────────────┘
```

**Pros:**

- ✅ Explicit: Each property declares var() support
- ✅ Traceable: grep "parseValue" shows all wrapped properties
- ✅ Property-level control: Can opt-out if needed
- ✅ Framework stays thin

**Cons:**

- ❌ Boilerplate: Every property exports wrapper
- ❌ Forgettable: New properties might not wrap
- ❌ Repetitive: Same pattern 50+ times

---

## 🎯 The Core Question

**Is var/calc/etc support a:**

### A) Framework Feature?

"All properties automatically support universal CSS functions because the framework handles them"

→ **Injection pattern**
→ Property parsers never see var()
→ Framework intercepts and handles

### B) Property Feature?

"Properties explicitly opt into universal CSS function support via wrappers"

→ **Wrapper pattern**
→ Property files declare support
→ Concrete parsers stay pure, wrappers handle universal

---

## 🔍 Comparing to CSS-wide Keywords (Session 057)

**How do we handle `inherit`, `initial`, `unset`?**

Looking at code...

```typescript
// packages/b_declarations/src/parser.ts
// CSS-wide keywords handled at DECLARATION LAYER
if (isCssWideKeyword(value)) {
  return parseOk("declaration", {
    property,
    ir: { kind: "keyword", value: cssWide },
    important: false,
  });
}
```

**Decision:** Framework handles it (injection pattern)
**Why:** Every property must support CSS-wide keywords (spec requirement)

**Question:** Are var/calc/etc the same?

---

## 📊 Spec Analysis

### CSS-wide Keywords

- **Spec:** All properties MUST accept `inherit`, `initial`, `unset`, `revert`
- **Universal:** Yes (no exceptions)
- **Framework or Property?** Framework (no choice)

### Universal Functions

- **Spec:** All properties SHOULD accept `var()`, `calc()`, etc. where type allows
- **Universal:** Yes, but context-dependent
- **Framework or Property?** 🤔 Unclear

Example where it matters:

```css
/* Makes sense */
background-size: var(--size);
background-size: calc(100% - 20px);

/* Might not make sense? */
background-attachment: calc(...); /* No numeric context */
```

But CSS allows it anyway (runtime resolution).

---

## 🎨 Design Philosophy Comparison

### Injection (Rails-style "Convention over Configuration")

```typescript
// Property author experience:
export function parseBackgroundClip(node) {
  // Just parse the keyword - var() magically works
  return parseKeyword(node, Keywords.backgroundClip);
}
```

**Mental model:** "Framework handles universal stuff, I handle my domain"

### Wrapper (Explicit is Better)

```typescript
// Property author experience:
export const parseBackgroundClipConcrete = (node) => {
  // Pure domain logic
  return parseKeyword(node, Keywords.backgroundClip);
};

// Explicit universal support
export const parseBackgroundClip = parseValue(parseBackgroundClipConcrete);
```

**Mental model:** "I declare what my property supports"

---

## 💡 Hybrid Approach?

Could we get best of both?

```typescript
// Auto-inject at framework layer (zero boilerplate)
// BUT provide opt-out for edge cases

export const backgroundClipDefinition = {
  parser: parseBackgroundClip,
  generator: generateBackgroundClip,
  universalFunctions: true, // ← Explicit flag (default true)
};
```

Property files: ONE flag per property (not three wrappers)
Framework: Still handles injection
Explicit: Properties declare support

---

## 🎯 Recommendation

**If purity and explicitness matter most:** Wrapper pattern

- More code, but clearer intent
- Property files own their full API surface
- Framework stays thin

**If DRY and pragmatism matter most:** Injection pattern

- Less code, same behavior
- Framework owns universal concerns
- Properties stay focused on domain

**Question for you:**

1. Should properties "know" they support var()?
2. Is var() a framework concern or property concern?
3. Do we need per-property control (opt-out)?

Your answer determines the right architecture.
