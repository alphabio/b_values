# Phase 1: Code Trace & Validation

**Purpose:** Trace actual code flow to validate implementation plan

---

## Trace 1: Entry Point to Error

Let's trace: `parseDeclaration("background-image: rgb(300, 0, 0)")`

### Step 1: Entry - parseDeclaration()

**File:** `packages/b_declarations/src/parser.ts`

```typescript
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  // INPUT: "background-image: rgb(300, 0, 0)"
  // AVAILABLE: Full CSS string ✅

  let property: string;
  let value: string;

  if (typeof input === "string") {
    const parsed = parseDeclarationString(input);
    // property = "background-image"
    // value = "rgb(300, 0, 0)"
  }

  const definition = propertyRegistry.get(property);
  const parseResult = definition.parser(value);
  // 👆 ISSUE: We lose the full source here!
  //    Parser only gets "rgb(300, 0, 0)", not full declaration
}
```

**What We Need:**

- Capture full source: `"background-image: rgb(300, 0, 0)"`
- Calculate offset of value: position where `"rgb..."` starts
- Pass this context to property parser

---

### Step 2: Property Parser

**File:** `packages/b_declarations/src/properties/background-image/parser.ts`

```typescript
export function parseBackgroundImage(value: string): ParseResult<BackgroundImageIR> {
  // INPUT: "rgb(300, 0, 0)"
  // CONTEXT: Need to receive from Step 1

  // Parse each layer...
  const layerResults: ParseResult<ImageLayer>[] = [];

  // Delegates to color parser
  // 👆 ISSUE: No context passed down
}
```

**What We Need:**

- Accept ParseContext parameter
- Thread context to delegated parsers

---

### Step 3: CSS Tree Parsing

**File:** `packages/b_utils/src/parse/ast.ts`

```typescript
export function parseCssString(css: string, context: string): ParseResult<CssNode> {
  try {
    const ast = csstree.parse(css, {
      context: context,
      positions: true, // ✅ This enables .loc on nodes!
    });

    return parseOk(ast);
  } catch (error) {
    // ...
  }
}
```

**What We Have:**

- AST nodes have `.loc` property ✅
- Contains: `{ source, start: { offset, line, column }, end: {...} }`

**What We Need:**

- Extract this .loc info
- Merge with parent context
- Thread through to type parsers

---

### Step 4: Value Node Parsing

**File:** `packages/b_utils/src/parse/css-value-parser.ts`

```typescript
export function parseCssValueNode(node: CssNode): ParseResult<CssValue> {
  // INPUT: AST node with .loc ✅
  // node.loc.start.offset = position in "rgb(300, 0, 0)"
  // node.loc.source = "rgb(300, 0, 0)"

  switch (node.type) {
    case "Number":
      return parseOk({
        kind: "literal",
        value: Number(node.value),
        unit: null,
      });
    // 👆 ISSUE: We lose .loc info here
  }
}
```

**What We Need:**

- Extract .loc from node
- Attach to CssValue or thread through context
- Make available to semantic validation

---

### Step 5: Type-Specific Parser

**File:** `packages/b_parsers/src/color/rgb.ts`

```typescript
export function parseRgbFunction(node: csstree.FunctionNode): ParseResult<RGBColor> {
  // INPUT: FunctionNode with .loc
  // node.loc.start.offset = 0 (relative to "rgb(300, 0, 0)")

  const values = getValues(getChildren(node));

  const rResult = parseCssValueNode(values[0]);
  // rResult.value = { kind: "literal", value: 300, unit: null }

  if (!rResult.ok) return forwardParseErr<RGBColor>(rResult);

  const rgb: RGBColor = {
    kind: "rgb",
    r: rResult.value,
    g: gResult.value,
    b: bResult.value,
  };

  return parseOk(rgb);
  // 👆 ISSUE: Source context is lost
}
```

**What We Need:**

- Accept context parameter with full source
- Extract .loc from function node
- Combine: parent offset + node offset = absolute position
- Attach to result for later validation

---

### Step 6: Semantic Validation (Generator Side)

**File:** `packages/b_generators/src/color/rgb.ts`

```typescript
export function generate(color: unknown, context?: GenerateContext): GenerateResult {
  // ... structural validation

  // Semantic validation
  const rIssues = checkLiteralRange(validated.r, "r", 0, 255, {
    parentPath: context?.parentPath,
    property: context?.property,
  });

  for (const issue of rIssues) {
    result = addGenerateIssue(result, issue);
  }
  // 👆 ISSUE: No source context attached to issue
}
```

**What We Need:**

- Source context from IR (attached during parsing)
- OR: Accept source lookup function
- Attach to generated issues

---

## Key Insights from Code Trace

### Issue 1: Information Loss at Boundaries

**Problem:** Source context lost when crossing module boundaries

**Boundaries:**

