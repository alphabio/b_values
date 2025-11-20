# Filter Infrastructure Intelligence

**Date:** 2025-11-15 05:26 UTC
**Task:** Implement `filter` and `backdrop-filter` properties

---

## 📋 Spec Analysis

### Filter Grammar

```
filter = none | <filter-value-list>
<filter-value-list> = [ <filter-function> | <url> ]+
```

### Filter Functions (10 total)

1. **blur(length?)**
   - Optional length parameter
   - Default: 0px (no blur)

2. **brightness(number|percentage?)**
   - Optional number OR percentage
   - Default: 1 (100%)

3. **contrast(number|percentage?)**
   - Optional number OR percentage
   - Default: 1 (100%)

4. **grayscale(number|percentage?)**
   - Optional number OR percentage
   - Default: 0 (0%)

5. **hue-rotate(angle|zero?)**
   - Optional angle OR zero
   - Default: 0deg

6. **invert(number|percentage?)**
   - Optional number OR percentage
   - Default: 0 (0%)

7. **opacity(number|percentage?)**
   - Optional number OR percentage
   - Default: 1 (100%)
   - NOTE: Different from `opacity` property

8. **saturate(number|percentage?)**
   - Optional number OR percentage
   - Default: 1 (100%)

9. **sepia(number|percentage?)**
   - Optional number OR percentage
   - Default: 0 (0%)

10. **drop-shadow(color? && length{2,3})**
    - 2-3 lengths (offset-x, offset-y, blur-radius?)
    - Optional color (before or after lengths)
    - Most complex filter function

---

## 🏗️ Infrastructure Needed

### Keywords (@b/keywords)

- ✅ `none` - Already exists (`packages/b_keywords/src/none.ts`)
- ❌ No new keywords needed

### Types (@b/types)

**Create `packages/b_types/src/filter/` directory:**

1. `blur.ts` - BlurFunction type
2. `brightness.ts` - BrightnessFunction type
3. `contrast.ts` - ContrastFunction type
4. `grayscale.ts` - GrayscaleFunction type
5. `hue-rotate.ts` - HueRotateFunction type
6. `invert.ts` - InvertFunction type
7. `opacity.ts` - OpacityFunction type
8. `saturate.ts` - SaturateFunction type
9. `sepia.ts` - SepiaFunction type
10. `drop-shadow.ts` - DropShadowFunction type
11. `index.ts` - Union type + list type

**Pattern (similar to transform):**

```typescript
// Simple function (blur)
export const blurFunctionSchema = z
  .object({
    kind: z.literal("blur"),
    length: lengthSchema.optional(),
  })
  .strict();

// Number/percentage function (brightness)
export const brightnessFunctionSchema = z
  .object({
    kind: z.literal("brightness"),
    value: z.union([z.number(), percentageSchema]).optional(),
  })
  .strict();

// Angle function (hue-rotate)
export const hueRotateFunctionSchema = z
  .object({
    kind: z.literal("hue-rotate"),
    angle: angleSchema.optional(),
  })
  .strict();

// Complex function (drop-shadow)
export const dropShadowFunctionSchema = z
  .object({
    kind: z.literal("drop-shadow"),
    offsetX: lengthSchema,
    offsetY: lengthSchema,
    blurRadius: lengthSchema.optional(),
    color: colorSchema.optional(),
  })
  .strict();

// Union + list
export const filterFunctionSchema = z.union([
  blurFunctionSchema,
  brightnessFunctionSchema,
  // ... all 10 functions
]);

export const filterListSchema = z.array(filterFunctionSchema);
```

### Parsers (@b/parsers)

**Create `packages/b_parsers/src/filter/` directory:**

Same structure as types (10 files + index.ts)

**Key utilities available:**

- ✅ `parseNumberNode()` - In `length.ts`
- ✅ `parseLengthNode()` - In `length.ts`
- ✅ `parseLengthPercentageNode()` - In `length.ts`
- ✅ `parseAngleNode()` - In `angle.ts`
- ✅ `Color.parseColor()` - In `color/index.ts`

**Pattern:**

