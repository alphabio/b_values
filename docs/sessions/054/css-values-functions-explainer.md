# CSS Values and Functions Explained

**Date:** 2025-11-07
**Goal:** Understand CSS value types and how functions work in our system

---

## 🎯 What is a CSS Value?

In CSS, every property accepts certain types of values:

```css
color: red;                    /* keyword */
width: 100px;                  /* length */
opacity: 0.5;                  /* number */
transform: rotate(45deg);      /* function */
background: url(img.png);      /* function with url */
font-size: calc(100% + 2px);   /* math function */
```

**Our job:** Parse these values into IR, then generate them back to CSS.

---

## 📦 Value Categories

### 1. Simple Values
**What:** Direct values - no functions, no complex syntax.

```css
color: red;           /* Named color */
width: 100px;         /* Dimension (number + unit) */
opacity: 0.5;         /* Number */
display: block;       /* Keyword */
```

**How we handle:**
```typescript
// Direct AST node parsing
if (Ast.isIdentifier(node, "red")) {
  return parseOk({ kind: "named", value: "red" });
}

if (Ast.isDimension(node)) {
  return parseOk({ value: node.value, unit: node.unit });
}
```

### 2. Functions
**What:** Values that use function notation `name(args)`.

```css
/* Color functions */
rgb(255, 0, 0)
hsl(120, 100%, 50%)
oklch(0.5 0.2 180)

/* Transform functions */
rotate(45deg)
translate(10px, 20px)
scale(1.5)

/* Math functions */
calc(100% - 20px)
min(50vw, 500px)
max(100px, 10%)

/* Special functions */
url(image.png)
var(--custom-prop)
```

**How we handle:**
```typescript
// Function dispatcher pattern
if (Ast.isFunctionNode(node)) {
  const funcName = node.name.toLowerCase();
  
  switch (funcName) {
    case "rgb": return Parsers.Color.parseRgbFromNode(node);
    case "calc": return Parsers.Math.parseCalcFromNode(node);
    case "url": return Parsers.Url.parseUrlFromNode(node);
    // ... etc
  }
}
```

### 3. Gradients (Special Functions)
**What:** Complex functions with multiple layers and color stops.

```css
linear-gradient(to right, red, blue)
radial-gradient(circle at center, red 0%, blue 100%)
conic-gradient(from 45deg, red, yellow, green)
```

**Why special:** They have their own sub-syntax (positions, angles, color stops).

**How we handle:**
```typescript
if (funcName.includes("gradient")) {
  return Parsers.Gradient.parseFromNode(node);
}
```

---

## 🔍 Function Anatomy

### Basic Function Structure
```css
function-name(arg1, arg2, arg3)
     ↓          ↓    ↓    ↓
   name      arguments (comma-separated)
```

**In css-tree AST:**
```typescript
{
  type: "Function",
  name: "rgb",              // Function name
  children: List<CssNode>   // Arguments as AST nodes
}
```

### Parsing Functions

**Pattern 1: Parse from AST node**
```typescript
function parseRgbFromNode(node: csstree.FunctionNode): ParseResult<ColorIR> {
  // Extract children
  const children = Ast.nodeListToArray(node.children);
  
  // Parse each argument
  const r = parseNumber(children[0]);
  const g = parseNumber(children[1]);
  const b = parseNumber(children[2]);
  
  // Validate and return
  return parseOk({
    kind: "rgb",
    r: r.value,
    g: g.value,
    b: b.value
  });
}
```

**Pattern 2: Parse from string (for complex syntax)**
```typescript
function parseCalc(value: string): ParseResult<MathIR> {
  // Use css-tree to parse the full expression
  const ast = csstree.parse(value, { context: "value" });
  
  // Process AST...
  return parseOk({ kind: "calc", expression: ... });
}
```

---

## 🎨 Real Examples from Our Codebase

### Example 1: Color Functions
```typescript
// From @b/parsers/color
Parsers.Color.parseFromNode(node)

// Handles:
// - rgb(255, 0, 0)
// - hsl(120, 100%, 50%)
// - oklch(0.5 0.2 180)
// - color(srgb 1 0 0)
```

### Example 2: Gradient Functions
```typescript
// From @b/parsers/gradient
Parsers.Gradient.parseFromNode(node)

// Handles:
// - linear-gradient(...)
// - radial-gradient(...)
// - conic-gradient(...)
// - repeating-* variants
```

