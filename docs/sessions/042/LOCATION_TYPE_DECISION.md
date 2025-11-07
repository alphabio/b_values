# Location Type Analysis & Decision

**Date:** 2025-11-07  
**Issue:** Type mismatch between css-tree locations and our SourceLocation

---

## 📊 Type Comparison

### css-tree Types

```typescript
/**
 * Represents a location within a CSS source.
 */
export interface CssLocation {
    /** The 0-indexed character offset from the beginning of the source. */
    offset: number;
    /** The 1-indexed line number. */
    line: number;
    /** The 1-indexed column number. */
    column: number;
}

/**
 * Represents a range of locations within a CSS source.
 */
export interface CssLocationRange {
    /** The source file name. If not provided, it will be set to `<unknown>`. */
    source: string;
    /** The starting location of the range. */
    start: CssLocation;
    /** The ending location of the range. */
    end: CssLocation;
}
```

### Our SourceLocation Type

```typescript
export interface SourceLocation {
  /** Zero-based offset from start of input */
  offset: number;
  /** Number of characters */
  length: number;
}
```

---

## 🤔 Why Don't We Use The Same?

### css-tree's Approach (Line/Column + Offset)
**Pros:**
- ✅ **Rich information**: offset, line, column all available
- ✅ **Better error messages**: "Line 5, column 10" is human-readable
- ✅ **Native to css-tree**: no conversion needed
- ✅ **Industry standard**: most parsers use line/column

**Cons:**
- ❌ **Larger structure**: 3 fields per location × 2 (start/end) = 6 fields
- ❌ **More complex**: need to track line/column during manual parsing
- ❌ **Redundant**: offset alone is sufficient for programmatic use

### Our Approach (Offset + Length)
**Pros:**
- ✅ **Minimal**: only 2 fields total
- ✅ **Simple**: easy to calculate and use
- ✅ **Efficient**: smaller memory footprint
- ✅ **Sufficient**: offset/length is all you need for highlighting

**Cons:**
- ❌ **Less readable**: offset 245 means nothing to humans
- ❌ **Conversion required**: need to convert from css-tree format
- ❌ **Manual calculation**: have to compute line/column when displaying

---

## 💡 Recommendation: Adopt css-tree's Format

### Why Switch?

1. **AST-native architecture**: We're now using css-tree's AST throughout
   - Locations come naturally from AST nodes
   - No conversion overhead
   - Already have offset, line, column

2. **Better error messages**: 
   ```
   ❌ Old: Error at offset 245
   ✅ New: Error at line 5, column 10
   ```

3. **No conversion complexity**:
   - Current: Need `convertLocation()` helper + source string
   - Proposed: Use css-tree locations directly

4. **Industry standard**: Aligns with most parser ecosystems

5. **Future-proof**: If we add source maps, line/column is essential

### Migration Path

1. **Update SourceLocation type**:
   ```typescript
   export interface SourceLocation {
     offset: number;
     line: number;
     column: number;
   }
   
   export interface SourceLocationRange {
     source?: string;
     start: SourceLocation;
     end: SourceLocation;
   }
   ```

2. **Update createError() to accept both formats**:
   ```typescript
   function createError(
     code: string,
     message: string,
     options?: {
       location?: CssLocationRange;  // Accept css-tree format directly
       // ... other options
     }
   )
   ```

3. **Update error formatters** to display line/column

4. **Minimal breaking changes**: Most code doesn't use location yet

---

## 🎯 Decision

**Adopt css-tree's `CssLocation` and `CssLocationRange` types.**

**Rationale:**
- We're committed to AST-native architecture
- Better error messages for users
- No conversion overhead
- Aligns with industry standards
- Future-proof for source maps

**Action Items (Next Session):**
1. Update `SourceLocation` type in `@b/types`
2. Update `createError()` signature
3. Update error formatters
4. Remove `convertLocation()` helper (no longer needed)
5. Verify all tests pass

---

## 📝 Notes

- css-tree already provides **offset** in addition to line/column
- We get the best of both worlds: human-readable AND programmatic
- The "length" field can be calculated: `end.offset - start.offset`
- Total cost: ~24 bytes per location (6 numbers) vs our 8 bytes (2 numbers)
- Trade-off: 3x memory for much better DX

---

**Conclusion: Use css-tree's format. It's the right choice for AST-native architecture.** ✅