```typescript
export function parseBlurFunction(node: csstree.FunctionNode): ParseResult<Type.BlurFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName !== "blur") {
    return parseErr("filter", createError("unsupported-kind", `Expected blur, got ${funcName}`));
  }

  // Optional parameter
  if (args.length === 0) {
    return parseOk({ kind: "blur" });
  }

  if (args.length !== 1) {
    return parseErr("filter", createError("invalid-syntax", "blur() requires 0 or 1 argument"));
  }

  const lengthResult = parseLengthNode(args[0]);
  if (!lengthResult.ok) {
    return parseErr("filter", lengthResult.issues[0]);
  }

  return parseOk({ kind: "blur", length: lengthResult.value });
}
```

**Main dispatcher (index.ts):**

```typescript
export function parseFilterFunction(node: csstree.FunctionNode): ParseResult<Type.FilterFunction> {
  const funcName = node.name.toLowerCase();

  switch (funcName) {
    case "blur":
      return parseBlurFunction(node);
    case "brightness":
      return parseBrightnessFunction(node);
    // ... all 10
    default:
      return parseErr("filter", createError("unsupported-kind", `Unknown filter: ${funcName}`));
  }
}

export function parseFilterList(ast: csstree.Value): ParseResult<Type.FilterList> {
  const children = Array.from(ast.children);
  const nodes = children.filter((n) => n.type !== "WhiteSpace");

  const filters: Type.FilterFunction[] = [];
  const issues: Issue[] = [];

  for (const node of nodes) {
    if (node.type === "Function") {
      const result = parseFilterFunction(node);
      if (result.ok) {
        filters.push(result.value);
        issues.push(...result.issues);
      } else {
        return parseErr("filter", result.issues[0]);
      }
    } else if (node.type === "Url") {
      // TODO: Handle url() references (SVG filters)
      // For now, return error
      return parseErr("filter", createError("unsupported-kind", "url() filters not yet supported"));
    }
  }

  return parseOk(filters, issues);
}
```

### Generators (@b/generators)

**Create `packages/b_generators/src/filter/` directory:**

Single `index.ts` file (following transform pattern)

**Pattern:**

```typescript
export function generate(ir: Type.FilterFunction): GenerateResult {
  switch (ir.kind) {
    case "blur": {
      if (!ir.length) return generateOk("blur()");
      const length = Length.generate(ir.length);
      if (!length.ok) return length;
      return generateOk(`blur(${length.value})`);
    }

    case "brightness": {
      if (ir.value === undefined) return generateOk("brightness()");
      if (typeof ir.value === "number") {
        return generateOk(`brightness(${ir.value})`);
      }
      return generateOk(`brightness(${ir.value.value}${ir.value.unit})`);
    }

    case "hue-rotate": {
      if (!ir.angle) return generateOk("hue-rotate()");
      const angle = Angle.generate(ir.angle);
      if (!angle.ok) return angle;
      return generateOk(`hue-rotate(${angle.value})`);
    }

    case "drop-shadow": {
      const parts: string[] = [];

      // Color can come first or last
      if (ir.color) {
        const color = Color.generate(ir.color);
        if (!color.ok) return color;
        parts.push(color.value);
      }

      const x = Length.generate(ir.offsetX);
      const y = Length.generate(ir.offsetY);
      if (!x.ok) return x;
      if (!y.ok) return y;
      parts.push(x.value, y.value);

      if (ir.blurRadius) {
        const blur = Length.generate(ir.blurRadius);
        if (!blur.ok) return blur;
        parts.push(blur.value);
      }

      return generateOk(`drop-shadow(${parts.join(" ")})`);
    }

    // ... rest of functions

    default:
      return generateErr({ code: "unsupported-kind", message: "Unsupported filter function" });
  }
}

export function generateList(ir: Type.FilterList): GenerateResult {
  const results = ir.map(generate);
  const failed = results.find((r) => !r.ok);
  if (failed) return failed;

  const values = results.map((r) => (r as { ok: true; value: string }).value);
  return generateOk(values.join(" "));
}
```

### Declarations (@b/declarations)

**Create `packages/b_declarations/src/properties/filter/`:**

