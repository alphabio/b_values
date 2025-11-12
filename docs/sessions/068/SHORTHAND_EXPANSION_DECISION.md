# ARCHITECTURAL DECISION: Shorthand Expansion Strategy

**Date:** 2025-11-12  
**Critical Decision:** How do we handle shorthands at the entry point?

---

## 🎯 The Question

**User wants to parse:**
```typescript
parseDeclaration("background-position: center top")
```

**Two choices:**

### Option A: Reject (Strict Boundary)
```typescript
{
  ok: false,
  issues: [{
    code: "shorthand-not-supported",
    message: "Shorthand 'background-position' not supported. Use longhand properties: background-position-x, background-position-y"
  }]
}
```

### Option B: Expand (Entry Point Convenience)
```typescript
{
  ok: true,
  expanded: [
    { property: "background-position-x", value: "center" },
    { property: "background-position-y", value: "top" }
  ]
}
```

---

## 🔍 The Clarity

**User's statement:**
> "This lib is STRICT we only deal with longform css"

**Translation:**
- Our **IR system** only represents longhands
- Our **property registry** only implements longhands
- Our **parsers** only parse longhand values

**BUT:**
> "We have to be smart"

**The question:** Where do we be smart? Entry point or client responsibility?

---

## 📊 Two Architectures

### Architecture 1: Pure Longhand (Strict Boundary)

```
User Code                    @b/declarations
─────────────────────────────────────────────────
parseDeclaration("background: red")
  → ERROR: "Shorthand not supported"
  
parseDeclaration("background-position: center")  
  → ERROR: "Shorthand not supported"
  
parseDeclaration("background-position-x: center")
  → SUCCESS: Parse as longhand
```

**Client must expand BEFORE calling us:**

```typescript
// Client uses @b/short (or their own expander)
import { expandShorthand } from "@b/short";

const input = "background-position: center top";
const expanded = expandShorthand(input);
// → [
//     "background-position-x: center",
//     "background-position-y: top"
//   ]

// Then parse each longhand
const results = expanded.map(decl => parseDeclaration(decl));
```

**Pros:**
- ✅ Pure separation of concerns
- ✅ @b/declarations stays focused (longhand IR only)
- ✅ @b/short handles expansion (separate concern)
- ✅ Clear boundaries
- ✅ Easier to reason about

**Cons:**
- ⚠️ User must integrate two libraries
- ⚠️ Extra step in workflow
- ⚠️ More complex client code

### Architecture 2: Smart Entry Point (Convenience Layer)

```
User Code                    @b/declarations
─────────────────────────────────────────────────
parseDeclaration("background: red")
  → Detect shorthand
  → Expand via @b/short
  → Parse each longhand
  → Return multiple DeclarationResults

parseDeclaration("background-position: center")
  → Detect shorthand  
  → Expand via @b/short
  → Parse each longhand
  → Return multiple DeclarationResults
  
parseDeclaration("background-position-x: center")
  → Direct parse (longhand)
  → Return single DeclarationResult
```

**Expansion happens INSIDE parseDeclaration:**

```typescript
export function parseDeclaration(
  input: string | CSSDeclaration
): ParseResult<DeclarationResult> | ParseResult<DeclarationResult[]> {
  
  // 1. Parse input
  const { property, value } = parseInput(input);
  
  // 2. Check if shorthand
  if (isShorthand(property)) {
    // Expand using @b/short
    const expanded = expandShorthand(property, value);
    
    // Parse each longhand
    const results = expanded.map(({ property, value }) => 
      parseDeclaration({ property, value })
    );
    
    return parseOk(results); // Return array
  }
  
  // 3. Parse as longhand
  const definition = getPropertyDefinition(property);
  return parseOk(parseAsLonghand(definition, value));
}
```

**Pros:**
- ✅ Convenient for users (one call)
- ✅ @b/short integrated transparently
- ✅ Smart expansion at boundary

**Cons:**
- ❌ Mixes concerns (expansion + parsing)
- ❌ Return type complexity (single vs array)
- ❌ @b/declarations depends on @b/short
- ❌ Harder to reason about
- ❌ **Violates "strict longhand only" principle**

