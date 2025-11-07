# Parser Architecture: Single-Value vs Multi-Value

**Date:** 2025-11-07
**Status:** Active Pattern

---

## Overview

The b_values library uses **two distinct parser architectures** to handle different property types efficiently and resiliently.

---

## The Two Parser Types

### 1. SingleValueParser (AST-Native)

**Signature:**
```typescript
export type SingleValueParser<T> = (node: csstree.Value) => ParseResult<T>;
```

**Use for:**
- Properties with single atomic values
- Examples: `color`, `opacity`, `width`, `border-radius`

**How it works:**
1. Top-level `parseDeclaration` parses CSS to AST once
2. Passes AST `Value` node directly to property parser
3. Parser traverses AST nodes (type-safe, precise errors)

**Benefits:**
- ✅ Single parse pass (fast)
- ✅ Perfect error locations from AST
- ✅ Type-safe node traversal
- ✅ No string manipulation

**Example (not yet implemented):**
```typescript
// Future: color property parser
export function parseColor(node: csstree.Value): ParseResult<ColorIR> {
  // Work directly with AST nodes
  if (node.type === 'Hash') {
    return parseHex(node);
  }
  if (node.type === 'Function') {
    const funcName = node.name.toLowerCase();
    if (funcName === 'rgb') return parseRGB(node);
    if (funcName === 'hsl') return parseHSL(node);
  }
  // ...
}
```

---

### 2. MultiValueParser (String-Split + AST)

**Signature:**
```typescript
export type MultiValueParser<T> = (value: string) => ParseResult<T>;
```

**Use for:**
- Properties with comma-separated lists
- Examples: `background-image`, `font-family`, `box-shadow`

**How it works:**
1. Receives raw CSS value string
2. Splits by top-level commas (respecting nested functions)
3. Parses **each chunk** to AST individually
4. Aggregates results (partial success resilience)

**Benefits:**
- ✅ Resilient: One bad item doesn't break others
- ✅ Multi-error reporting: All issues collected
- ✅ Each item gets precise AST parsing
- ✅ Handles complex nesting correctly

**Example (currently implemented):**
```typescript
// background-image property parser
export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  // Step 1: Split by commas (string utility)
  const layerStrings = splitByComma(value);
  
  // Step 2: Parse EACH layer to AST individually
  const layerResults: ParseResult<ImageLayer>[] = [];
  
  for (const layerStr of layerStrings) {
    try {
      // Parse this layer to AST
      const layerAst = csstree.parse(layerStr, { 
        context: 'value', 
        positions: true 
      });
      
      // Now work with AST for this layer
      const result = parseImageLayer(layerAst);
      layerResults.push(result);
      
    } catch (e) {
      // This layer failed - record error, continue with others
      layerResults.push(parseErr(createError('invalid-syntax', e.message)));
    }
  }
  
  // Step 3: Aggregate all results
  return aggregateLayerResults(layerResults);
}
```

---

## Why Two Architectures?

### The Session 044 Problem

**Original issue:** Multi-value properties failed catastrophically when one item had syntax error.

**Example:**
```css
background-image: 
  url(a.png),          /* ✅ Valid */
  invalid-syntax,      /* ❌ Parse error */
  url(b.png);          /* ✅ Valid but lost! */
```

**Old behavior:**
- Top-level `csstree.parse()` failed on entire value
- Property parser never ran
- Lost 2 valid layers because 1 was bad

**New behavior with MultiValueParser:**
- Split string first: `["url(a.png)", "invalid-syntax", "url(b.png)"]`
- Parse each individually
- Result: 2 valid layers + 1 error
- **Partial success!** ✨

---

## Decision Matrix

