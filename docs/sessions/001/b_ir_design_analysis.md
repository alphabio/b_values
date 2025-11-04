# b_values IR Design Analysis

## The Core Tension

**b_values mission**: Provide CSS ↔ IR for **values**
**b_style needs**: Full stylesheet editing with commands/updates

**Problem**: Where does b_values end and b_style begin?

## Three Levels of Abstraction

### Level 1: Value IR (b_value current state)

```ts
// Pure value representation
type GradientIR = {
  kind: "radial";
  shape?: "circle" | "ellipse";
  colorStops: ColorStop[];
  // ...
};

Parse.Gradient.parse("radial-gradient(red, blue)");
// → GradientIR
```

**Scope**: Individual CSS values only
**Use case**: Parse/generate one value at a time
**Limitation**: No property context

---

### Level 2: Property IR (what b_style needs?)

```ts
// Property + values
type PropertyIR = {
  property: "background-image";
  values: GradientIR[]; // Array for comma-separated
};

Parse.Property.parse("background-image: gradient(...), gradient(...)");
// → PropertyIR
```

**Scope**: Property name + typed values
**Use case**: Parse/generate one declaration
**Limitation**: No relationship between properties

---

### Level 3: Declaration Block IR (stylesheet level)

```ts
// Full declaration block
type DeclarationBlockIR = {
  "background-color": ColorIR;
  "background-image": GradientIR[];
  "background-size": SizeIR[];
  // ...
};

Parse.DeclarationList.parse(`
  background-color: #556;
  background-image: gradient(...);
`);
// → DeclarationBlockIR
```

**Scope**: Multiple related properties
**Use case**: Parse/generate declaration blocks
**This is where it gets fuzzy**: Do we include updates/commands?

---

## The Command Architecture Question

If we add:

```ts
// Update API (command pattern)
update(ir, {
  type: "SET_PROPERTY",
  property: "background-color",
  value: newColorIR,
});
```

**We've crossed into b_style territory** (state management, editor logic)

---

## Proposal: Keep b_values Pure (Data Transformation)

### b_values Responsibilities ✅

1. **Value parsing**: CSS string → Typed IR
2. **Value generation**: Typed IR → CSS string
3. **Property schemas**: Define what values a property accepts
4. **Multi-value handling**: Arrays, comma/space separation
5. **Validation**: Zod schemas, type safety

### NOT b_values Responsibilities ❌

1. ❌ State management
2. ❌ Update commands/actions
3. ❌ Undo/redo
4. ❌ Editor logic
5. ❌ Cascading/inheritance
6. ❌ Specificity
7. ❌ Style application

---

## Recommended IR Design

### Core Principle

**b_values provides data structures, b_style provides behavior**

### Three IR Levels (all in b_values)

#### 1. Value IR (existing)

```ts
type ColorIR =
  | { kind: "hex"; r: number; g: number; b: number }
  | { kind: "named"; name: string };
// ...

type GradientIR = {
  kind: "radial";
  colorStops: ColorStop[];
  // ...
};

type LengthIR = {
  value: number;
  unit: "px" | "em" | "%";
};
```

#### 2. Property Value IR (NEW)

```ts
// Generic wrapper for any property value
type PropertyValue<T> = {
  property: CSSPropertyName;
  value: T | T[]; // Single or array
  important?: boolean;
};

// Typed versions
type BackgroundImageValue = PropertyValue<GradientIR | ImageIR | "none">;
type ColorValue = PropertyValue<ColorIR>;

// Usage
const bgImage: BackgroundImageValue = {
  property: "background-image",
  value: [gradient1, gradient2], // Array of gradients
  important: false,
};
```

#### 3. Declaration Block IR (NEW)

```ts
// Map of property names to their values
type DeclarationBlock = Map<CSSPropertyName, PropertyValueIR>;

// Or as object (with type safety)
type TypedDeclarationBlock = {
  "background-color"?: ColorValue;
  "background-image"?: BackgroundImageValue;
  "background-size"?: SizeValue;
  // ... all CSS properties
};
```

---

## API Design (Pure Functions)

```ts
// ============================================
// VALUE LEVEL (existing from b_value)
// ============================================

Parse.Color.parse("#ff0000");
// → Result<ColorIR>

Generate.Color.generate(colorIR);
// → string

// ============================================
// PROPERTY LEVEL (NEW)
// ============================================

Parse.Property.parse("background-image: gradient(...), gradient(...)");
// → Result<PropertyValue<GradientIR[]>>

Generate.Property.generate({
  property: "background-image",
  value: [gradient1, gradient2],
});
// → "background-image: linear-gradient(...), radial-gradient(...)"

// ============================================
// DECLARATION BLOCK LEVEL (NEW)
// ============================================

Parse.DeclarationBlock.parse(`
  background-color: #556;
  background-image: gradient(...), gradient(...);
  background-size: 80px 140px;
