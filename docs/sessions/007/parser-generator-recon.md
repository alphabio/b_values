# Parser & Generator Architecture Analysis

**Date:** 2025-11-04
**Purpose:** Deep recon of b_value reference implementation to inform b_values architecture

---

## 📁 Structure Overview

### b_value (Reference)

```
src/
├── core/              # Result, types, keywords, units
├── parse/             # CSS → IR parsers
│   ├── color/        # 11 color parsers (~2900 lines)
│   ├── gradient/     # 3 gradient parsers (~1800 lines)
│   ├── position/
│   ├── background/
│   └── ...
├── generate/          # IR → CSS generators
│   ├── color/        # 11 color generators (~1200 lines)
│   ├── gradient/     # 3 gradient generators (~750 lines)
│   └── ...
└── utils/
    ├── parse/        # Shared parsing utilities
    ├── generate/     # Shared generation utilities
    └── ast/          # CSS-tree AST utilities
```

### Key Stats

- **Parsers:** ~6,848 lines (color + gradient)
- **Generators:** ~2,553 lines (color + gradient)
- **Ratio:** ~2.7:1 (parsing is 2.7x more complex than generation)

---

## 🔍 Parser Architecture

### High-Level Pattern

```typescript
// Entry point with auto-detection
export function parse(value: string): ParseResult<Type> {
  const ast = cssTree.parse(value, { context: "value" });
  return parseNode(ast.children.first);
}

// AST node parser (internal)
export function parseNode(node: CssNode): Result<Type, string> {
  // Dispatch based on node type
  if (node.type === "Hash") return parseHex(node);
  if (node.type === "Function") return parseFunction(node);
  if (node.type === "Identifier") return parseKeyword(node);
  return err("Invalid node type");
}
```

### Dependencies

1. **css-tree** - CSS parser/AST
2. **Result system** - Error handling
3. **Type definitions** - IR schemas from `core/types`
4. **Unit/keyword enums** - Validation from `core/units` and `core/keywords`
5. **Shared utilities** - `utils/parse/nodes/*`

### Parsing Utilities (utils/parse/nodes/)

Critical shared parsers that handle common patterns:

#### 1. **angle.ts** (43 lines)

```typescript
parseAngleNode(node: CssNode): Result<Angle, string>
// Handles: deg, rad, grad, turn
// Validates using Unit.ANGLE_UNITS
```

#### 2. **length.ts** (131 lines)

```typescript
parseLengthNode(node: CssNode): Result<Length, string>
parseLengthPercentageNode(node: CssNode): Result<LengthPercentage, string>
parseNumberNode(node: CssNode): Result<number, string>
// Handles: px, em, rem, vh, vw, %, unitless zero
// Validates using Unit arrays
```

#### 3. **position.ts** (203 lines)

```typescript
parsePositionValueNode(node: CssNode): Result<PositionValue, string>
parsePosition2D(nodes: CssNode[], startIdx: number): Result<Position2D, string>
parseAtPosition(nodes: CssNode[], startIdx: number): Result<Position2D?, string>
// Handles: top, left, center, 50%, 100px
// Used by: gradients, clip-path, background-position
```

#### 4. **color-components.ts**

- Parses color function arguments (r, g, b, alpha, etc.)
- Handles modern space-separated and legacy comma-separated syntax

#### 5. **comma-separated.ts**

- Generic comma-separated list parser
- Used for multi-value properties

### Color Parser Pattern

**Example: hex.ts (74 lines)**

```typescript
export function parse(input: string): Result<HexColor, string> {
  // 1. Validate format (#RGB, #RRGGBB, #RGBA, #RRGGBBAA)
  // 2. Normalize short forms (#abc → #AABBCC)
  // 3. Return IR: { kind: "hex", value: "#FF0000" }
}
```

**Example: rgb.ts (220 lines)**

```typescript
export function parse(input: string): Result<RGBColor, string> {
  // 1. Parse AST with css-tree
  // 2. Extract function arguments
  // 3. Parse r, g, b as numbers or percentages
  // 4. Parse optional alpha
  // 5. Handle modern vs legacy syntax
  // 6. Return IR: { kind: "rgb", r: 255, g: 0, b: 0, alpha: 1 }
}
```

**Example: color.ts (133 lines) - Dispatcher**

```typescript
export function parse(value: string): ParseResult<Color> {
  // Auto-detect and route to specific parser
}

export function parseNode(node: CssNode): Result<Color, string> {
  // Type: Hash → Hex parser
  // Type: Function → rgb/hsl/hwb/lab/lch/oklch/oklab/color parser
  // Type: Identifier → named/special/system parser
}
```

### Gradient Parser Pattern

