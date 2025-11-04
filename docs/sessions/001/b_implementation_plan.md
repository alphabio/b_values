# b_values Implementation Plan

## Clear Boundaries Confirmed ✅

### b_values Scope
- **Parse CSS → IR** (longhand properties only)
- **Generate IR → CSS**
- **Pure data transformation** (no state, no commands)
- **Result type**: `{ ok: boolean, data?: T, issues: Issue[] }`

### Deferred to Other Libs
- **Shorthand expansion**: b_short handles this
- **Computed values**: Not our problem (runtime/browser)
- **State/commands**: b_style handles this

### Shorthand Handling Decision
**Option**: Parse shorthand → auto-expand via b_short → parse longhands
- Seamless for users
- Keep b_values focused on longhands
- b_short is the expansion engine

---

## Phase 1: Clean Up Template

### Remove Unused Packages
```bash
rm -rf packages/b_store
rm -rf packages/b_server  
rm -rf packages/b_components
rm -rf packages/ui
rm -rf packages/tailwind-config
```

### Keep
- `packages/typescript-config/` - Needed for all packages
- `apps/basic/` - Will become our playground/test app

---

## Phase 2: Choose Pilot Property

### Criteria
- ❌ Too simple: `color: red` (single value)
- ❌ Too complex: `background` (shorthand)
- ✅ Just right: **Multi-value, diverse types, real-world usage**

### Candidates

#### Option 1: `background-image` ⭐️ RECOMMENDED
```css
background-image: 
  linear-gradient(30deg, #445 12%, transparent 12.5%),
  radial-gradient(circle, red, blue),
  url("pattern.png"),
  none;
```

**Why perfect:**
- Multi-value (comma-separated) ✅
- Multiple value types (gradient, url, keyword) ✅
- Already exists in b_value (gradients) ✅
- Real use case from your example ✅
- Not too complex ✅

**Value types needed:**
- Gradient (linear, radial, conic) - EXISTS in b_value
- URL - EXISTS in b_value
- Keywords: `none` - Simple

#### Option 2: `box-shadow`
```css
box-shadow: 
  0 4px 6px rgba(0,0,0,0.1),
  0 1px 3px rgba(0,0,0,0.08),
  inset 0 0 0 1px rgba(0,0,0,0.05);
```

**Why good:**
- Multi-value ✅
- Mix of lengths, colors, keywords ✅
- Exists in b_value ✅

**Why not as good:**
- Less diverse value types than background-image
- No URL or gradient complexity

#### Option 3: `transform`
```css
transform: translateX(10px) rotate(45deg) scale(1.5);
```

**Why good:**
- Multiple functions ✅
- Space-separated ✅
- Complex value types ✅

**Why not:**
- Space-separated vs comma-separated (different parsing)
- Very complex (many function types)

### Winner: `background-image` 🏆

---

## Phase 3: Implementation Roadmap

### Step 1: Create Package Structure
```
packages/
├── b_keywords/          # Port from b_value/src/core/keywords
├── b_types/             # Port from b_value/src/core/types  
├── b_units/             # Port from b_value/src/core/units
├── b_parsers/           # Port from b_value/src/parse
├── b_generators/        # Port from b_value/src/generate
├── b_properties/        # NEW - Property schemas
└── b_values/            # NEW - Main export (umbrella)
```

### Step 2: Implement `background-image` Full Stack

#### 2.1 Value Level (Port from b_value)
```ts
// packages/b_parsers/src/gradient/linear.ts
export function parse(css: string): ParseResult<LinearGradientIR>

// packages/b_generators/src/gradient/linear.ts  
export function generate(ir: LinearGradientIR): GenerateResult<string>
```

#### 2.2 Property Level (NEW)
```ts
// packages/b_properties/src/background-image/schema.ts
export const backgroundImageValueSchema = z.discriminatedUnion("kind", [
  linearGradientSchema,
  radialGradientSchema,
  conicGradientSchema,
  urlSchema,
  z.object({ kind: z.literal("none") })
])

export const backgroundImagePropertySchema = z.object({
  property: z.literal("background-image"),
  value: z.array(backgroundImageValueSchema),
  important: z.boolean().optional()
})

// packages/b_properties/src/background-image/parse.ts
export function parse(css: string): ParseResult<BackgroundImageProperty>
// Input: "background-image: gradient(...), url(...), none"
// Output: { property: "background-image", value: [GradientIR, UrlIR, NoneIR] }

// packages/b_properties/src/background-image/generate.ts
export function generate(ir: BackgroundImageProperty): GenerateResult<string>
```

#### 2.3 Declaration Level (NEW)
```ts
// packages/b_properties/src/declaration/parse.ts
export function parse(css: string): ParseResult<PropertyDeclaration>
// Input: "background-image: gradient(...), url(...)"
// Parse property name, then delegate to property-specific parser
```

#### 2.4 Declaration Block Level (NEW)
```ts
// packages/b_properties/src/declaration-block/parse.ts
export function parse(css: string): ParseResult<DeclarationBlock>
// Input: "background-image: ...; background-color: #556; background-size: 80px 140px;"
// Output: Map<PropertyName, PropertyIR>

// packages/b_properties/src/declaration-block/generate.ts
export function generate(block: DeclarationBlock): GenerateResult<string>
```

#### 2.5 Stylesheet Level (NEW - TBD after testing)
```ts
// packages/b_properties/src/stylesheet/parse.ts
export function parse(css: string): ParseResult<StylesheetIR>
// Input: ".class { background-image: ...; } #id { color: red; }"
// Output: { rules: [{ selector: ".class", declarations: {...} }] }

// Question: Do we need this or should b_style handle selector parsing?
```

---

## Phase 4: Testing Strategy

### Use `apps/basic` as Playground
```tsx
// apps/basic/src/routes/index.tsx
import { Parse, Generate } from "@b/values"

function BackgroundImageDemo() {
  const css = `background-image: 
    linear-gradient(30deg, #445 12%, transparent 12.5%),
    radial-gradient(circle, red, blue),
    url("pattern.png")`;
  
  const parsed = Parse.Property.parse(css)
  
  if (parsed.ok) {
    const generated = Generate.Property.generate(parsed.data)
    // Test round-trip: generated === css (normalized)
  }
}
```

---

## Success Criteria

After implementing `background-image` fully, we should have:

1. ✅ **Clear package boundaries** (keywords/types/units/parsers/generators/properties)
2. ✅ **Working patterns** for all 4 context levels
3. ✅ **Result type** with issues array
4. ✅ **Round-trip tests** (parse → generate → parse)
5. ✅ **Type safety** (Zod schemas, TypeScript)
6. ✅ **Clear API** that b_style can consume

### Then Scale
Once `background-image` is working, we can:
- Add more properties (background-color, background-size, etc.)
- Identify shared patterns
- Build property registry system
- Add shorthand integration (via b_short)

---

## Next Steps

1. ✅ **Confirm approach** (this doc)
2. **Clean up template** (remove unused packages)
3. **Explore b_value deeply** (understand all patterns before porting)
4. **Create package structure** 
5. **Implement background-image** (value → property → declaration → block → sheet?)
6. **Test in playground app**
7. **Iterate on stylesheet level** (do we need it?)

