# Test Coverage Research - Session 048

## Research Findings

### 1. Color Function Kinds (from b_types)

Actual `kind` values used in the codebase:

```typescript
"color"   // color() function
"hex"     // #rrggbb
"hsl"     // hsl() / hsla()
"hwb"     // hwb()
"lab"     // lab()
"lch"     // lch()
"named"   // named colors
"oklab"   // oklab()
"oklch"   // oklch()
"rgb"     // rgb() / rgba()
"special" // currentColor, transparent
```

**NOT** `"rgb-color"`, `"hsl-color"`, etc. Those were wrong assumptions.

### 2. Function Dispatcher Behavior

**Functions IN the dispatcher (return ParseResult):**
- Math: `calc()`, `min()`, `max()`, `clamp()`
- Colors: `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`

**Functions NOT in dispatcher (return null):**
- `var()` - handled by parseCssValueNode
- `url()` - handled by parseUrlFromNode
- `linear-gradient()`, `radial-gradient()`, etc - handled by gradient parsers
- Unknown/custom functions - fallback to generic function

### 3. Test Patterns from Existing Tests

From `rgb.test.ts`:
```typescript
// Helper function pattern
function parseRgb(input: string) {
  const func = extractFunctionFromValue(input);
  return parseRgbFunction(func);
}

// Assertion pattern
expect(result.ok).toBe(true);
expect(result.value?.kind).toBe("rgb");  // Note: actual kind string
expect(result.value?.r).toEqual({ kind: "literal", value: 255 });
```

### 4. Common Mistakes to Avoid

❌ Wrong: `expect(result.value.kind).toBe("rgb-color")`
✅ Right: `expect(result.value.kind).toBe("rgb")`

❌ Wrong: Expecting url() to be in dispatcher
✅ Right: url() returns null from dispatcher (handled elsewhere)

❌ Wrong: Writing tests before understanding actual behavior  
✅ Right: Research actual types and behavior FIRST

### 5. Files Still Need Tests

**Priority 1 - Critical Infrastructure:**
1. ✅ function-dispatcher.ts - NEEDS FIXING (wrong kind expectations)
2. ✅ css-value-parser.ts - NEEDS FIXING (wrong kind expectations)  
3. ✅ color-function.ts - NEEDS FIXING (wrong kind expectations)

**Priority 2 - Gradient:**
4. ❌ gradient/gradient.ts
5. ❌ utils/color-interpolation.ts

**Priority 3 - Utilities:**
6. ❌ utils/css-value-functions.ts
7. ❌ keywords/color-space.ts
8. ❌ keywords/utils/zod.ts

**Priority 4 - Integration:**
9. ❌ declarations/properties/background-image/*

## Action Plan

1. Fix the 3 test files already created (correct kind values)
2. Run tests to verify they pass
3. Then write remaining tests with proper research FIRST
4. Commit all tests together

## Lessons Learned

- **DO research actual behavior before writing tests**
- **DON'T assume type names match kind strings**
- **DO check existing test patterns for the codebase**
- **DON'T play whack-a-mole with test failures**

