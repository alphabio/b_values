# Phase 1: Source Context Threading - Action Plan

**Created:** 2025-11-05
**Estimated Time:** 6-9 hours
**Approach:** Hybrid (Option D - attach on errors immediately)

---

## Overview

Enable rich error messages with source context by threading location information from css-tree through the parser chain and attaching it to errors.

**Key Decision:** Attach source context to errors immediately, don't pollute IR types.

---

## Task Breakdown

### 🎯 Phase 1.1: Foundation (Type System)

**Time:** 30 minutes | **Risk:** Low

#### Task 1.1.1: Add SourceContext type

**File:** `packages/b_types/src/result/issue.ts`

```typescript
/**
 * Source location context for errors and warnings.
 * Enables rich error messages with code snippets.
 */
export interface SourceContext {
  /** Full original CSS source text */
  source: string;

  /** Base offset in source (for substring tracking) */
  baseOffset: number;

  /** Node offset relative to baseOffset */
  nodeOffset: number;

  /** Length of the problematic segment */
  length: number;

  /** Line number (1-indexed, optional) */
  line?: number;

  /** Column number (1-indexed, optional) */
  column?: number;
}

// Helper to calculate absolute offset
export function getAbsoluteOffset(ctx: SourceContext): number {
  return ctx.baseOffset + ctx.nodeOffset;
}
```

**Test:**

```typescript
// packages/b_types/src/result/issue.test.ts
describe("SourceContext", () => {
  it("should calculate absolute offset", () => {
    const ctx: SourceContext = {
      source: "background-image: rgb(300 100 50)",
      baseOffset: 18,
      nodeOffset: 4,
      length: 3,
    };
    expect(getAbsoluteOffset(ctx)).toBe(22);
  });
});
```

#### Task 1.1.2: Add sourceContext to Issue

**File:** `packages/b_types/src/result/issue.ts`

```typescript
export interface Issue {
  code: string;
  severity: "error" | "warning";
  message: string;
  path?: (string | number)[];
  property?: PropertyKey;
  suggestion?: string;
  expected?: string;
  received?: string | number;
  sourceContext?: SourceContext; // NEW
}
```

#### Task 1.1.3: Update createError to accept sourceContext

**File:** `packages/b_types/src/result/issue.ts`

```typescript
export interface IssueOptions {
  path?: (string | number)[];
  property?: PropertyKey;
  suggestion?: string;
  expected?: string;
  received?: string | number;
  sourceContext?: SourceContext; // NEW
}

export function createError(code: string, message: string, options: IssueOptions = {}): Issue {
  return {
    code,
    severity: "error",
    message,
    ...options,
  };
}
```

#### Task 1.1.4: Add sourceContext to ParseContext

**File:** `packages/b_types/src/result/parse.ts`

```typescript
export interface ParseContext {
  property?: string;
  parentPath?: (string | number)[];
  sourceContext?: SourceContext; // NEW
}
```

#### Task 1.1.5: Add sourceContext to GenerateContext

**File:** `packages/b_types/src/result/generate.ts`

```typescript
export interface GenerateContext {
  property?: string;
  parentPath?: (string | number)[];
  sourceContext?: SourceContext; // NEW
}
```

---

### 🛠️ Phase 1.2: Extraction Utilities

**Time:** 1 hour | **Risk:** Low

#### Task 1.2.1: Create extractSourceContext utility

**File:** `packages/b_utils/src/parse/ast.ts`

```typescript
import type * as csstree from "css-tree";
import type { SourceContext } from "@b/types";

/**
 * Extract source context from a css-tree AST node.
 * Combines node location with parent context for absolute positioning.
 *
 * @param node - AST node with optional .loc property
 * @param parentContext - Parent source context (for offset accumulation)
 * @returns SourceContext if node has location info, undefined otherwise
 */
export function extractSourceContext(node: csstree.CssNode, parentContext?: SourceContext): SourceContext | undefined {
  if (!node.loc) return undefined;

  const baseOffset = parentContext?.baseOffset ?? 0;

  return {
    source: parentContext?.source ?? node.loc.source,
    baseOffset,
    nodeOffset: node.loc.start.offset,
    length: node.loc.end.offset - node.loc.start.offset,
    line: node.loc.start.line,
    column: node.loc.start.column,
  };
}
```

