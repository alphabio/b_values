# Gradient Parser Analysis

## Common Patterns

### 1. Function Entry Point Pattern

All three have similar structure:

- Check function name (repeating vs non-repeating)
- Extract children array
- Parse optional params (direction/from/shape-size)
- Parse optional "in" color interpolation
- Parse color stops
- Build result object

### 2. Color Interpolation Parsing (DUPLICATE x3)

```typescript
// All three have nearly identical code:
const inNode = children[idx];
if (inNode?.type === "Identifier" && inNode.name.toLowerCase() === "in") {
  idx++;
  const methodResult = Utils.ColorInterpolation.parse(children, idx);
  if (!methodResult.ok) {
    return forwardParseErr<Type.XXXGradient>(methodResult);
  }
  colorInterpolationMethod = methodResult.value.method;
  idx = methodResult.value.nextIdx;
}
```

### 3. Color Stops Parsing (DUPLICATE x3)

```typescript
// All three:
const colorStopResults = ColorStop.parseMultiple(children, idx);
if (!colorStopResults.ok) {
  return forwardParseErr<Type.XXXGradient>(colorStopResults);
}

if (colorStopResults.value.length < 2) {
  return parseErr(createError("missing-value", "XXX-gradient requires at least 2 color stops"));
}
```

### 4. Parse Entry Point (DUPLICATE x3)

```typescript
export function parse(css: string): ParseResult<Type.XXXGradient> {
  const astResult = Utils.Ast.parseCssString(css, "value");
  if (!astResult.ok) {
    return forwardParseErr<Type.XXXGradient>(astResult);
  }

  const funcResult = Utils.Ast.findFunctionNode(astResult.value, ["xxx-gradient", "repeating-xxx-gradient"]);
  if (!funcResult.ok) {
    return forwardParseErr<Type.XXXGradient>(funcResult);
  }

  return fromFunction(funcResult.value);
}
```

## Extractable Utils

### 1. parseColorInterpolationMethod(children, idx)

Extract common "in" keyword + method parsing

### 2. parseAndValidateColorStops(children, idx, gradientType)

Extract common color stop parsing + validation

### 3. parseCssToGradientFunction(css, gradientNames)

Extract common parse entry point

### 4. validateParentheses(css)

Only in conic - should be in all three

## Differences (Keep Separate)

1. **Linear**: Direction parsing (to-side, to-corner, angle)
2. **Radial**: Shape/size parsing (circle, ellipse, keywords, explicit)
3. **Conic**: from angle + at position