1. `types.ts` - FilterIR type
2. `parser.ts` - parseFilter()
3. `generator.ts` - generateFilter()
4. `definition.ts` - Property definition
5. `index.ts` - Barrel export

**types.ts:**

```typescript
import type * as Type from "@b/types";

export type FilterIR =
  | { kind: "keyword"; value: Type.CssWide | "none" }
  | { kind: "css-value"; value: Type.CssValue }
  | { kind: "filter-list"; value: Type.FilterList };
```

**parser.ts:**

```typescript
export function parseFilter(ast: csstree.Value): ParseResult<FilterIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return parseErr("filter", createError("missing-value", "Empty value"));
  }

  // Check for keywords (none, css-wide)
  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return parseOk({ kind: "keyword", value: cssWideResult.data });
    }

    const noneResult = Keywords.none.safeParse(name);
    if (noneResult.success) {
      return parseOk({ kind: "keyword", value: "none" });
    }
  }

  // Try universal CSS functions
  const cssValueResult = Parsers.Universal.parseCssValue(ast);
  if (cssValueResult.ok) {
    return parseOk({ kind: "css-value", value: cssValueResult.value });
  }

  // Parse filter list
  const filterListResult = Parsers.Filter.parseFilterList(ast);
  if (filterListResult.ok) {
    return parseOk({ kind: "filter-list", value: filterListResult.value });
  }

  return parseErr("filter", filterListResult.issues[0]);
}
```

**generator.ts:**

```typescript
export function generateFilter(ir: FilterIR): GenerateResult {
  switch (ir.kind) {
    case "keyword":
      return generateOk(ir.value);

    case "css-value":
      return Generators.Universal.generate(ir.value);

    case "filter-list":
      return Generators.Filter.generateList(ir.value);

    default:
      return generateErr({ code: "unsupported-kind", message: "Unsupported filter IR" });
  }
}
```

**backdrop-filter:** Same structure, just different property name.

---

## 🎯 Implementation Order

### Phase 1: Infrastructure (types → parsers → generators)

1. Create type definitions (10 filter functions)
2. Create parsers (10 functions + dispatcher + list)
3. Create generators (single file, all functions)
4. Export from package indexes

### Phase 2: Properties (declarations)

1. Create `filter` property
2. Create `backdrop-filter` property (copy filter, change name)

### Phase 3: Verification

1. Run tests
2. Fix issues
3. Commit

---

## 🔑 Key Patterns

### Optional Parameters

Most filter functions have optional parameters with defaults:

- `blur()` → blur(0px)
- `brightness()` → brightness(1)
- `hue-rotate()` → hue-rotate(0deg)

**Handle in IR as optional fields, generate with/without parameter.**

### Number vs Percentage

8 functions accept `number | percentage`:

- brightness, contrast, grayscale, invert, opacity, saturate, sepia

**Type as:** `value: number | Percentage | undefined`

**Parse as:** Try parseNumberNode first, then parseLengthPercentageNode (filter for percentage unit)

**Generate as:** Check typeof === "number" vs object with unit property

### None Handling

- `filter: none` is valid (disables filters)
- Similar to `transform: none`
- Already have Keywords.none, reuse pattern

### Drop-Shadow Complexity

Most complex filter function:

- Color optional, can appear before or after offsets
- 2-3 length values (x, y, blur?)
- Need careful parsing order

**Strategy:** Parse all args, classify by type (color vs length), validate count.

---

## ✅ Pre-Flight Checklist

- ✅ `none` keyword exists
- ✅ `parseNumberNode()` exists
- ✅ `parseLengthNode()` exists
- ✅ `parseLengthPercentageNode()` exists
- ✅ `parseAngleNode()` exists
- ✅ `Color.parseColor()` exists
- ✅ `Length.generate()` exists
- ✅ `Angle.generate()` exists
- ✅ `Color.generate()` exists
- ✅ Transform pattern established (copy structure)
- ✅ Percentage type defined

**Ready to build.**

---

**Estimated time:** 2 hours
**Files to create:** ~25 files
**Lines of code:** ~1,500 lines

---

## 📝 Appendix: SVG Filter References (Deferred)