**Tests:**

```typescript
// packages/b_utils/src/parse/ast.test.ts
describe("extractSourceContext", () => {
  it("should extract from node with .loc", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "300",
      loc: {
        source: "rgb(300 100 50)",
        start: { offset: 4, line: 1, column: 5 },
        end: { offset: 7, line: 1, column: 8 },
      },
    };

    const ctx = extractSourceContext(node);
    expect(ctx).toEqual({
      source: "rgb(300 100 50)",
      baseOffset: 0,
      nodeOffset: 4,
      length: 3,
      line: 1,
      column: 5,
    });
  });

  it("should combine with parent context", () => {
    const parent: SourceContext = {
      source: "background-image: rgb(300 100 50)",
      baseOffset: 18,
      nodeOffset: 0,
      length: 15,
    };

    const node: csstree.CssNode = {
      type: "Number",
      value: "300",
      loc: {
        source: "rgb(300 100 50)",
        start: { offset: 4, line: 1, column: 5 },
        end: { offset: 7, line: 1, column: 8 },
      },
    };

    const ctx = extractSourceContext(node, parent);
    expect(ctx?.baseOffset).toBe(18);
    expect(ctx?.source).toBe("background-image: rgb(300 100 50)");
  });

  it("should return undefined for node without .loc", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "300",
    };

    expect(extractSourceContext(node)).toBeUndefined();
  });
});
```

#### Task 1.2.2: Create formatSourceContext utility

**File:** `packages/b_utils/src/format/source-context.ts` (NEW)

````typescript
import type { SourceContext } from "@b/types";
import { getAbsoluteOffset } from "@b/types";

/**
 * Format source context into a human-readable error snippet.
 * Shows the problematic line with a caret (^) pointing to the issue.
 *
 * @param ctx - Source context to format
 * @returns Formatted string with line number, source, and caret
 *
 * @example
 * ```
 * 1 | background-image: rgb(300 100 50);
 *   |                        ^^^
 * ```
 */
export function formatSourceContext(ctx: SourceContext): string {
  const absoluteOffset = getAbsoluteOffset(ctx);

  // Calculate line and column if not provided
  let line = ctx.line ?? 1;
  let column = ctx.column ?? 1;

  if (!ctx.line || !ctx.column) {
    const upToOffset = ctx.source.slice(0, absoluteOffset);
    line = (upToOffset.match(/\n/g) || []).length + 1;
    const lastNewline = upToOffset.lastIndexOf("\n");
    column = lastNewline === -1 ? absoluteOffset + 1 : absoluteOffset - lastNewline;
  }

  // Extract the relevant line
  const lines = ctx.source.split("\n");
  const sourceLine = lines[line - 1] ?? "";

  // Create caret indicator
  const caretPadding = " ".repeat(column - 1);
  const caretLength = Math.min(ctx.length, sourceLine.length - column + 1);
  const caret = "^".repeat(Math.max(1, caretLength));

  // Format with line numbers
  const lineNumber = String(line).padStart(3, " ");
  const padding = " ".repeat(lineNumber.length);

  return [`${lineNumber} | ${sourceLine}`, `${padding} | ${caretPadding}${caret}`].join("\n");
}

/**
 * Format an issue with source context into a complete error message.
 */
export function formatIssueWithContext(issue: Issue): string {
  const parts: string[] = [];

  // Header
  parts.push(`${issue.severity.toUpperCase()}: ${issue.message}`);

  // Source context
  if (issue.sourceContext) {
    const absoluteOffset = getAbsoluteOffset(issue.sourceContext);
    const line = issue.sourceContext.line ?? 1;
    const column = issue.sourceContext.column ?? 1;

    parts.push(`  at ${issue.property ?? "unknown"} (line ${line}, column ${column})`);
    parts.push("");
    parts.push(formatSourceContext(issue.sourceContext));
    parts.push("");
  }

  // Additional details
  if (issue.expected) {
    parts.push(`  Expected: ${issue.expected}`);
  }
  if (issue.received !== undefined) {
    parts.push(`  Received: ${issue.received}`);
  }
  if (issue.suggestion) {
    parts.push(`  Suggestion: ${issue.suggestion}`);
  }

  return parts.join("\n");
}
````

