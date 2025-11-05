# ADR Phase 1: Source Context Threading - Exploration

**Created:** 2025-11-05
**Session:** 027 (continuation)
**Status:** Planning & Analysis

---

## Goal

Thread source location information (`offset`, `length`) from css-tree AST nodes through the entire parser chain to enable rich error messages with exact source positions.

**Example Target Output:**

```
Error: Invalid RGB value
  at background-image:23:45
  |
  | background-image: linear-gradient(rgb(300 100 50), blue);
  |                                        ^^^
  | RGB r value 300 is out of valid range 0-255
```

---

## Current State Analysis

### What We Have

1. **css-tree AST nodes** contain location info:

   ```typescript
   interface CssNode {
     type: string;
     loc?: {
       source: string;
       start: { offset: number; line: number; column: number };
       end: { offset: number; line: number; column: number };
     };
   }
   ```

2. **Our ParseResult** can store path context:

   ```typescript
   type ParseResult<T> = {
     ok: boolean;
     value?: T;
     issues: Issue[];
     property?: string;
   };
   ```

3. **Issue type** supports location:

   ```typescript
   interface Issue {
     code: string;
     severity: "error" | "warning";
     message: string;
     path?: (string | number)[];
     // 👇 Need to add source context
     // sourceContext?: SourceContext;
   }
   ```

### What We Need

**New type for source location:**

```typescript
interface SourceContext {
  /** Original CSS text */
  source: string;
  /** Character offset in source */
  offset: number;
  /** Length of the problematic segment */
  length: number;
  /** Optional line/column (derived from offset) */
  line?: number;
  column?: number;
}
```

---

## Architecture Analysis

### Parser Chain Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Entry Point: parseDeclaration()                         │
│    Input: "background-image: linear-gradient(rgb(...))"    │
│    Source: Full CSS string available here ✅                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Property Parser: parseBackgroundImage()                 │
│    Input: "linear-gradient(rgb(...))"                      │
│    Source: Substring - need to track offset 🤔              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. css-tree Parse: parseCssString()                        │
│    Output: AST with loc info ✅                             │
│    Location: Available in every node                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Value Parser: parseCssValueNode()                       │
│    Input: AST node with .loc ✅                             │
│    Need: Extract and thread through                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Type Parser: parseRgbFunction()                         │
│    Input: FunctionNode with .loc ✅                         │
│    Output: RGBColor IR                                     │
│    Need: Attach source context to result                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Error Creation: createError()                           │
│    Input: Issue details + source context                   │
│    Output: Issue with formatted message                    │
│    Need: Format source context into readable message       │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files to Modify

### 1. Core Types (`packages/b_types/src/`)

**Files:**

- `result/issue.ts` - Add SourceContext type
- `result/parse.ts` - Thread context through ParseContext
- `values/css-value.ts` - May need source info in CssValue

**Changes:**

```typescript
// In result/issue.ts
export interface SourceContext {
  source: string;
  offset: number;
  length: number;
  line?: number;
  column?: number;
}

export interface Issue {
  // ... existing fields
  sourceContext?: SourceContext; // NEW
}

// In result/parse.ts
export interface ParseContext {
  property?: string;
  parentPath?: (string | number)[];
  sourceContext?: SourceContext; // NEW - thread through parsers
}
```

### 2. Utility Functions (`packages/b_utils/src/`)

**Files:**

- `parse/css-value-parser.ts` - Extract loc from AST nodes
- `parse/ast.ts` - Helper to get source context from nodes
- NEW: `format/source-context.ts` - Format source snippets

**Changes:**

```typescript
// In parse/ast.ts
export function extractSourceContext(node: CssNode, fullSource?: string): SourceContext | undefined {
  if (!node.loc) return undefined;

  return {
    source: fullSource ?? node.loc.source,
    offset: node.loc.start.offset,
    length: node.loc.end.offset - node.loc.start.offset,
    line: node.loc.start.line,
    column: node.loc.start.column,
  };
}

// NEW: format/source-context.ts
export function formatSourceContext(ctx: SourceContext): string {
  // Generate the pretty error message with caret
  const lines = ctx.source.split("\n");
  const line = lines[ctx.line - 1];
  const caret = " ".repeat(ctx.column - 1) + "^".repeat(ctx.length);

  return `
  ${ctx.line} | ${line}
     | ${caret}
  `.trim();
}
```

### 3. Parser Entry Points

**Files:**

- `packages/b_declarations/src/parser.ts` - Capture original CSS
- `packages/b_parsers/src/color/rgb.ts` (and others) - Thread context

