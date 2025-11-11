# Generator Contract

## Responsibilities

### Property-Level Generators

**MUST:**
- Return only the CSS value string (e.g., `"10px"`, `"red"`, `"url(...)"`)
- Return `GenerateResult<string>` with `ok` and `value`
- Include `issues` array (empty if successful)

**MUST NOT:**
- Prepend property name (e.g., NOT `"color: red"`)
- Add `!important` flag
- Set `property` field in issues (declaration layer handles this)

**MAY:**
- Include contextual information in issue messages
- Return partial values on error with issues

### Declaration-Level Generator (`generateDeclaration`)

**Responsibilities:**
- Call property-level generator
- Wrap result as `"property: value"`
- Append `!important` if requested
- Stamp `property` field onto all issues
- Handle CSS-wide keywords

## Example

```typescript
// ✅ CORRECT - Property-level generator
export function generateBackgroundColor(ir: BackgroundColorIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value); // Just "red"
  }
  // ... more cases
}

// ❌ WRONG - Don't do this in property generator
export function generateBackgroundColor(ir: BackgroundColorIR): GenerateResult {
  return generateOk("background-color: red"); // NO!
}

// ✅ Declaration layer handles wrapping
const result = generateDeclaration({ property: "background-color", ir });
// result.value === "background-color: red"
```

## Current Status

All generators follow this contract except:
- `background-image/generator.ts` - Sets `property` field in issues (legacy, safe to keep)

## Enforcement

Contract enforced by:
1. `runPropertyTests()` - Validates parse/generate roundtrip
2. Type signatures - `GenerateResult` doesn't expose `property` at this layer
3. Documentation - This file

## Migration Guide

If you find a generator that doesn't follow this:

1. Remove `property:` prefix from return value
2. Remove `property` field from issues
3. Let `generateDeclaration` handle both