**Tests:**

```typescript
// packages/b_utils/src/format/source-context.test.ts
describe("formatSourceContext", () => {
  it("should format simple single-line context", () => {
    const ctx: SourceContext = {
      source: "rgb(300 100 50)",
      baseOffset: 0,
      nodeOffset: 4,
      length: 3,
      line: 1,
      column: 5,
    };

    const formatted = formatSourceContext(ctx);
    expect(formatted).toBe("  1 | rgb(300 100 50)\n" + "    |     ^^^");
  });

  it("should handle multi-line sources", () => {
    const ctx: SourceContext = {
      source: "background-image:\n  rgb(300 100 50);",
      baseOffset: 0,
      nodeOffset: 22,
      length: 3,
      line: 2,
      column: 7,
    };

    const formatted = formatSourceContext(ctx);
    expect(formatted).toContain("  2 | ");
    expect(formatted).toContain("rgb(300 100 50)");
    expect(formatted).toContain("      ^^^");
  });

  it("should calculate line and column when not provided", () => {
    const ctx: SourceContext = {
      source: "background-image: rgb(300 100 50)",
      baseOffset: 0,
      nodeOffset: 22,
      length: 3,
    };

    const formatted = formatSourceContext(ctx);
    expect(formatted).toBeDefined();
  });
});

describe("formatIssueWithContext", () => {
  it("should format complete error message", () => {
    const issue: Issue = {
      code: "invalid-value",
      severity: "error",
      message: "RGB r value out of range",
      property: "background-image",
      expected: "0-255",
      received: 300,
      suggestion: "Use a value between 0 and 255",
      sourceContext: {
        source: "rgb(300 100 50)",
        baseOffset: 0,
        nodeOffset: 4,
        length: 3,
        line: 1,
        column: 5,
      },
    };

    const formatted = formatIssueWithContext(issue);
    expect(formatted).toContain("ERROR: RGB r value out of range");
    expect(formatted).toContain("at background-image");
    expect(formatted).toContain("rgb(300 100 50)");
    expect(formatted).toContain("^^^");
    expect(formatted).toContain("Expected: 0-255");
    expect(formatted).toContain("Received: 300");
  });
});
```

---

### ⚙️ Phase 1.3: Parser Integration (Critical Path)

**Time:** 2-3 hours | **Risk:** Medium

#### Task 1.3.1: Update parseDeclaration entry point

**File:** `packages/b_declarations/src/parser.ts`

```typescript
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  let property: string;
  let value: string;
  let fullSource: string;
  let valueOffset: number;

  // Parse string input
  if (typeof input === "string") {
    fullSource = input;
    const parsed = parseDeclarationString(input);
    if (!parsed.ok) {
      return forwardParseErr<DeclarationResult>(parsed);
    }
    property = parsed.value.property;
    value = parsed.value.value;
    valueOffset = fullSource.indexOf(value);
  } else {
    property = input.property;
    value = input.value;
    fullSource = `${property}: ${value}`;
    valueOffset = property.length + 2; // "property: "
  }

  // Look up property definition
  const definition = propertyRegistry.get(property);
  if (!definition) {
    return parseErr(createError("invalid-value", `Unknown CSS property: ${property}`));
  }

  // Parse the value with source context
  const parseResult = definition.parser(value, {
    property,
    sourceContext: {
      source: fullSource,
      baseOffset: valueOffset,
      nodeOffset: 0,
      length: value.length,
    },
  });

  if (!parseResult.ok) {
    return forwardParseErr<DeclarationResult>(parseResult);
  }

  return parseOk({
    property,
    ir: parseResult.value,
    original: value,
  });
}
```

#### Task 1.3.2: Update property parsers to accept context

**File:** `packages/b_declarations/src/properties/background-image/parser.ts`