| Property Type | Parser Type | Example | Rationale |
|---------------|-------------|---------|-----------|
| Single atomic value | `SingleValueParser` | `color`, `width` | Fast, single parse |
| Comma-separated list | `MultiValueParser` | `background-image` | Resilient to partial failure |
| Space-separated (single semantic unit) | `SingleValueParser` | `background-position` | Treated as one value |
| Space-separated (multiple items) | `MultiValueParser` | `font-family` (fallbacks) | Each item is independent |

---

## Implementation Guidelines

### When to use SingleValueParser

```typescript
// Property definition
export const color = defineProperty<ColorIR>({
  name: 'color',
  parser: parseColor,  // SingleValueParser
  multiValue: false,   // ← Default
  // ...
});

// Parser signature
export function parseColor(node: csstree.Value): ParseResult<ColorIR> {
  // Receive pre-parsed AST node
  // Work directly with node.type, node.children, etc.
}
```

### When to use MultiValueParser

```typescript
// Property definition
export const backgroundImage = defineProperty<BackgroundImageIR>({
  name: 'background-image',
  parser: parseBackgroundImage,  // MultiValueParser
  multiValue: true,               // ← Mark as multi-value!
  // ...
});

// Parser signature
export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  // Receive raw string
  // Split by comma
  // Parse each chunk to AST individually
  // Aggregate results
}
```

---

## Common Utilities

### For MultiValueParser

**String splitting:**
```typescript
import { splitByComma } from '@b/declarations/utils';

// Respects nested parentheses
const layers = splitByComma('url(a.png), linear-gradient(red, blue)');
// ['url(a.png)', 'linear-gradient(red, blue)']
```

**Per-item AST parsing:**
```typescript
import * as csstree from '@eslint/css-tree';

for (const itemStr of items) {
  try {
    const itemAst = csstree.parse(itemStr, {
      context: 'value',
      positions: true  // ← Critical for error locations
    });
    
    // Parse this specific item's AST
    const result = parseItem(itemAst);
    
  } catch (e) {
    // Handle syntax error for this item
  }
}
```

### For SingleValueParser

**AST traversal:**
```typescript
import * as Ast from '@b/utils';

// Check node types
if (Ast.isFunctionNode(node, 'rgb')) {
  return parseRGB(node);
}

// Split by operators
const groups = Ast.splitNodesByComma(node.children.toArray());
```

---

## Performance Characteristics

| Pattern | Parse Cost | Resilience | Error Quality |
|---------|-----------|------------|---------------|
| SingleValueParser | 1 parse | Fail-fast | Perfect (AST locations) |
| MultiValueParser | N parses | Partial success | Perfect per-item |

**Trade-off:** MultiValueParser does N parses (one per item) but gains resilience.

---

## Future Work

### Not Yet Implemented

- [ ] SingleValueParser properties (color, opacity, width, etc.)
- [ ] AST-native gradient parsing (currently uses multi-value pattern)
- [ ] Performance benchmarking of both patterns

### Considered But Deferred

- **Hybrid parser:** Parse to AST first, then split at AST level
  - More complex
  - Loses resilience (one bad item breaks entire parse)
  - Current pattern is simpler and more robust

---

## Related

- **Session 044:** Multi-value parser regression fix
- **ADR-004:** Test suite optimization (future work)
- **Session 041:** Original AST-native refactoring plan (now partially outdated)

---

## Examples

### Multi-Value Success

```typescript
// Input with partial failure
const result = parseBackgroundImage(
  'url(a.png), invalid!!, linear-gradient(red, blue)'
);

// Result
{
  ok: false,
  value: {
    kind: 'layers',
    layers: [
      { kind: 'url', url: 'a.png' },           // ✅ Parsed
      { kind: 'gradient', gradient: {...} }     // ✅ Parsed
    ]
  },
  issues: [
    {
      code: 'invalid-syntax',
      message: 'Parse error at layer 2',
      // Error for middle layer
    }
  ]
}
```

**User gets:** 2 working backgrounds + 1 error message

---

**Key Insight:** Both patterns use AST parsing. The difference is **when** and **how many times** we parse.
