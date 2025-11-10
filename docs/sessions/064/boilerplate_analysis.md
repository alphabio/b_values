# 🎯 User is RIGHT - This IS Boilerplate

**User's Challenge:**

> "Isn't this boilerplate? You going to repeat this for 50+ props?"

---

## Current Pattern (Repeated Everywhere)

```typescript
// Every single property parser:
export function parsePropertyValue(valueNode: csstree.Value): ParseResult<???> {
  const node = nodes[0];

  // ❌ BOILERPLATE: Check for var/calc
  if (Ast.isFunctionNode(node)) {
    return parseNodeToCssValue(node);
  }

  // Property-specific logic...

  // ❌ BOILERPLATE: Fallback
  return parseNodeToCssValue(node);
}
```

**This IS repeated boilerplate for 50+ properties.**

---

## Where Should This Live?

Let me trace the actual call stack...

For `background-image: var(--x), url(img.png)`:

1. `parseDeclaration()` - declaration layer
2. Sees `multiValue: true`
3. Calls property parser with raw string: `"var(--x), url(img.png)"`
4. Property parser uses `createMultiValueParser()`
5. `createMultiValueParser` splits by comma internally
6. For each chunk, creates AST
7. Calls `itemParser(astNode)`
8. `itemParser` = `parseImageValue(astNode)`

**At step 5-7:** createMultiValueParser OWNS the AST creation and iteration.

---

## The Fix Location

**Option A:** Every parser adds boilerplate ❌
**Option B:** createMultiValueParser handles it ✅

Let me check createMultiValueParser...

## Found It! Line 139

```typescript
// Line 139 in createMultiValueParser:
itemResults.push(config.itemParser(itemAst));
```

**This calls the user-provided `itemParser` directly with the AST.**

---

## The Solution

**Add a wrapper BEFORE calling itemParser:**

```typescript
// Line 138-139 currently:
// 5. Delegate to the property-specific item parser with the validated AST chunk.
itemResults.push(config.itemParser(itemAst));

// SHOULD BE:
// 5. Check for universal CSS functions first
const universalResult = tryParseCssValue(itemAst);
if (universalResult) {
  itemResults.push(universalResult);
  continue;
}

// 6. Delegate to property-specific parser
itemResults.push(config.itemParser(itemAst));
```

---

## Where tryParseCssValue Lives

```typescript
function tryParseCssValue(valueNode: csstree.Value): ParseResult<CssValue> | null {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node) return null;

  // Check if it's a CSS function (var, calc, min, max, clamp, etc.)
  if (Ast.isFunctionNode(node)) {
    const funcName = node.name.toLowerCase();
    const universalFunctions = ["var", "calc", "min", "max", "clamp", "attr", "env"];

    if (universalFunctions.includes(funcName)) {
      return parseNodeToCssValue(node);
    }
  }

  return null; // Not a universal function, let itemParser handle it
}
```

---

## Impact

**Before:** Every property parser must add fallback (50+ times)

**After:** createMultiValueParser handles it ONCE

**Properties that benefit automatically:**

- background-image ✅
- background-clip ✅ (already works, but cleaner)
- background-size ✅
- background-repeat ✅
- background-attachment ✅
- background-origin ✅
- All future multi-value properties ✅

---

## But Wait... What About Single-Value Properties?

```typescript
// parseDeclaration for single-value properties:
if (!definition.multiValue) {
  valueAst = csstree.parse(value, { context: "value" });
  parseResult = unsafeCallParser(definition.parser, valueAst);
}
```

**Same issue:** Single-value properties also need the check.

**Solution:** Add wrapper in parseDeclaration BEFORE calling parser.

---

## Complete Solution

### 1. For Multi-Value Properties

Wrap in `createMultiValueParser` (line 139)

### 2. For Single-Value Properties

Wrap in `parseDeclaration` (before unsafeCallParser)

### 3. Both use same utility

`tryParseCssValue()` - shared helper

---

## Architecture Now

```
parseDeclaration:
  ✅ CSS-wide keywords
  ✅ Property routing

  For single-value:
    ✅ tryParseCssValue() wrapper  ← NEW
    → property parser

  For multi-value:
    → createMultiValueParser
      ✅ tryParseCssValue() wrapper  ← NEW
      → itemParser

Property parsers:
  ✅ Property-specific syntax ONLY
  ❌ NO var/calc boilerplate needed
```

**User is right:** Boilerplate should be eliminated via abstraction.