### What are SVG filter references?

CSS filters support **two** syntaxes:

1. **Filter functions** (what we're implementing):

   ```css
   filter: blur(5px) brightness(1.2);
   ```

2. **SVG filter references** (deferred):

   ```css
   filter: url(#my-svg-filter);
   filter: url(filters.svg#blur-effect);
   ```

### SVG Filter Syntax

```css
/* Reference SVG filter by ID */
filter: url(#drop-shadow);

/* Reference external SVG file */
filter: url(filters.svg#gaussian-blur);

/* Can combine with filter functions */
filter: url(#custom-effect) brightness(1.1) contrast(1.2);
```

**Corresponding SVG:**

```html
<svg>
  <filter id="drop-shadow">
    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
    <feOffset dx="2" dy="2" result="offsetblur" />
    <feMerge>
      <feMergeNode in="offsetblur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</svg>
```

### Why Defer?

**Reasons to defer SVG filter references:**

1. **Complexity:** SVG filters are a full sub-language with 17+ primitives (feGaussianBlur, feColorMatrix, feComposite, etc.)
2. **Rare usage:** 95%+ of filter usage is built-in functions, not SVG references
3. **External dependency:** Requires SVG filter to exist in DOM or external file
4. **Not composable:** Can't parse/transform SVG filter definitions (out of scope)

**What we DO support:**

- Parse `url()` function (already exists in `@b/parsers/url.ts`)
- Include `url()` in filter list grammar

**What we DON'T support (yet):**

- Validation that referenced filter exists
- Parsing SVG filter definitions
- Transform/manipulation of SVG filters

### Implementation Strategy

**Phase 1 (Current):** Block SVG filter references

```typescript
// In parseFilterList()
if (node.type === "Url") {
  return parseErr("filter", createError("unsupported-kind", "url() filters not yet supported"));
}
```

**Phase 2 (Future):** Pass-through support

```typescript
// In parseFilterList()
if (node.type === "Url") {
  const urlResult = parseUrlFromNode(node);
  if (!urlResult.ok) return urlResult;

  filters.push({
    kind: "url-reference",
    url: urlResult.value,
  });
}
```

**Phase 3 (Far Future):** Full SVG filter support

- Parse SVG filter definitions
- Validate filter element structure
- Generate SVG filters back to markup

### Grammar Impact

**Current spec:**

```
<filter-value-list> = [ <filter-function> | <url> ]+
```

**Our Phase 1:**

```
<filter-value-list> = <filter-function>+   // url() blocked
```

**Our Phase 2:**

```
<filter-value-list> = [ <filter-function> | <url> ]+   // url() pass-through
```

### Existing Infrastructure

✅ **Already available:**

- `Url` type (`@b/types/url.ts`)
- `parseUrlFromNode()` (`@b/parsers/url.ts`)
- URL generation pattern (see `Image.generate()` in `@b/generators/image/image.ts`)

```typescript
// Image generator already handles url()
case "url":
  return generateOk(`url(${layer.url})`);
```

**When we're ready to add Phase 2:**

1. Add `UrlReference` type to filter function union
2. Handle `Url` nodes in `parseFilterList()`
3. Add url case to filter generator
4. ~30 minutes of work

### Examples

**What works today:**

```css
filter: blur(5px);
filter: brightness(1.2) contrast(1.1);
filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
```

**What we reject (Phase 1):**

```css
filter: url(#my-filter); /* Blocked */
filter: url(filters.svg#blur); /* Blocked */
filter: url(#custom) blur(5px); /* Blocked */
```

**What we'll support (Phase 2):**

```css
filter: url(#my-filter); /* Pass-through */
filter: url(filters.svg#blur); /* Pass-through */
filter: url(#custom) blur(5px); /* Mixed list */
```

### Decision Rationale

**For MVP (music visualization platform):**

- Built-in filter functions cover 99% of use cases
- blur, brightness, hue-rotate = core effects
- SVG filters = advanced/niche use case

**Deferred = pragmatic:** Ship 10 useful filter functions now, add SVG references later when needed.

---

**Updated estimate:** 2 hours (unchanged - no SVG support needed)