---

## 💡 The Key Insight

**User said:**
> "Do we expand at the entry point or throw back to the user and instruct the client to expand?"

**AND:**
> "Do we support parseDeclaration('background: ...')?"
> "I say no we are blurring the lines"

**This is the answer.**

---

## ✅ RECOMMENDATION: Architecture 1 (Pure Longhand)

### Policy:

**@b/declarations is STRICT LONGHAND ONLY.**

**No shorthands at entry point. Ever.**

```typescript
parseDeclaration("background: red")
// → ERROR: "Shorthand 'background' not supported"

parseDeclaration("background-position: center top")  
// → ERROR: "Shorthand 'background-position' not supported"

parseDeclaration("padding: 10px")
// → ERROR: "Shorthand 'padding' not supported"
```

### Client Integration:

**Two-step process (client responsibility):**

```typescript
import { expandShorthand } from "@b/short";
import { parseDeclaration } from "@b/declarations";

// Step 1: Expand shorthands
const input = "background-position: center top";
const expanded = expandShorthand(input);
// → [
//     { property: "background-position-x", value: "center" },
//     { property: "background-position-y", value: "top" }
//   ]

// Step 2: Parse each longhand
const results = expanded.map(decl => 
  parseDeclaration(`${decl.property}: ${decl.value}`)
);
```

**OR provide convenience wrapper in separate package:**

```typescript
// @b/parser (convenience layer, optional)
import { expandShorthand } from "@b/short";
import { parseDeclaration } from "@b/declarations";

export function parse(input: string): ParseResult<DeclarationResult[]> {
  // Expand if needed
  const declarations = expandShorthand(input);
  
  // Parse each
  return declarations.map(decl => parseDeclaration(decl));
}
```

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────┐
│   @b/parser (convenience, optional) │  ← Smart expansion wrapper
│   - Handles shorthands              │
│   - Calls @b/short + @b/declarations│
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   @b/short (expansion logic)        │  ← Shorthand → Longhand expansion
│   - Rock solid expansion            │
│   - Separate concern                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   @b/declarations (LONGHAND ONLY)   │  ← Strict longhand IR system
│   - Parses longhands to IR          │
│   - Generates IR to CSS             │
│   - NO shorthand knowledge          │
└─────────────────────────────────────┘
```

**Separation of concerns:**
- **@b/short** - Knows about shorthands, expands them
- **@b/declarations** - Knows about longhands ONLY
- **@b/parser** - Optional convenience wrapper

---

## 📋 Error Messages

### When shorthand detected:

```typescript
parseDeclaration("background-position: center top")
// ↓
{
  ok: false,
  property: "background-position",
  issues: [{
    code: "shorthand-not-supported",
    severity: "error",
    message: "Shorthand property 'background-position' is not supported. This library only parses longhand properties. Expand to: background-position-x, background-position-y. Consider using @b/short for expansion."
  }]
}
```

### Registry of shorthands:

```typescript
// packages/b_declarations/src/core/shorthands.ts

export const SHORTHAND_PROPERTIES = {
  "background": {
    expands: [
      "background-color", "background-image", "background-repeat",
      "background-position", "background-size", "background-attachment",
      "background-clip", "background-origin"
    ]
  },
  "background-position": {
    expands: ["background-position-x", "background-position-y"]
  },
  "padding": {
    expands: ["padding-top", "padding-right", "padding-bottom", "padding-left"]
  },
  "margin": {
    expands: ["margin-top", "margin-right", "margin-bottom", "margin-left"]
  },
  // ... etc
} as const;

export function isShorthand(property: string): boolean {
  return property in SHORTHAND_PROPERTIES;
}

