# Custom Property Architecture Decision

## Problem

Custom properties (--\*) are exceptional:

- Need raw string input (not AST)
- Don't split on commas (not multi-value)
- Store values unparsed per CSS spec

Current solution uses `multiValue: true` but this overloads semantics.

## User Feedback

1. Don't add a flag just for custom properties
2. They're exceptional - maybe don't follow same interface
3. Still need registry registration for lookup
4. Also: Consider auto-generating PropertyIRMap from property definitions

## Options

### Option A: Keep multiValue: true (Current)

- ✅ Works today
- ✅ No code changes needed
- ❌ Misleading semantics
- ❌ Future devs will be confused

### Option B: Special case in parser

```typescript
// In parser.ts
if (isCustomProperty(property)) {
  // Pass raw string directly
  parseResult = unsafeCallParser(definition.parser, value);
} else if (definition.multiValue) {
  // Multi-value: split on commas
  parseResult = unsafeCallParser(definition.parser, value);
} else {
  // Single value: parse to AST
  valueAst = csstree.parse(value, { context: "value" });
  parseResult = unsafeCallParser(definition.parser, valueAst);
}
```

- ✅ Clear semantics: custom properties are exceptional
- ✅ multiValue only for comma-separated lists
- ✅ Single special case in one place
- ❌ Adds conditional logic

### Option C: Don't register custom properties at all

Use `getPropertyDefinition()` to create definition on-the-fly.

- ❌ More complex
- ❌ Doesn't reuse existing infrastructure

## Recommendation

**Option B**: Special case in parser

Rationale:

- Custom properties ARE exceptional per CSS spec
- Makes semantics clear: multiValue = comma-separated
- Single special case in one place (parser.ts)
- Doesn't break existing architecture
- Easy to understand for future developers

## Implementation

1. Revert `multiValue: true` → `multiValue: false` in definition
2. Update parser.ts to check `isCustomProperty(property)` before multiValue check
3. Update comment to document the special case
4. Tests already pass with string input

## Future: Auto-generate PropertyIRMap

Separate improvement suggested by user:

- Create `allProperties` object in properties/index.ts
- Derive PropertyIRMap and RegisteredProperty from it
- Single source of truth, zero maintenance
- Can be done after declaration list implementation