```typescript
export function parseBackgroundImage(
  value: string,
  context?: ParseContext // NEW parameter
): ParseResult<BackgroundImageIR> {
  const trimmed = value.trim();

  // ... CSS-wide keyword handling (unchanged)

  // Split into layers
  const layerStrings = splitByComma(trimmed);
  const layerResults: ParseResult<ImageLayer>[] = [];

  for (let i = 0; i < layerStrings.length; i++) {
    const layer = layerStrings[i].trim();
    const layerOffset = value.indexOf(layer);

    // Create context for this layer
    const layerContext: ParseContext = {
      property: context?.property,
      parentPath: [...(context?.parentPath ?? []), "layers", i],
      sourceContext: context?.sourceContext
        ? {
            ...context.sourceContext,
            baseOffset: context.sourceContext.baseOffset + layerOffset,
            nodeOffset: 0,
            length: layer.length,
          }
        : undefined,
    };

    // Delegate to parsers with context
    if (layer.startsWith("url(")) {
      const urlResult = Parsers.Url.parseUrl(layer, layerContext);
      // ...
    }

    if (layer.startsWith("linear-gradient(")) {
      const gradientResult = Parsers.Gradient.Linear.parse(layer, layerContext);
      // ...
    }

    // ... other layer types
  }

  // ... rest of function
}
```

#### Task 1.3.3: Update color parsers to extract and use context

**Files:**

- `packages/b_parsers/src/color/rgb.ts`
- `packages/b_parsers/src/color/hsl.ts`
- `packages/b_parsers/src/color/hwb.ts`
- `packages/b_parsers/src/color/lab.ts`
- `packages/b_parsers/src/color/lch.ts`
- `packages/b_parsers/src/color/oklab.ts`
- `packages/b_parsers/src/color/oklch.ts`

**Example for rgb.ts:**

```typescript
import { extractSourceContext } from "@b/utils";

export function parseRgbFunction(
  node: csstree.FunctionNode,
  context?: ParseContext // NEW parameter
): ParseResult<RGBColor> {
  if (node.name !== "rgb" && node.name !== "rgba") {
    return parseErr(
      createError("invalid-syntax", "Expected rgb() or rgba() function", {
        sourceContext: extractSourceContext(node, context?.sourceContext),
      })
    );
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr(
      createError("invalid-syntax", `RGB function must have 3 or 4 values, got ${values.length}`, {
        sourceContext: extractSourceContext(node, context?.sourceContext),
      })
    );
  }

  // Parse components
  const rResult = parseCssValueNode(values[0]);
  if (!rResult.ok) {
    // Attach source context to forwarded error
    const errorWithContext = forwardParseErr<RGBColor>(rResult);
    if (context?.sourceContext) {
      const nodeContext = extractSourceContext(values[0], context.sourceContext);
      errorWithContext.issues = errorWithContext.issues.map((issue) => ({
        ...issue,
        sourceContext: nodeContext ?? issue.sourceContext,
      }));
    }
    return errorWithContext;
  }

  // ... rest unchanged (source context attached on errors only)

  return parseOk(rgb);
}
```

**Repeat for all color parsers (7 files total)**

#### Task 1.3.4: Update gradient parsers

**Files:**

- `packages/b_parsers/src/gradient/linear.ts`
- `packages/b_parsers/src/gradient/radial.ts`
- `packages/b_parsers/src/gradient/conic.ts`

Same pattern as color parsers - accept context, extract from nodes, attach to errors.

---

### 🎨 Phase 1.4: Generator Integration

**Time:** 1 hour | **Risk:** Low

#### Task 1.4.1: Thread context through generators

**File:** `packages/b_generators/src/color/rgb.ts`

```typescript
export function generate(color: unknown, context?: GenerateContext): GenerateResult {
  // ... validation

  // Semantic validation with source context
  const rIssues = checkLiteralRange(validated.r, "r", 0, 255, {
    parentPath: context?.parentPath,
    property: context?.property,
    sourceContext: context?.sourceContext, // NEW
  });

  for (const issue of rIssues) {
    result = addGenerateIssue(result, issue);
  }

  return result;
}
```