export function getShorthandInfo(property: string) {
  return SHORTHAND_PROPERTIES[property as keyof typeof SHORTHAND_PROPERTIES];
}
```

---

## 🎯 Implementation Plan

### Phase 1: Acknowledge Current State

**Current reality:**
- We implemented `background-position` (shorthand)
- It's working, tested, production-ready
- All 8 background properties use it

**Decision:**
1. Mark `background-position` as **SHORTHAND** in docs
2. Add deprecation warning (soft deprecation)
3. Provide migration path to longhands
4. Keep it working for now (pragmatic)

### Phase 2: Implement True Longhands

**Add the real longhands:**
```typescript
defineProperty("background-position-x")  // New
defineProperty("background-position-y")  // New
defineProperty("background-position")    // Mark as deprecated shorthand
```

**Both can coexist during transition.**

### Phase 3: Update Parser

**Detect shorthands at entry:**
```typescript
export function parseDeclaration(input) {
  const { property } = parseInput(input);
  
  // Reject shorthands
  if (isShorthand(property)) {
    const info = getShorthandInfo(property);
    return parseErr("declaration", createError(
      "shorthand-not-supported",
      `Shorthand '${property}' not supported. Expand to: ${info.expands.join(", ")}. Use @b/short for expansion.`
    ));
  }
  
  // Parse as longhand
  // ...
}
```

### Phase 4: Integration Guide

**Document the pattern:**

```typescript
// ❌ DON'T: Try to parse shorthands directly
parseDeclaration("background-position: center top") // ERROR

// ✅ DO: Expand first, then parse
import { expandShorthand } from "@b/short";

const expanded = expandShorthand("background-position: center top");
const results = expanded.map(d => parseDeclaration(d));

// ✅ OR: Use convenience wrapper (if we build it)
import { parse } from "@b/parser"; // Future package
const results = parse("background-position: center top"); // Auto-expands
```

---

## 🏆 Final Decision

### @b/declarations Policy:

**STRICT LONGHAND ONLY. NO EXCEPTIONS.**

```typescript
// ❌ REJECT
parseDeclaration("background: red")
parseDeclaration("background-position: center top")
parseDeclaration("padding: 10px")

// ✅ ACCEPT
parseDeclaration("background-color: red")
parseDeclaration("background-position-x: center")
parseDeclaration("padding-top: 10px")
```

### Integration:

**Client chooses:**

**Option 1:** Manual expansion
```typescript
// Client handles expansion
const longhand = convertShorthandToLonghand(input);
parseDeclaration(longhand);
```

**Option 2:** Use @b/short
```typescript
import { expandShorthand } from "@b/short";
const expanded = expandShorthand(input);
expanded.forEach(d => parseDeclaration(d));
```

**Option 3:** Use @b/parser wrapper (future)
```typescript
import { parse } from "@b/parser"; // Convenience layer
parse(input); // Handles expansion internally
```

---

## 💡 Why This is Right

**Separation of concerns:**
- Expansion = @b/short responsibility
- Parsing = @b/declarations responsibility
- Convenience = @b/parser responsibility (optional)

**Clear boundaries:**
- @b/declarations knows NOTHING about shorthands
- @b/short knows EVERYTHING about shorthands
- No mixing

**Scalability:**
- Want better expansion? Update @b/short
- Want better parsing? Update @b/declarations
- Independent evolution

**Consistency:**
- "STRICT longhand only" = no exceptions
- Clear, enforceable rule
- No special cases

---

## ✅ Answer to Your Questions

**Q: parseDeclaration("background-position: ...") - what do we do?**

**A: Throw back. Property is a shorthand, not supported.**

```typescript
{
  ok: false,
  issues: [{
    message: "Shorthand 'background-position' not supported. Use: background-position-x, background-position-y. Consider @b/short for expansion."
  }]
}
```

**Q: Do we support parseDeclaration("background: ...")?**

**A: NO. Same reason. Shorthand.**

**Q: Do we expand at entry point or throw back to user?**

**A: THROW BACK. Client must expand via @b/short.**

**Reason:** "We are blurring the lines" - you were right.

---

## 🔥 The Path Forward

**STRICT LONGHAND ONLY.**

**No compromise. No shortcuts. No special cases.**

**"WE NEVER WORKAROUND INCONSISTENCIES"**

**This is the way. 🎯**