`);
// → Result<DeclarationBlock>

Generate.DeclarationBlock.generate(declarationBlock);
// → "background-color: #556;\nbackground-image: ...;\n..."

// ============================================
// STYLESHEET LEVEL (optional, just parsing)
// ============================================

Parse.Stylesheet.parse(`
  .class1 { color: red; }
  #id1 { background: blue; }
`);
// → Result<StylesheetIR>  // Rules + selectors + declarations
```

---

## What b_style Builds on Top

```ts
// b_style uses b_values IR but adds:

// 1. State management
const [styles, setStyles] = useState<DeclarationBlock>();

// 2. Update operations
function updateProperty(property: string, value: any) {
  const newBlock = new Map(styles);
  newBlock.set(property, { property, value });
  setStyles(newBlock);
}

// 3. Undo/redo
const history = useHistory(styles);

// 4. Validation + UI
const isValid = validateProperty(property, value);

// 5. Persistence
await saveStyles(projectId, styles);
```

---

## Concrete Example: Your Use Case

### Input CSS

```css
div#el1 {
  background-color: #556;
  background-image: linear-gradient(...), linear-gradient(...);
  background-size: 80px 140px;
  background-position: 0 0, 0 0, 40px 70px;
}
```

### b_values Parses to IR

```ts
const declarationBlock: DeclarationBlock = new Map([
  ["background-color", {
    property: "background-color",
    value: { kind: "hex", r: 0x55, g: 0x55, b: 0x66 }
  }],
  ["background-image", {
    property: "background-image",
    value: [
      { kind: "linear", colorStops: [...] },
      { kind: "linear", colorStops: [...] },
      // ... 6 gradients total
    ]
  }],
  ["background-size", {
    property: "background-size",
    value: [
      { kind: "length", value: 80, unit: "px" },
      { kind: "length", value: 140, unit: "px" }
    ]
  }],
  ["background-position", {
    property: "background-position",
    value: [
      { horizontal: { value: 0, unit: "px" }, vertical: { value: 0, unit: "px" } },
      // ... 6 positions
    ]
  }]
])
```

### b_style Uses It

```ts
// Load styles into editor
const ir = Parse.DeclarationBlock.parse(cssString);
const [editableStyles, setEditableStyles] = useState(ir.data);

// User edits gradient #3
const updatedGradients = [...editableStyles.get("background-image")!.value];
updatedGradients[2] = newGradientIR;

setEditableStyles((prev) => {
  const next = new Map(prev);
  next.set("background-image", {
    property: "background-image",
    value: updatedGradients,
  });
  return next;
});

// Generate back to CSS
const newCSS = Generate.DeclarationBlock.generate(editableStyles);
```

---

## Decision Matrix

| Concern               | b_values | b_style |
| --------------------- | -------- | ------- |
| Parse CSS → IR        | ✅ Yes   | ❌ No   |
| Generate IR → CSS     | ✅ Yes   | ❌ No   |
| Define IR schemas     | ✅ Yes   | ❌ No   |
| Validate IR           | ✅ Yes   | ❌ No   |
| State management      | ❌ No    | ✅ Yes  |
| Update commands       | ❌ No    | ✅ Yes  |
| Undo/redo             | ❌ No    | ✅ Yes  |
| UI components         | ❌ No    | ✅ Yes  |
| Persistence           | ❌ No    | ✅ Yes  |
| Cascading/inheritance | ❌ No    | ✅ Yes  |

---

## Recommendation

### b_values Scope

1. **Parse CSS to IR** (all levels: value, property, declaration block, stylesheet)
2. **Generate IR to CSS** (bidirectional)
3. **Type-safe schemas** (Zod)
4. **Validation** (via Zod)
5. **Pure functions only** (no state, no side effects)

### IR Design

```ts
// Three levels, all data structures:
1. ValueIR        // ColorIR, GradientIR, LengthIR, etc.
2. PropertyValue  // { property, value, important? }
3. DeclarationBlock // Map<property, PropertyValue>

// Optional fourth level:
4. StylesheetIR   // { rules: RuleIR[] }
   RuleIR         // { selector, declarations: DeclarationBlock }
```

### Answer to "What should IR look like?"

**Layered, composable, and pure data:**

- Bottom layer: Value types (color, length, gradient)
- Middle layer: Property wrappers (property name + values array)
- Top layer: Declaration blocks (map of properties)
- Optional: Stylesheet (rules + selectors)

**No commands, no updates, no state.**
Those are **b_style's responsibility**.

b_values is the **data transformation library**.
b_style is the **application** that uses it.

---

## Open Questions

1. **Shorthand expansion**: Does `background: red` expand to longhands in b_values or b_style?
2. **Computed values**: Does b_values compute `em` to `px`? (Probably not - that's runtime)
3. **Invalid CSS**: Strict or permissive parsing?
4. **Stylesheet level**: Do we include selector parsing or just declarations?
