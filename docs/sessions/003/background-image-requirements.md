# background-image Requirements

**Date:** 2025-11-04  
**Session:** 003  
**Status:** Ready for Session 004

---

## 🎯 Goal

Implement **end-to-end `background-image` property** parsing and generation.

This establishes patterns for ALL CSS properties to follow.

---

## 📐 What background-image Supports

```css
background-image:
  linear-gradient(30deg, #445 12%, transparent 12.5%), radial-gradient(circle, red, blue),
  conic-gradient(from 45deg, red, blue), url("pattern.png"), none;
```

**Value types:**

1. **Linear gradient** - `linear-gradient()`, `repeating-linear-gradient()`
2. **Radial gradient** - `radial-gradient()`, `repeating-radial-gradient()`
3. **Conic gradient** - `conic-gradient()`, `repeating-conic-gradient()`
4. **URL** - `url("...")`, `url('...')`, `url(...)`
5. **Keyword** - `none`

---

## 🔍 Dependency Analysis (from b_value POC)

### **Direct Dependencies**

**background-image parser uses:**

- ✅ Result system (already ported)
- Gradient parsers (linear, radial, conic)
- URL parser
- `none` keyword
- css-tree (external library)

### **Gradient Dependencies (Recursive)**

Each gradient needs:

1. **Color stops** (2+ required)
   - Color value (hex, rgb, hsl, named, etc.)
   - Optional position (length or percentage)

2. **Direction/Position** (optional)
   - Linear: angle (`45deg`) OR side/corner keywords (`to top`, `to bottom left`)
   - Radial: shape (`circle`, `ellipse`) + size + position
   - Conic: angle (`from 45deg`) + position

3. **Color interpolation** (optional)
   - `in srgb`, `in oklch`, `in lab`, etc.

4. **Repeating flag**

---

## 📦 What We Need to Port

### **Phase 1: Foundation Types** → `b_types`

#### 1. Length/Angle Types (Zod schemas)

```typescript
// Length: 10px, 2rem, 50%, etc.
export const lengthSchema = z.object({
  value: z.number(),
  unit: z.enum(["px", "rem", "em", "%", "vh", "vw", ...])
});

// Angle: 45deg, 0.5turn, 1rad, etc.
export const angleSchema = z.object({
  value: z.number(),
  unit: z.enum(["deg", "rad", "grad", "turn"])
});
```

#### 2. Color Types (Zod schemas)

```typescript
// Hex: #fff, #ff0000, #ff000080
export const hexColorSchema = z.object({
  kind: z.literal("hex"),
  value: z.string().regex(/^#[0-9A-F]{6}([0-9A-F]{2})?$/)
});

// Named: red, blue, transparent, currentColor
export const namedColorSchema = z.object({
  kind: z.literal("named"),
  name: z.enum([...]) // from keywords
});

// RGB: rgb(255, 0, 0), rgba(255, 0, 0, 0.5)
// HSL: hsl(0, 100%, 50%)
// etc.
```

#### 3. Color Stop Type (Zod schema)

```typescript
export const colorStopSchema = z.object({
  color: colorSchema, // union of all color types
  position: lengthOrPercentageSchema.optional(),
});

export const colorStopListSchema = z.array(colorStopSchema).min(2);
```

#### 4. Gradient Types (Zod schemas)

```typescript
// Linear gradient
export const linearGradientSchema = z.object({
  kind: z.literal("linear"),
  direction: gradientDirectionSchema.optional(),
  colorSpace: colorInterpolationSchema.optional(),
  colorStops: colorStopListSchema,
  repeating: z.boolean(),
});

// Radial gradient
export const radialGradientSchema = z.object({
  kind: z.literal("radial"),
  shape: z.enum(["circle", "ellipse"]).optional(),
  size: radialGradientSizeSchema.optional(),
  position: positionSchema.optional(),
  colorSpace: colorInterpolationSchema.optional(),
  colorStops: colorStopListSchema,
  repeating: z.boolean(),
});

// Conic gradient
export const conicGradientSchema = z.object({
  kind: z.literal("conic"),
  angle: angleSchema.optional(),
  position: positionSchema.optional(),
  colorSpace: colorInterpolationSchema.optional(),
  colorStops: colorStopListSchema,
  repeating: z.boolean(),
});

// Union
export type Gradient = LinearGradient | RadialGradient | ConicGradient;
```

#### 5. URL Type (Zod schema)

```typescript
export const urlSchema = z.object({
  kind: z.literal("url"),
  url: z.string(),
});
```

---

### **Phase 2: Keywords** → `b_keywords`

#### Required Keywords (Zod enums)

1. **Color names**

   ```typescript
   export const namedColorSchema = z.enum([
     "red",
     "blue",
     "green",
     "transparent",
     "currentColor",
     // ... ~150 total CSS color names
   ]);
   ```

2. **Gradient direction keywords**

   ```typescript
   export const gradientSideSchema = z.enum(["top", "bottom", "left", "right"]);

   export const gradientCornerSchema = z.enum(["top left", "top right", "bottom left", "bottom right"]);
   ```

3. **Color interpolation methods**

   ```typescript
   export const colorInterpolationSchema = z.enum([
     "srgb", "srgb-linear", "lab", "oklab", "xyz", "oklch", "lch", ...
   ]);
   ```

4. **Radial gradient size keywords**

   ```typescript
   export const radialSizeKeywordSchema = z.enum([
     "closest-side",
     "closest-corner",
     "farthest-side",
     "farthest-corner",
   ]);
   ```