### Example 3: URL Function
```typescript
// From @b/parsers/url
Parsers.Url.parseUrlFromNode(node)

// Handles:
// - url(image.png)
// - url("image.png")
// - url('image.png')
```

### Example 4: Math Functions
```typescript
// From @b/parsers/math
Parsers.Math.parseCalcFromNode(node)
Parsers.Math.parseMinMaxFromNode(node)

// Handles:
// - calc(100% - 20px)
// - min(50vw, 500px)
// - max(100px, 10%)
// - clamp(10px, 5vw, 50px)
```

---

## 🔧 How Functions Fit Into Properties

### Single-Value Property
```css
color: rgb(255, 0, 0);
```

**Flow:**
1. Property parser receives AST node for the value
2. Detects it's a function node
3. Dispatches to color function parser
4. Returns color IR
5. Property wraps it: `{ kind: "color", value: colorIR }`

### Multi-Value Property
```css
background-image: url(a.png), linear-gradient(...);
```

**Flow:**
1. Property parser receives string (multiValue: true)
2. Uses `createMultiValueParser` to split by commas
3. For each layer:
   - Parse AST node
   - Detect function type
   - Dispatch to appropriate parser
4. Aggregate layers into final IR

---

## 📊 Function Dispatch Pattern

**This is how background-image handles different function types:**

```typescript
const firstNode = children[0];

// URL function
if (firstNode.type === "Url") {
  // css-tree parses url() specially
  return parseOk({ kind: "url", url: firstNode.value });
}

if (Ast.isFunctionNode(firstNode, "url")) {
  const urlResult = Parsers.Url.parseUrlFromNode(firstNode);
  if (urlResult.ok) return parseOk({ kind: "url", url: urlResult.value.value });
  return forwardParseErr<ImageLayer>(urlResult);
}

// Gradient functions
if (Ast.isFunctionNode(firstNode)) {
  const funcName = firstNode.name.toLowerCase();
  
  if (funcName.includes("gradient")) {
    const gradientResult = Parsers.Gradient.parseFromNode(firstNode);
    if (gradientResult.ok) return parseOk({ kind: "gradient", gradient: gradientResult.value });
    return forwardParseErr<ImageLayer>(gradientResult);
  }
}
```

**Key insight:** Check node type → dispatch to specialized parser → forward errors.

---

## 🎯 Key Takeaways

### For Simple Values
- Use AST type guards: `Ast.isIdentifier()`, `Ast.isDimension()`
- Direct parsing, no function dispatch needed

### For Functions
- Check: `Ast.isFunctionNode(node, "name")`
- Dispatch to specialized parser: `Parsers.Color.*`, `Parsers.Gradient.*`
- Forward errors: `forwardParseErr<T>(result)`

### For Multi-Value Properties
- Use `createMultiValueParser` factory
- Handle each item independently
- Aggregate results

### Always Handle
- CSS-wide keywords: `inherit`, `initial`, `unset`, `revert`
- Type narrowing with type guards
- Error forwarding when chaining parsers

---

## 🧩 How They Connect

```
Property (background-image)
    ↓
  Parser receives: "url(a.png), linear-gradient(...)"
    ↓
  createMultiValueParser splits by comma
    ↓
  Item 1: url(a.png)
    ↓
    Detect: Function node "url"
    ↓
    Dispatch: Parsers.Url.parseUrlFromNode()
    ↓
    Return: { kind: "url", url: "a.png" }
    
  Item 2: linear-gradient(...)
    ↓
    Detect: Function node "linear-gradient"
    ↓
    Dispatch: Parsers.Gradient.parseFromNode()
    ↓
    Return: { kind: "gradient", gradient: { ... } }
    
    ↓
  Aggregate: { kind: "layers", layers: [url, gradient] }
```

---

## 💡 Mental Model

**Think of it as nested parsers:**

1. **Property parser** - Top level, handles property-specific logic
2. **Value type dispatcher** - Identifies what kind of value (function vs simple)
3. **Function parser** - Parses specific function syntax
4. **Sub-value parser** - Parses components (colors, lengths, angles)

**Each level:**
- Validates its domain
- Returns structured IR
- Forwards errors up the chain

**This composition is how we handle CSS's complexity while keeping each piece simple.**

---

**This is the foundation for understanding how to add any CSS property.** 🚀