**Complexity:** Higher than color (radial: 466 lines, linear: 329 lines)

**Example: linear.ts structure**

```typescript
// 1. Internal helper: parseDirection()
//    - Handles: angle | "to side" | "to corner"
//    - Returns: GradientDirection IR

// 2. Internal helper: parseColorSpace()
//    - Handles: "in [colorspace] [hue-method]"
//    - Returns: ColorInterpolation IR

// 3. Internal helper: parseColorStops()
//    - Delegates to color-stop.ts
//    - Returns: ColorStop[]

// 4. Main parser: parse()
//    - Combines all helpers
//    - Returns: LinearGradient IR
```

**Key pattern:** Complex parsers use internal helpers for each "clause" of the syntax

---

## 🎨 Generator Architecture

### High-Level Pattern

```typescript
// Simple validation + string building
export function generate(ir: Type): GenerateResult {
  // 1. Validate IR structure (has required fields)
  // 2. Build CSS string from IR data
  // 3. Return GenerateResult
}
```

### Dependencies

1. **Result system** - GenerateResult type
2. **Type definitions** - IR schemas for type checking
3. **Shared utilities** - `utils/generate/values.ts`

### Generation Utilities (utils/generate/)

#### 1. **values.ts** (185 lines)

```typescript
lengthToCss(length: Length): string
lengthPercentageToCss(lp: LengthPercentage): string
angleToCss(angle: Angle): string
positionValueToCss(value: PositionValue): string
numberToCss(num: number): string
joinCssValues(values: string[]): string          // comma-separated
joinCssValuesWithSpaces(values: string[]): string // space-separated
borderRadiusToCss(radius: BorderRadius): string  // smart optimization
```

**Pattern:** Convert IR types to CSS strings with proper units

#### 2. **color.ts**

- Shared color utilities (if any)

#### 3. **validation.ts**

- IR validation helpers
- Field presence checks
- Type guards

### Color Generator Pattern

**Example: hex.ts (40 lines)**

```typescript
export function generate(color: HexColor): GenerateResult {
  // 1. Validate IR (not null, has 'value' field)
  // 2. Return CSS: color.value
  // Simple! Just extract and return
}
```

**Example: rgb.ts (57 lines)**

```typescript
export function generate(color: RGBColor): GenerateResult {
  // 1. Validate IR (has r, g, b fields)
  // 2. Format: "rgb(255 0 0)" or "rgb(255 0 0 / 0.5)"
  // 3. Omit alpha if fully opaque
  // 4. Return CSS string
}
```

**Example: color.ts (93 lines) - Dispatcher**

```typescript
export function generate(color: Color): GenerateResult {
  // Validate has 'kind' field
  // Switch on kind, delegate to specific generator
}
```

### Gradient Generator Pattern

**Simpler than parsers!** (radial: 209 lines vs 466 parser lines)

**Example: linear.ts structure**

```typescript
export function generate(gradient: LinearGradient): GenerateResult {
  // 1. Validate IR structure
  // 2. Build direction string
  // 3. Build color-space string (if present)
  // 4. Build color-stops string (join with ", ")
  // 5. Combine: "linear-gradient(180deg, red, blue)"
  // 6. Handle repeating prefix if needed
}
```

**Key pattern:** String concatenation with optional clauses

---

## 🏗️ Implementation Strategy

### Phase 1: Utilities First ✅ (Foundation)

**Why:** Both parsers and generators depend on shared utilities

**b_values approach:**

- ✅ Types already done (b_types) - 282 tests
- ✅ Keywords already done (b_keywords) - 29 tests
- ✅ Units already done (b_units) - 18 tests
- ✅ Result system ready

**Next:** Create utility packages

### Phase 2: Utilities Package 🎯

**Create:** `packages/b_utils/` (NEW)

**Structure:**

```
b_utils/
├── src/
│   ├── parse/
│   │   ├── angle.ts          # parseAngleNode
│   │   ├── length.ts         # parseLengthNode, parseLengthPercentageNode
│   │   ├── position.ts       # parsePositionValueNode, parsePosition2D
│   │   ├── number.ts         # parseNumberNode
│   │   └── index.ts
│   ├── generate/
│   │   ├── values.ts         # lengthToCss, angleToCss, etc.
│   │   └── index.ts
│   └── index.ts
└── package.json
```

**Dependencies:**

- css-tree (for AST types in parse utilities)
- @b/b_types (for IR types)
- @b/b_units (for unit validation)

**Benefits:**

- Shared by both b_parsers and b_generators
- Single source of truth for common operations
- Reduce code duplication
- Easier to test and maintain

### Phase 3A: Generators First 🎯 (EASIER)

