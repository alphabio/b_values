# background-repeat Research

## Syntax Analysis

```
background-repeat = <repeat-style>#

<repeat-style> =
  repeat-x           |
  repeat-y           |
  <repetition>{1,2}

<repetition> =
  repeat     |
  space      |
  round      |
  no-repeat
```

## Key Points

### 1. Two Forms

**Shorthand (axis-specific):**

- `repeat-x` = `repeat no-repeat` (horizontal only)
- `repeat-y` = `no-repeat repeat` (vertical only)

**Explicit (1 or 2 values):**

- 1 value: applies to both axes (`repeat` = `repeat repeat`)
- 2 values: horizontal vertical (`repeat space` = horizontal repeat, vertical space)

### 2. Valid Keywords

**Shorthand:** `repeat-x | repeat-y`

**Repetition keywords:** `repeat | space | round | no-repeat`

### 3. Examples

```css
/* Shorthand */
background-repeat: repeat-x; /* repeat no-repeat */
background-repeat: repeat-y; /* no-repeat repeat */

/* Single value (both axes) */
background-repeat: repeat; /* repeat repeat */
background-repeat: space; /* space space */
background-repeat: round; /* round round */
background-repeat: no-repeat; /* no-repeat no-repeat */

/* Two values (horizontal vertical) */
background-repeat: repeat space;
background-repeat: repeat no-repeat;
background-repeat: space round;
background-repeat: no-repeat no-repeat;

/* Multi-layer */
background-repeat: repeat, no-repeat, repeat-x;
background-repeat:
  repeat space,
  round,
  no-repeat;
```

### 4. MDN Specs

- **Syntax:** `<repeat-style>#`
- **Initial:** `repeat`
- **Inherited:** `no`
- **Multi-value:** YES (comma-separated for layers)

## IR Design

### Type Structure

```typescript
export type BackgroundRepeatIR =
  | { kind: "keyword"; value: string } // CSS-wide keywords
  | { kind: "layers"; layers: RepeatStyle[] };

export type RepeatStyle =
  | { kind: "shorthand"; value: "repeat-x" | "repeat-y" }
  | { kind: "explicit"; horizontal: RepetitionValue; vertical: RepetitionValue };

export type RepetitionValue = "repeat" | "space" | "round" | "no-repeat";
```

### Rationale

1. **Discriminated unions** - Clear distinction between shorthand and explicit forms
2. **Separate horizontal/vertical** - Makes explicit form clear
3. **Type safety** - String literals enforce valid keywords

## Implementation Strategy

### Generator Logic

```typescript
function generateRepeatStyle(style: RepeatStyle): string {
  if (style.kind === "shorthand") {
    return style.value; // "repeat-x" or "repeat-y"
  }

  // Explicit form
  if (style.horizontal === style.vertical) {
    return style.horizontal; // "repeat" instead of "repeat repeat"
  }

  return `${style.horizontal} ${style.vertical}`;
}
```

### Parser Logic

```typescript
itemParser(valueNode) {
  const nodes = nodeListToArray(valueNode.children);
  const firstNode = nodes[0];

  // Check for shorthand
  if (isIdentifier(firstNode, "repeat-x")) {
    return parseOk({ kind: "shorthand", value: "repeat-x" });
  }
  if (isIdentifier(firstNode, "repeat-y")) {
    return parseOk({ kind: "shorthand", value: "repeat-y" });
  }

  // Parse explicit form (1 or 2 values)
  const firstValue = parseRepetitionValue(firstNode);
  if (!firstValue.ok) return firstValue;

  // Check for second value
  if (nodes.length === 1) {
    // Single value - apply to both axes
    return parseOk({
      kind: "explicit",
      horizontal: firstValue.value,
      vertical: firstValue.value,
    });
  }

  // Two values
  const secondNode = nodes[1];
  const secondValue = parseRepetitionValue(secondNode);
  if (!secondValue.ok) return secondValue;

  return parseOk({
    kind: "explicit",
    horizontal: firstValue.value,
    vertical: secondValue.value,
  });
}
```

## Test Cases

### Generator Tests

1. CSS-wide keywords (inherit, initial, unset, revert)
2. Shorthand: repeat-x, repeat-y
3. Single explicit: repeat, space, round, no-repeat
4. Two explicit: repeat space, round no-repeat, etc.
5. Multiple layers

### Parser Tests

1. CSS-wide keywords
2. Shorthand: repeat-x, repeat-y
3. Single value: repeat, space, round, no-repeat
4. Two values: all combinations
5. Multiple layers
6. Invalid values
7. Round-trip tests

## Edge Cases

1. **Single value normalization**: `repeat` stays as `repeat` (not `repeat repeat`)
2. **Shorthand preservation**: `repeat-x` stays as `repeat-x` (not expanded)
3. **Two identical values**: `repeat repeat` becomes `repeat` in generator
4. **Case sensitivity**: All keywords lowercase
