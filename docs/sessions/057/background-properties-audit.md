# Background Properties Audit

**Date:** 2025-11-08
**Purpose:** Ensure all background properties follow the same architecture as background-size

---

## Reference: background-size (Session 056)

**Structure:**
```
@b/keywords/src/bg-size.ts          # Zod schema for keywords
@b/types/src/bg-size.ts             # Uses cssValueSchema
@b/parsers/src/background/size.ts   # Uses parseNodeToCssValue
@b/generators/src/background/size.ts # Uses cssValueToCss
@b/declarations/properties/background-size/
```

**Key patterns:**
- Property-specific keywords in `@b/keywords` (auto, cover, contain)
- Component values use `cssValueSchema` → get var(), calc() for free
- Value parsers delegate to generic utilities
- Property parsers are thin orchestrators

---

## Properties to Audit

### 1. background-repeat
### 2. background-origin
### 3. background-clip
### 4. background-attachment

---

## Audit Criteria

For each property, check:

1. **Keywords**: Are they in `@b/keywords` with Zod schema?
2. **Types**: Does it use `cssValueSchema` for component values?
3. **Parser**: Does it use generic utilities (parseNodeToCssValue)?
4. **Generator**: Does it use generic utilities (cssValueToCss)?
5. **Structure**: Does it follow the package separation pattern?
6. **Benefits**: Would var()/calc() support be useful?

---

## Findings

(To be filled during audit)