**Why:** Generators are 2.7x simpler than parsers

**Advantages:**

1. **Faster wins** - Get working code quickly
2. **Test harness** - Can use generators to test parsers later
3. **Simpler logic** - String building vs parsing complexity
4. **Learn the types** - Deep understanding of IR structure
5. **Validates types** - Discovers type design issues early

**Order:**

1. ✅ Create b_utils package
2. ✅ Implement generation utilities (values.ts)
3. ✅ Start with simple generators (hex, named)
4. ✅ Move to complex generators (rgb, hsl, gradients)
5. ✅ Test generators with hand-crafted IR

### Phase 3B: Parsers After 🎯

**Why:** Now we have generators to validate parser output!

**Advantages:**

1. **Test generators** - Use generators to verify parser output
2. **Round-trip tests** - parse(CSS) → generate(IR) → CSS
3. **Utility foundation** - Parse utilities already exist
4. **Type knowledge** - Deep understanding from generators

**Order:**

1. ✅ Implement parsing utilities (angle, length, position)
2. ✅ Start with simple parsers (hex, named)
3. ✅ Move to complex parsers (rgb, hsl, gradients)
4. ✅ Add round-trip tests (parse + generate)

---

## 🎯 Package Dependencies (Final)

```
b_keywords ────────────┐
                      │
b_units ──────────────┤
                      │
b_types ──────────────┼─→ b_utils ──┬─→ b_parsers ──┐
                      │              │               │
                      │              └─→ b_generators│
                      │                              │
                      └──────────────────────────────┴─→ b_properties
```

**Dependency order:**

1. b_keywords (no deps)
2. b_units (no deps)
3. b_types (depends on keywords, units)
4. **b_utils** (depends on types, units, keywords, css-tree)
5. b_parsers (depends on utils, types, keywords, units, css-tree)
6. b_generators (depends on utils, types)
7. b_properties (depends on parsers, generators, types)

---

## 📊 Effort Estimation

### b_utils Package

- **parse/** utilities: ~400 lines
- **generate/** utilities: ~200 lines
- Tests: ~300 lines
- **Total:** ~900 lines, **2-3 hours**

### b_generators Package

- Color generators: ~1,200 lines
- Gradient generators: ~750 lines
- Tests: ~800 lines
- **Total:** ~2,750 lines, **6-8 hours**

### b_parsers Package

- Color parsers: ~2,900 lines
- Gradient parsers: ~1,800 lines
- Tests: ~2,000 lines
- **Total:** ~6,700 lines, **12-16 hours**

### Total Effort

- **Utilities:** 2-3 hours
- **Generators:** 6-8 hours
- **Parsers:** 12-16 hours
- **Total:** 20-27 hours (3-4 sessions)

---

## ✅ Decision: Start with b_utils + b_generators

**Rationale:**

1. Build foundation (utils) first
2. Get quick wins (generators are easier)
3. Validate types through generation
4. Use generators to test parsers later
5. Learn IR structure deeply before tackling complex parsing

**Next session plan:**

1. Create b_utils package
2. Port generation utilities
3. Port parsing utilities (subset needed for generators)
4. Begin color generators (hex, named, rgb)

---

## 🔑 Key Insights

### From Parsers

1. **css-tree is essential** - Handles CSS parsing complexity
2. **Auto-detection pattern** - Main `parse()` dispatches to specific parsers
3. **Shared utilities critical** - angle, length, position used everywhere
4. **AST node parsing** - `parseNode()` handles already-parsed AST
5. **Complex syntax needs helpers** - Break down gradient clauses

### From Generators

1. **Validation first** - Check IR structure before generating
2. **Simple string building** - Concatenation with proper formatting
3. **Shared utilities reduce duplication** - lengthToCss, angleToCss, etc.
4. **Optional clauses** - Handle missing fields gracefully
5. **Modern syntax** - Space-separated, slash for alpha

### Architecture

1. **Utilities are the foundation** - Both packages depend on them
2. **Generators validate types** - Expose design issues early
3. **Parser:Generator ratio ~2.7:1** - Parsing is much harder
4. **Modular structure** - One parser/generator per type
5. **Barrel exports** - Clean public API

---

## 🚀 Next Steps

1. ✅ **Create b_utils package** with proper structure
2. ✅ **Port generation utilities** (values.ts)
3. ✅ **Port parse utilities subset** (angle, length, position, number)
4. ✅ **Start color generators** (hex → named → rgb → hsl → ...)
5. ⏭️ **Continue to gradient generators**
6. ⏭️ **Begin parsers** (same order)

**Current focus:** b_utils + b_generators (Session 007)
**Next session:** b_parsers (Session 008)
