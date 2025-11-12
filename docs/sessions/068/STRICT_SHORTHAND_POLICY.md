# Strict Shorthand Policy: CLARIFIED

**Date:** 2025-11-12
**Issue:** Is `background-position` a shorthand? Should we implement it?

---

## 🚨 THE ANSWER

**Is `background-position` a shorthand?**

**NO. It is a LONGHAND property.**

---

## 📋 Our Shorthand Definition (Strict)

### **Shorthand Property:**

A property that **EXPANDS into OTHER property names** when set.

**Characteristics:**

1. Sets MULTIPLE properties with different names
2. Requires expansion/cascade logic
3. Each expanded property can be set independently

**Examples:**

```css
/* SHORTHAND: background */
background: red;
/* ↓ EXPANDS TO ↓ */
background-color: red;
background-image: none;
background-repeat: repeat;
background-position: 0% 0%;
/* ... + 4 more properties */

/* SHORTHAND: padding */
padding: 10px 20px;
/* ↓ EXPANDS TO ↓ */
padding-top: 10px;
padding-right: 20px;
padding-bottom: 10px;
padding-left: 20px;
```

**Our policy:** ❌ **DO NOT IMPLEMENT**

---

## 📋 Longhand Properties (What We Implement)

### **Longhand Property:**

A property that **DOES NOT expand** into other properties.

**May have:**

- ✅ Simple value (e.g., `color: red`)
- ✅ Structured value (e.g., `background-position: center top`)
- ✅ List of values (e.g., `background-image: url(a), url(b)`)

**Does NOT:**

- ❌ Set other property names
- ❌ Require expansion logic
- ❌ Cascade to other properties

**Examples:**

```css
/* LONGHAND: background-position */
background-position: center top;
/* ↓ STAYS AS ↓ */
ONE property with structured IR: { horizontal: center, vertical: top }

/* LONGHAND: padding-top */
padding-top: 10px;
/* ↓ STAYS AS ↓ */
ONE property with simple value: 10px
```

**Our policy:** ✅ **IMPLEMENT**

---

## 🎯 background-position Classification

### **Question:** Is `background-position` a shorthand?

### **Analysis:**

**Does it expand into other properties?**

```css
background-position: center top;
/* Does this set background-position-x? NO */
/* Does this set background-position-y? NO */
/* Does this set any other property? NO */
```

**Answer:** ❌ **NO, it does not expand.**

**Therefore:** `background-position` is a **LONGHAND** property.

### **But wait, what about background-position-x/y?**

**These are OPTIONAL SIBLINGS, not expansion targets.**

```css
/* Setting background-position... */
background-position: center top;

/* Does NOT automatically set: */
background-position-x: center;  ❌ These are independent properties
background-position-y: top;     ❌ User must set them explicitly
```

**Key distinction:**

- **Shorthand expansion:** Automatic, built into CSS spec
- **Optional siblings:** Alternative ways to express same concept

**Example of TRUE expansion (padding):**

```css
padding: 10px;

/* AUTOMATICALLY sets (per spec): */
padding-top: 10px;    ✅ Automatic
padding-right: 10px;  ✅ Automatic
padding-bottom: 10px; ✅ Automatic
padding-left: 10px;   ✅ Automatic
```

---

## ✅ Strict Policy Applied

### **Properties We Implement**

| Property              | Expands? | Classification        | Implement? |
| --------------------- | -------- | --------------------- | ---------- |
| `background-color`    | NO       | Longhand (simple)     | ✅ YES     |
| `background-position` | NO       | Longhand (structured) | ✅ YES     |
| `padding-top`         | NO       | Longhand (simple)     | ✅ YES     |
| `padding-right`       | NO       | Longhand (simple)     | ✅ YES     |

### **Properties We Skip**

| Property                | Expands?            | Classification    | Implement? |
| ----------------------- | ------------------- | ----------------- | ---------- |
| `background`            | YES → 8 properties  | Shorthand         | ❌ NO      |
| `padding`               | YES → 4 properties  | Shorthand         | ❌ NO      |
| `border`                | YES → 12 properties | Shorthand         | ❌ NO      |
| `background-position-x` | NO                  | Redundant sibling | ❌ NO      |
| `background-position-y` | NO                  | Redundant sibling | ❌ NO      |

---

## 🔍 Handling `background-position-x` in Parser

### **The Question:**

```typescript
parse("background-position-x: center");
```

**What should happen?**

### **Answer: Recognize but Don't Implement**

**Three options:**

#### **Option 1: Error (Strict - Recommended)**

```typescript
parse("background-position-x: center")
// ↓
{
  ok: false,
  property: "background-position-x",
  issues: [{
    code: "unsupported-property",
    severity: "error",
    message: "Property 'background-position-x' is not supported. Use 'background-position' instead."
  }]
}
```

**Pros:**

- ✅ Clear feedback to user
- ✅ Guides to correct property
- ✅ Prevents confusion

**Cons:**

- ⚠️ Might be too strict for some users

#### **Option 2: Warning (Permissive)**

```typescript
parse("background-position-x: center")
// ↓
{
  ok: true,
  property: "background-position-x",
  ir: { kind: "unsupported", value: "center" },
  issues: [{
    code: "unsupported-property",
    severity: "warning",
    message: "Property 'background-position-x' is not supported. Consider using 'background-position'."
  }]
}
```

**Pros:**

- ✅ Doesn't block parsing
- ✅ Still warns user
- ✅ Can be used in linters

**Cons:**

- ⚠️ Unclear what to do with IR
- ⚠️ Might encourage use of unsupported properties

#### **Option 3: Unknown Property (Current)**

```typescript
parse("background-position-x: center")
// ↓
{
  ok: false,
  property: "background-position-x",
  issues: [{
    code: "invalid-value",
    severity: "error",
    message: "Unknown CSS property: background-position-x"
  }]
}
```