**Changes:**

```typescript
// In declarations/parser.ts
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  let property: string;
  let value: string;

  // NEW: Capture full source for context
  const fullSource = typeof input === "string" ? input : `${input.property}: ${input.value}`;

  // ... existing logic

  // Pass source to property parser
  const parseResult = definition.parser(value, {
    property,
    sourceContext: {
      source: fullSource,
      offset: fullSource.indexOf(value), // Calculate offset
      length: value.length,
    },
  });
}

// In parsers/color/rgb.ts
export function parseRgbFunction(
  node: csstree.FunctionNode,
  context?: ParseContext // NEW: accept context
): ParseResult<RGBColor> {
  // Extract source context from node
  const sourceContext = context?.sourceContext ?? extractSourceContext(node);

  // ... parsing logic

  if (!rResult.ok) {
    // Attach source context to error
    const errorWithContext = forwardParseErr<RGBColor>(rResult);
    if (sourceContext) {
      errorWithContext.issues = errorWithContext.issues.map((issue) => ({
        ...issue,
        sourceContext,
      }));
    }
    return errorWithContext;
  }
}
```

---

## Implementation Strategy

### Phase 1.1: Foundation (Type System)

1. Add `SourceContext` type to `b_types`
2. Add `sourceContext` field to `Issue`
3. Add `sourceContext` to `ParseContext`
4. Export new types

**Time:** 30 minutes
**Risk:** Low - pure types, no logic

### Phase 1.2: Extraction Utilities

1. Create `extractSourceContext` in `b_utils`
2. Create `formatSourceContext` formatter
3. Add tests for formatting
4. Document usage

**Time:** 1 hour
**Risk:** Low - standalone utilities

### Phase 1.3: Parser Integration (Critical Path)

1. Update `parseCssString` to preserve original source
2. Update `parseCssValueNode` to extract and pass context
3. Update entry point parsers (rgb, hsl, etc.) to accept context
4. Thread context through nested calls

**Time:** 2-3 hours
**Risk:** Medium - touches many files

### Phase 1.4: Error Formatting

1. Update `createError` to accept source context
2. Format context in error messages
3. Add tests for formatted output
4. Update existing error creation sites

**Time:** 1-2 hours
**Risk:** Low - mostly formatting

### Phase 1.5: Testing & Polish

1. Add comprehensive tests
2. Verify formatting is readable
3. Update documentation
4. Performance check (are we copying too much?)

**Time:** 1-2 hours
**Risk:** Low - verification

**Total Estimated Time:** 6-9 hours

---

## Challenges & Considerations

### Challenge 1: Source String Availability

**Problem:** Not all parsers have access to original source
**Solution:** Thread through context object, make optional

### Challenge 2: Offset Calculation

**Problem:** When parsing substrings, offsets are relative
**Solution:** Track cumulative offset in context

### Challenge 3: Performance

**Problem:** Copying source strings everywhere
**Solution:**

- Only attach on errors, not success
- Consider string slicing vs full source
- Lazy formatting (format on display, not storage)

### Challenge 4: Nested Parsers

**Problem:** Child parsers need parent's source context
**Solution:** Context object carries source, child adds offset

---

## Success Criteria

- [ ] Source context available in all parser error paths
- [ ] Error messages show exact location with caret
- [ ] Zero performance regression (< 5% overhead)
- [ ] All existing tests still pass
- [ ] New tests for source context formatting
- [ ] Documentation updated with examples

---

## Example Target Output

**Input CSS:**

```css
background-image: linear-gradient(rgb(300 100 50), blue);
```

**Current Error:**

```
Error: RGB r value 300 is out of valid range 0-255
  at path: ["r"]
  property: background-image
```

**Target Error:**

```
Error: RGB r value 300 is out of valid range 0-255
  at background-image (line 1, column 36)

    1 | background-image: linear-gradient(rgb(300 100 50), blue);
      |                                        ^^^

  Expected: 0-255
  Received: 300
  Suggestion: Use a value between 0 and 255
```

---

## Next Steps

1. Review this plan with team/stakeholders
2. Create detailed task list
3. Set up feature branch
4. Start with Phase 1.1 (types)
5. Iterate through phases

---

## Questions to Answer

- [ ] Do we want line/column or just offset?
- [ ] How much context to show (1 line, 3 lines, full property)?
- [ ] Should we cache formatted messages?
- [ ] What about multiline CSS values?
- [ ] How to handle minified CSS?