1. `parseDeclaration` → property parser
2. Property parser → css-tree
3. css-tree → value parser
4. Value parser → type parser
5. Type parser → IR (parse result)
6. IR → generator
7. Generator → issue

**Solution:** Thread context object through all boundaries

---

### Issue 2: Offset Coordinate Systems

**Problem:** Multiple coordinate systems:

- Declaration: "background-image: rgb(300, 0, 0)"
  - Property starts at 0
  - Value starts at 18
- Value string: "rgb(300, 0, 0)"
  - Parsed separately, offsets relative to 0
- AST node: FunctionNode
  - .loc.start.offset relative to value string

**Solution:** Cumulative offset tracking

```typescript
interface SourceContext {
  source: string; // Full original CSS
  baseOffset: number; // Offset of current substring in source
  nodeOffset: number; // Offset of node in substring
  length: number; // Length of problematic segment
}

// Absolute position = baseOffset + nodeOffset
```

---

### Issue 3: Generator Has No Source Access

**Problem:** Generators don't have access to original CSS

- They receive IR (parsed data)
- IR doesn't currently carry source context
- Semantic warnings need source context

**Options:**

**Option A: Attach to IR**

```typescript
interface RGBColor {
  kind: "rgb";
  r: CssValue;
  g: CssValue;
  b: CssValue;
  _sourceContext?: SourceContext; // Metadata
}
```

Pros: Available when needed
Cons: Pollutes IR types, increases memory

**Option B: Separate context map**

```typescript
// In ParseResult
interface ParseResult<T> {
  ok: boolean;
  value?: T;
  issues: Issue[];
  sourceMap?: Map<string[], SourceContext>; // Path → context
}
```

Pros: Clean IR types
Cons: Complex lookup, memory overhead

**Option C: Lazy lookup function**

```typescript
interface ParseContext {
  property?: string;
  parentPath?: (string | number)[];
  getSourceContext?: (path: (string | number)[]) => SourceContext | undefined;
}
```

Pros: On-demand, flexible
Cons: Function threading, complexity

**Option D: Only attach on errors (RECOMMENDED)**

```typescript
// Parser attaches source to errors immediately
if (validation fails) {
  return parseErr(
    createError("invalid-value", "Out of range", {
      sourceContext: extractSourceContext(node),
    })
  );
}
```

Pros: Simple, no IR changes, only on error path
Cons: Parser knows about semantic validation (slight coupling)

---

## Recommended Approach

### Strategy: Hybrid (Option D + Context Threading)

**For Parsing Errors:**

- Attach source context immediately when creating error
- No need to thread through successful parse results

**For Generator Warnings:**

- Thread context through ParseContext
- Generator can access via context parameter
- Only attach to warnings, not to success results

**Implementation:**

```typescript
// Parsers
export function parseRgbFunction(node: csstree.FunctionNode, context?: ParseContext): ParseResult<RGBColor> {
  // Early error - attach source immediately
  if (values.length < 3) {
    return parseErr(
      createError("invalid-syntax", "RGB needs 3 values", {
        sourceContext: extractSourceContext(node, context?.sourceContext),
      })
    );
  }

  // Success - no source context needed in IR
  return parseOk(rgb);
}

// Generators
export function generate(color: unknown, context?: GenerateContext): GenerateResult {
  // ... validation

  if (r > 255) {
    result = addGenerateIssue(result, {
      code: "invalid-value",
      message: "Out of range",
      // Get source from context if available
      sourceContext: context?.sourceContext,
    });
  }
}
```

This approach:

- ✅ No IR pollution
- ✅ Simple implementation
- ✅ Performance friendly (only on error path)
- ✅ Backward compatible

---

## Files to Modify (Validated)

### Phase 1.1: Types ✅

- `packages/b_types/src/result/issue.ts` - Add SourceContext
- `packages/b_types/src/result/parse.ts` - Add to ParseContext
- `packages/b_types/src/result/generate.ts` - Add to GenerateContext

### Phase 1.2: Utilities ✅

- `packages/b_utils/src/parse/ast.ts` - extractSourceContext()
- `packages/b_utils/src/format/source-context.ts` - NEW file

### Phase 1.3: Parser Chain (Critical) ⚠️

- `packages/b_declarations/src/parser.ts` - Capture & pass context
- `packages/b_parsers/src/color/rgb.ts` - Accept context, extract .loc
- `packages/b_parsers/src/color/hsl.ts` - Same
- `packages/b_parsers/src/color/hwb.ts` - Same
- (... all color parsers)
- `packages/b_parsers/src/gradient/*.ts` - Same

### Phase 1.4: Error Creation ✅

- `packages/b_types/src/result/issue.ts` - createError accepts context
- Update call sites to pass context

---

## Next: Detailed Implementation Plan

Create task list with:

- Each file to modify
- Specific changes needed
- Tests to add
- Migration strategy