**Note:** Generators receive source context from the full parse→generate round-trip when users call both operations.

---

### ✅ Phase 1.5: Testing & Validation

**Time:** 1-2 hours | **Risk:** Low

#### Task 1.5.1: Add integration test

**File:** `packages/b_declarations/src/integration.test.ts`

```typescript
describe("Source context integration", () => {
  it("should provide source context for parsing errors", () => {
    const result = parseDeclaration("background-image: rgb(300, 0, 0)");

    expect(result.ok).toBe(false);
    if (result.ok) return;

    const issue = result.issues[0];
    expect(issue.sourceContext).toBeDefined();
    expect(issue.sourceContext?.source).toBe("background-image: rgb(300, 0, 0)");
    expect(issue.sourceContext?.length).toBeGreaterThan(0);
  });

  it("should format error with source context", () => {
    const result = parseDeclaration("color: rgb(300, 0, 0)");

    if (!result.ok && result.issues[0]?.sourceContext) {
      const formatted = formatIssueWithContext(result.issues[0]);
      expect(formatted).toContain("rgb(300");
      expect(formatted).toContain("^^^");
      expect(formatted).toContain("at color");
    }
  });
});
```

#### Task 1.5.2: Performance test

**File:** `packages/b_declarations/__tests__/performance.test.ts` (NEW)

```typescript
describe("Performance with source context", () => {
  it("should not significantly impact parse time", () => {
    const css = "background-image: linear-gradient(red, blue)";

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      parseDeclaration(css);
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should be under 1ms per parse
    expect(avgTime).toBeLessThan(1);
  });
});
```

---

## Migration Strategy

### Backward Compatibility

**All changes are backward compatible:**

- New fields are optional
- Existing code works without changes
- Source context only added when available

**No breaking changes:**

```typescript
// Old code still works
parseDeclaration("color: red");

// New code gets enhanced errors
const result = parseDeclaration("color: rgb(300, 0, 0)");
if (!result.ok && result.issues[0]?.sourceContext) {
  console.log(formatIssueWithContext(result.issues[0]));
}
```

### Rollout Plan

1. **Phase 1.1-1.2:** Types and utilities (non-breaking)
2. **Phase 1.3:** Parser integration (non-breaking, opt-in)
3. **Phase 1.4:** Generator integration (non-breaking)
4. **Phase 1.5:** Testing and validation

**Each phase can be committed independently.**

---

## Success Metrics

- [ ] Source context attached to all parser errors
- [ ] Formatted errors show exact location with caret
- [ ] Zero breaking changes
- [ ] All 994 existing tests still pass
- [ ] New tests for source context (10+ tests)
- [ ] Performance overhead < 5%
- [ ] Documentation with examples

---

## Timeline

**Day 1 (3-4 hours):**

- Phase 1.1: Types (30 min)
- Phase 1.2: Utilities (1 hour)
- Phase 1.3: Start parser integration (2 hours)

**Day 2 (3-4 hours):**

- Phase 1.3: Complete parser integration (2 hours)
- Phase 1.4: Generator integration (1 hour)
- Phase 1.5: Testing (1 hour)

**Total:** 6-8 hours over 2 days

---

## Open Questions

1. **Line context:** Show 1 line, 3 lines, or configurable?
   - **Recommendation:** Start with 1 line, add context lines later

2. **Minified CSS:** How to handle when source is minified?
   - **Recommendation:** Show available context, note if minified

3. **Multiline values:** How to show caret for multiline segments?
   - **Recommendation:** Show first line with caret, note continuation

4. **Performance:** Cache formatted messages or format on-demand?
   - **Recommendation:** Format on-demand (lazy), only when displaying

5. **Source maps:** Support for preprocessors (SCSS, etc.)?
   - **Recommendation:** Out of scope for Phase 1, future enhancement

---

## Next Actions

1. ✅ Review and approve this plan
2. Create feature branch: `feature/phase1-source-context`
3. Start with Phase 1.1 (types)
4. Commit after each phase
5. Open draft PR for early feedback

Ready to start? 🚀