---

### **Phase 3: Units** → `b_units`

Unit definitions and validation:

```typescript
// Length units
export const lengthUnits = [
  // Absolute
  "px",
  "cm",
  "mm",
  "in",
  "pt",
  "pc",
  // Font-relative
  "em",
  "rem",
  "ex",
  "ch",
  "lh",
  "rlh",
  // Viewport-relative
  "vw",
  "vh",
  "vmin",
  "vmax",
  "vi",
  "vb",
  // Percentage
  "%",
] as const;

// Angle units
export const angleUnits = ["deg", "grad", "rad", "turn"] as const;
```

---

### **Phase 4: Parsers** → `b_parsers`

CSS string → IR conversion:

1. **Color parsers**
   - `parseHexColor("#ff0000")` → `HexColor`
   - `parseNamedColor("red")` → `NamedColor`
   - `parseRgbColor("rgb(255, 0, 0)")` → `RGBColor`
   - Auto-detect wrapper: `parseColor(css)`

2. **Gradient parsers**
   - `parseLinearGradient(css)` → `LinearGradient`
   - `parseRadialGradient(css)` → `RadialGradient`
   - `parseConicGradient(css)` → `ConicGradient`
   - Auto-detect wrapper: `parseGradient(css)`

3. **URL parser**
   - `parseURL('url("bg.png")')` → `{ kind: "url", url: "bg.png" }`

4. **Background-image parser**
   - `parseBackgroundImage(css)` → `BackgroundImageLayer[]`

**All parsers return:** `ParseResult<T>` (from Result system ✅)

---

### **Phase 5: Generators** → `b_generators`

IR → CSS string conversion:

1. **Color generators**
   - `generateHexColor(ir)` → `"#ff0000"`
   - `generateNamedColor(ir)` → `"red"`
   - `generateRgbColor(ir)` → `"rgb(255, 0, 0)"`

2. **Gradient generators**
   - `generateLinearGradient(ir)` → `"linear-gradient(...)"`
   - `generateRadialGradient(ir)` → `"radial-gradient(...)"`
   - `generateConicGradient(ir)` → `"conic-gradient(...)"`

3. **URL generator**
   - `generateURL(ir)` → `'url("bg.png")'`

4. **Background-image generator**
   - `generateBackgroundImage(layers)` → `"linear-gradient(...), url(...), none"`

**All generators return:** `GenerateResult` (from Result system ✅)

---

### **Phase 6: Property** → `b_properties`

Property-level schema and parsing:

```typescript
// Property schema
export const backgroundImagePropertySchema = z.object({
  property: z.literal("background-image"),
  value: z.array(
    z.union([
      linearGradientSchema,
      radialGradientSchema,
      conicGradientSchema,
      urlSchema,
      z.object({ kind: z.literal("none") }),
    ])
  ),
  important: z.boolean().optional(),
});

// Property parser
export function parseBackgroundImageProperty(css: string): ParseResult<BackgroundImageProperty>;

// Property generator
export function generateBackgroundImageProperty(ir: BackgroundImageProperty): GenerateResult;
```

---

## 🚫 What We're NOT Porting (For Now)

From b_value POC, skip these unless needed:

- ❌ HSL colors (can add later)
- ❌ Lab/Oklch colors (can add later)
- ❌ CSS Color Module 4 features (can add later)
- ❌ Transform functions (different property)
- ❌ Filter functions (different property)
- ❌ Box shadow (different property)
- ❌ Text shadow (different property)

**Focus:** Only what `background-image` needs.

---

## 📊 Estimated Scope

### File Count (approximate)

- Keywords: 3-5 files
- Units: 2-3 files
- Types: 15-20 files (colors, gradients, positions)
- Parsers: 15-20 files
- Generators: 15-20 files
- Properties: 3-5 files (background-image)

**Total:** ~50-70 files

### Test Count (approximate)

- Each module: 10-30 tests
- **Total estimate:** 500-1000 tests

### Implementation Time (approximate)

- Keywords: 1 session
- Units: 1 session
- Types: 2-3 sessions
- Parsers: 3-4 sessions
- Generators: 2-3 sessions
- Properties: 1-2 sessions

**Total:** 10-14 sessions

---

## ✅ Success Criteria

1. ✅ **Parse complex background-image**

   ```typescript
   const css = `linear-gradient(30deg, #445 12%, transparent 12.5%), 
                radial-gradient(circle, red, blue), 
                url("pattern.png")`;
   const result = parseBackgroundImageProperty(css);
   // result.ok === true
   ```

2. ✅ **Generate back to CSS**

   ```typescript
   const generated = generateBackgroundImageProperty(result.value);
   // Round-trip: parse(generate(parse(css))) === parse(css)
   ```

3. ✅ **Handle errors gracefully**

   ```typescript
   const bad = parseBackgroundImageProperty("invalid syntax!");
   // bad.ok === false, bad.issues contains helpful error
   ```

4. ✅ **Work in playground app**
   - Visual demo in `apps/basic`
   - Input CSS → see parsed IR
   - Modify IR → see generated CSS

---

## 🗓️ Next Session (004)

**Start with:** Port Keywords → `b_keywords`

**Why first:**

- Smallest scope
- No dependencies (except Zod)
- Needed by everything else
- Establishes patterns

---

**Status:** Requirements documented. Ready for Session 004.