**Pros:**

- ✅ Simple, consistent with other unknown properties
- ✅ Clear rejection

**Cons:**

- ⚠️ Doesn't explain why it's not supported
- ⚠️ Treats as "doesn't exist" rather than "exists but not supported"

---

## 💡 Recommended Approach

### **Create Property Category: "Unsupported"**

Maintain a registry of **known but unsupported** properties:

```typescript
// packages/b_declarations/src/core/unsupported.ts

export const UNSUPPORTED_PROPERTIES = {
  // Shorthand properties
  background: {
    reason: "shorthand",
    suggestion: "Use individual properties: background-color, background-image, etc.",
    expands: [
      "background-color",
      "background-image",
      "background-repeat",
      "background-position",
      "background-size",
      "background-attachment",
      "background-clip",
      "background-origin",
    ],
  },
  padding: {
    reason: "shorthand",
    suggestion: "Use individual properties: padding-top, padding-right, etc.",
    expands: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  },

  // Redundant siblings
  "background-position-x": {
    reason: "redundant-sibling",
    suggestion: "Use 'background-position' instead",
    alternativeTo: "background-position",
  },
  "background-position-y": {
    reason: "redundant-sibling",
    suggestion: "Use 'background-position' instead",
    alternativeTo: "background-position",
  },
} as const;

export function isUnsupportedProperty(property: string): boolean {
  return property in UNSUPPORTED_PROPERTIES;
}

export function getUnsupportedPropertyInfo(property: string) {
  return UNSUPPORTED_PROPERTIES[property as keyof typeof UNSUPPORTED_PROPERTIES];
}
```

### **Enhanced Parser Logic**

```typescript
// packages/b_declarations/src/parser.ts

export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  // ... existing parsing logic ...

  // Check for unsupported properties BEFORE unknown check
  if (isUnsupportedProperty(property)) {
    const info = getUnsupportedPropertyInfo(property);
    return parseErr(
      "declaration",
      createError(
        "unsupported-property",
        `Property '${property}' is not supported (${info.reason}). ${info.suggestion}`
      )
    );
  }

  // Look up property definition
  const definition = getPropertyDefinition(property);

  if (!definition) {
    return parseErr("declaration", createError("invalid-value", `Unknown CSS property: ${property}`));
  }

  // ... rest of parsing ...
}
```

### **Error Messages**

```typescript
parse("background-position-x: center")
// ↓
{
  ok: false,
  property: "background-position-x",
  issues: [{
    code: "unsupported-property",
    severity: "error",
    message: "Property 'background-position-x' is not supported (redundant-sibling). Use 'background-position' instead."
  }]
}

parse("background: red")
// ↓
{
  ok: false,
  property: "background",
  issues: [{
    code: "unsupported-property",
    severity: "error",
    message: "Property 'background' is not supported (shorthand). Use individual properties: background-color, background-image, etc."
  }]
}

parse("made-up-property: value")
// ↓
{
  ok: false,
  property: "made-up-property",
  issues: [{
    code: "invalid-value",
    severity: "error",
    message: "Unknown CSS property: made-up-property"
  }]
}
```

---

## 🎯 Implementation Plan

### **Step 1: Create Unsupported Registry**

Create `packages/b_declarations/src/core/unsupported.ts`:

- List of known-but-unsupported properties
- Categorized by reason (shorthand, redundant-sibling)
- Include helpful suggestions

### **Step 2: Update Parser**

Update `packages/b_declarations/src/parser.ts`:

- Check unsupported registry before unknown check
- Provide context-specific error messages
- Distinguish "not supported" from "doesn't exist"

### **Step 3: Add Issue Code**

Update `@b/types/src/result/issue.ts`:

- Add `"unsupported-property"` issue code
- Document when it's used

### **Step 4: Document Policy**

Update architecture docs:

- Clarify shorthand vs longhand definitions
- List unsupported properties and reasons
- Provide migration guides

---

## 📋 Complete Property Categories

### **Category 1: Implemented Longhands** ✅

Properties we implement:

- Independent longhands (padding-top, margin-left)
- Composite longhands (background-position, background-size)

### **Category 2: Unsupported Shorthands** ❌

Properties we recognize but don't implement:

- background, padding, margin, border
- Reason: Expand into multiple properties

### **Category 3: Unsupported Siblings** ❌

Properties we recognize but don't implement:

- background-position-x, background-position-y
- Reason: Redundant with composite property

### **Category 4: Unknown Properties** ❓

Properties we don't recognize:

- User typos, experimental properties, vendor-specific
- Reason: Not in our registry at all

---

## ✅ Final Answer

### **Is background-position a shorthand?**

**NO.** Under our **strict definition**, `background-position` is **NOT a shorthand**.

**Strict definition:** Shorthand = property that **expands into other property names**

**background-position does NOT expand.** It's a longhand with structured value.

### **Do we implement background-position?**

**YES.** ✅

**Do we implement background-position-x/y?**

**NO.** ❌ They are redundant siblings, not expansion targets.

### **What happens when user tries to parse background-position-x?**

**We reject it with a helpful error:**

```
Error: Property 'background-position-x' is not supported (redundant-sibling).
Use 'background-position' instead.
```

---

## 🏆 Policy Summary

**STRICT POLICY:**

1. ✅ **Implement longhands** (expand: NO)
   - background-position, padding-top, margin-left

2. ❌ **Reject shorthands** (expand: YES)
   - background, padding, margin, border

3. ❌ **Reject redundant siblings** (expand: NO, but redundant)
   - background-position-x/y

4. ❓ **Error on unknown** (not in any category)
   - made-up-property

**Clear, strict, consistent. 🎯**
