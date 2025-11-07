# 🔬 Declaration List Research

**Date:** 2025-11-07
**Topic:** Supporting CSS Declaration Lists in b_declarations

---

## 📚 Research Summary

### What is a Declaration List?

A **declaration list** is a semicolon-separated sequence of CSS declarations:
```css
color: red; font-size: 16px; margin: 10px
```

**Key characteristics:**
- No curly braces `{}`
- Semicolon-separated property:value pairs
- Last semicolon is optional
- Used in inline `style` attributes
- Same parsing rules as declaration blocks (but without braces)

---

## 🎯 Use Cases

### 1. **HTML Inline Styles (Primary)**
```html
<div style="color: red; background: blue; padding: 10px;">
```

### 2. **CSSOM Manipulation**
```javascript
element.style.cssText = "color: red; font-size: 16px;";
```

### 3. **CSS-in-JS**
```javascript
const styles = parseDeclarationList("color: red; font-size: 16px;");
```

### 4. **Batch Declaration Parsing**
Parse multiple properties at once for validation/transformation

---

## 🔧 CSS-Tree Support

### Context: `declarationList`

css-tree provides built-in support:

```typescript
const ast = csstree.parse(
  'color: red; border: 1px solid black;',
  { context: 'declarationList' }
);

// Returns DeclarationList node with children array of Declaration nodes
```

**AST Structure:**
```json
{
  "type": "DeclarationList",
  "children": [
    {
      "type": "Declaration",
      "property": "color",
      "value": { ... }
    },
    {
      "type": "Declaration",
      "property": "border",
      "value": { ... }
    }
  ]
}
```

---

## 🏗️ Current Architecture Analysis

### Existing Components

**We already have:**
- ✅ Single declaration parsing (`parseDeclaration`)
- ✅ Property registry with definitions
- ✅ Custom property support (--*)
- ✅ Multi-value property support (background-image)
- ✅ Error handling with partial failures

**What we need:**
- ❌ Declaration list parser (multiple declarations at once)
- ❌ Batch parsing with partial failure handling
- ❌ Declaration list generator
- ❌ Validation for declaration lists

---

## 💡 Proposed Implementation

### Architecture Decision

**Approach: Wrap existing `parseDeclaration`**

Instead of reimplementing, leverage existing infrastructure:

```typescript
export function parseDeclarationList(
  css: string
): ParseResult<DeclarationResult[]> {
  // 1. Parse with css-tree (declarationList context)
  // 2. Iterate over Declaration nodes
  // 3. Call existing parseDeclaration for each
  // 4. Collect results (handle partial failures)
  // 5. Return array of DeclarationResult
}
```

**Benefits:**
- ✅ Reuses all existing parsers
- ✅ Reuses property registry
- ✅ Reuses error handling
- ✅ Minimal new code
- ✅ Consistent behavior with single declarations

---

## 📋 Proposed API

### Parser

```typescript
/**
 * Parse a CSS declaration list (semicolon-separated declarations)
 * Commonly used for inline styles or batch parsing
 *
 * @param css - Declaration list string (no braces)
 * @returns ParseResult with array of DeclarationResult or errors
 *
 * @example
 * parseDeclarationList("color: red; font-size: 16px; margin: 10px")
 */
export function parseDeclarationList(
  css: string
): ParseResult<DeclarationResult[]>
```

### Generator

```typescript
/**
 * Generate CSS declaration list from IR array
 *
 * @param declarations - Array of DeclarationResult
 * @returns GenerateResult with semicolon-separated string
 *
 * @example
 * generateDeclarationList([colorIR, fontSizeIR])
 * // "color: red; font-size: 16px"
 */
export function generateDeclarationList(
  declarations: DeclarationResult[]
): GenerateResult
```

---

## 🎯 Implementation Plan

### Phase 1: Parser (~30 mins)

1. Create `packages/b_declarations/src/declaration-list-parser.ts`
2. Implement `parseDeclarationList`:
   - Use css-tree with `context: 'declarationList'`
   - Iterate Declaration nodes
   - Call `parseDeclaration` for each
   - Handle partial failures (continue on error)
   - Collect all results + issues
3. Add comprehensive tests (~20 tests)

### Phase 2: Generator (~15 mins)

