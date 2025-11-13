# Parser API Naming Inconsistency

**Date:** 2025-11-13  
**Issue:** Inconsistent naming across @b/parsers API  
**Status:** 📋 Documented - P3 refactor for future

---

## The Problem

```typescript
// What we expected:
Parsers.Length.parse(node);

// What exists:
Parsers.Length.parseLengthPercentageNode(node);

// What we ended up using:
Parsers.Utils.parseNodeToCssValue(node); // Generic, not type-specific
```

## Current Patterns

1. `parse()` - BlendMode, Image
2. `parseNode()` - Color
3. `parseLengthPercentageNode()` - Length
4. `Utils.parseNodeToCssValue()` - Our workaround

## Proposal

Standardize all to `parse()` for consistency and brevity.

## Decision

**Priority:** P3  
**Status:** Documented, revisit before 50+ properties  
**Current:** Continue using `Utils.parseNodeToCssValue()` - works fine