1. Create `packages/b_declarations/src/declaration-list-generator.ts`
2. Implement `generateDeclarationList`:
   - Map over declarations array
   - Call `generateDeclaration` for each
   - Join with `"; "`
   - Handle errors
3. Add tests (~10 tests)

### Phase 3: Integration (~15 mins)

1. Export from `packages/b_declarations/src/index.ts`
2. Update types if needed
3. Add integration tests
4. Document usage

**Total Estimate: ~1 hour**

---

## 🧪 Test Strategy

### Parser Tests (~20 tests)

```typescript
describe("parseDeclarationList", () => {
  // Basic
  it("parses single declaration")
  it("parses multiple declarations")
  it("parses with trailing semicolon")
  it("parses without trailing semicolon")

  // Whitespace
  it("handles extra whitespace")
  it("handles newlines")
  it("handles mixed whitespace")

  // Edge cases
  it("parses empty string")
  it("parses only semicolons")
  it("handles missing values")

  // Mixed properties
  it("parses standard + custom properties")
  it("parses multi-value properties")

  // Partial failures
  it("continues on invalid property")
  it("continues on invalid value")
  it("collects all errors")

  // Real-world
  it("parses inline style example")
  it("parses complex declarations")
})
```

### Generator Tests (~10 tests)

```typescript
describe("generateDeclarationList", () => {
  it("generates single declaration")
  it("generates multiple declarations")
  it("joins with semicolons")
  it("handles empty array")
  it("round-trips correctly")
})
```

---

## ⚠️ Design Considerations

### Partial Failures

**Question:** What to return when some declarations fail?

**Option 1: All or nothing** (Reject if any fail)
- ❌ Loses valid data
- ❌ Not resilient
- ❌ Poor DX for batch operations

**Option 2: Collect both successes and errors** ✅
- ✅ Resilient parsing
- ✅ Matches CSS browser behavior (ignore invalid)
- ✅ Better DX for validation tools

**Decision:** Return successful declarations + collect all issues

```typescript
interface DeclarationListResult {
  declarations: DeclarationResult[];  // Successfully parsed
  issues: Issue[];                     // All errors collected
}
```

### Order Preservation

**Must preserve declaration order:**
- CSS cascade depends on order
- Inline styles rely on order
- Round-trip must be exact

### Invalid CSS Handling

**Strategy:**
1. Parse what we can
2. Collect errors for invalid declarations
3. Continue processing remaining declarations
4. Return partial results

---

## 🎨 Example Usage

### Parse Inline Style

```typescript
const style = "color: red; font-size: 16px; margin: 10px;";
const result = parseDeclarationList(style);

if (result.ok) {
  result.value.forEach(decl => {
    console.log(`${decl.property}: ${JSON.stringify(decl.ir)}`);
  });
}
```

### Generate Inline Style

```typescript
const declarations: DeclarationResult[] = [
  { property: "color", ir: colorIR, original: "red" },
  { property: "font-size", ir: fontSizeIR, original: "16px" }
];

const result = generateDeclarationList(declarations);
if (result.ok) {
  element.style.cssText = result.value;
}
```

### Batch Validation

```typescript
const userStyles = "color: red; invalid-prop: bad; margin: 10px;";
const result = parseDeclarationList(userStyles);

if (result.ok) {
  const valid = result.value.filter(d => !hasErrors(d));
  const invalid = result.issues;

  console.log(`Valid: ${valid.length}, Invalid: ${invalid.length}`);
}
```

---

## ✅ Benefits

1. **Enables inline style parsing** - Primary use case
2. **Batch processing** - Parse/validate multiple properties efficiently
3. **Resilient** - Handles partial failures gracefully
4. **Reuses existing code** - Minimal implementation effort
5. **Consistent** - Same behavior as single declaration parsing
6. **Type-safe** - Full TypeScript support
7. **Testable** - Clean API easy to test

---

## 🚀 Next Steps

1. **Implement parser** - Start with core functionality
2. **Add tests** - Comprehensive coverage
3. **Implement generator** - Reverse operation
4. **Document** - Usage examples and API docs
5. **Integrate** - Export from main package

---

**Ready to implement?** This is a high-value, low-effort feature that unlocks inline style support.

