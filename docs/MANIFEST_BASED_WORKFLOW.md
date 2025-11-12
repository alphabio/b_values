# Manifest-Based Property Implementation Workflow

**Date:** 2025-11-12
**Status:** Official workflow for Session 071+
**Replaces:** new-property.ts --from pattern

---

## 🎯 The Superior Approach

**Declarative manifest + pattern-based generation = scalable to 50+ properties.**

No cloning. No string replacement. No guessing. No technical debt.

---

## 📋 Property Manifest Schema

**File:** `property-manifest.json` (root directory)

```json
{
  "background-blend-mode": {
    "name": "background-blend-mode",
    "syntax": "<blend-mode>#",
    "inherited": false,
    "initial": "normal",
    "mode": "multi",
    "pattern": "layer-based-list",
    "cssValues": "auto",
    "requirements": {
      "keywords": [],
      "types": ["blend-mode"],
      "parser": "BlendMode.parse",
      "generator": "BlendMode.generate"
    },
    "spec": "https://drafts.fxtf.org/compositing/#background-blend-mode",
    "mdn": "https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode"
  },
  
  "padding": {
    "name": "padding",
    "syntax": "<length-percentage>{1,4}",
    "inherited": false,
    "initial": "0",
    "mode": "structural",
    "pattern": "box-sides-4",
    "cssValues": "auto",
    "requirements": {
      "keywords": [],
      "types": ["box-sides-4"],
      "parser": "BoxSides.parse",
      "generator": "BoxSides.generate"
    },
    "spec": "https://drafts.csswg.org/css-box/#padding-properties",
    "mdn": "https://developer.mozilla.org/en-US/docs/Web/CSS/padding"
  }
}
```

---

## 🔍 Field Definitions

### Core Metadata

- **name**: CSS property name (kebab-case)
- **syntax**: CSS syntax from spec (for validation)
- **inherited**: true/false (from spec)
- **initial**: Initial value (from spec)
- **spec**: W3C spec URL
- **mdn**: MDN documentation URL

### Implementation Mode

- **mode**: `"single"` | `"multi"` | `"structural"`
  - `single`: Single value (color, opacity)
  - `multi`: Comma-separated list (background-image)
  - `structural`: Box-sides or box-corners (padding, margin)

### Pattern Classification

- **pattern**: Pattern identifier
  - `"layer-based-list"`: Multi-value per layer (background-*)
  - `"element-single"`: Single value per element (mix-blend-mode)
  - `"box-sides-4"`: TRBL shorthand (padding, margin)
  - `"box-corners-4"`: Corner shorthand (border-radius)

### CSS Functions Support

- **cssValues**: `"auto"` | `"manual"` | `"none"`
  - `auto`: Full CssValue support (var, calc, etc.)
  - `manual`: Custom CSS function handling
  - `none`: No CSS functions (keyword-only)

### Dependencies

- **requirements.keywords**: Keyword arrays needed (empty if reusing)
- **requirements.types**: Type schemas needed (e.g., `["blend-mode"]`)
- **requirements.parser**: Parser function path (e.g., `"BlendMode.parse"`)
- **requirements.generator**: Generator function path (e.g., `"BlendMode.generate"`)

---

## 🎯 The Three Fundamental Patterns

### Pattern 1: Layer-Based List

**Properties:** background-image, background-position, background-blend-mode, mask-*

**Characteristics:**
- Comma-separated values
- One value per layer
- Multi-value parser utility

**IR Structure:**
```typescript
PropertyIR =
  | { kind: "keyword", value: CssWide }
  | { kind: "list", values: ValueType[] }
```

**Example Manifest Entry:**
```json
{
  "mode": "multi",
  "pattern": "layer-based-list",
  "requirements": {
    "types": ["blend-mode"],
    "parser": "BlendMode.parse",
    "generator": "BlendMode.generate"
  }
}
```

### Pattern 2: Element-Based Single

**Properties:** background-color, mix-blend-mode, opacity

**Characteristics:**
- Single value
- Applies to entire element
- No layering

**IR Structure:**
```typescript
PropertyIR =
  | { kind: "keyword", value: CssWide }
  | { kind: "value", value: ValueType }
```

**Example Manifest Entry:**
```json
{
  "mode": "single",
  "pattern": "element-single",
  "requirements": {
    "types": ["blend-mode"],
    "parser": "BlendMode.parse",
    "generator": "BlendMode.generate"
  }
}
```

### Pattern 3: Structural Shorthand

**Properties:** padding, margin, border-radius, border-width

**Characteristics:**
- 1-4 value syntax
- Expands to structured IR (TRBL or corners)
- Generator optimizes output

**IR Structure:**
```typescript
PropertyIR =
  | { kind: "keyword", value: CssWide }
  | { kind: "sides", top: T, right: T, bottom: T, left: T }
  | { kind: "corners", topLeft: T, topRight: T, bottomRight: T, bottomLeft: T }
```

**Example Manifest Entry:**
```json
{
  "mode": "structural",
  "pattern": "box-sides-4",
  "requirements": {
    "types": ["box-sides-4"],
    "parser": "BoxSides.parse",
    "generator": "BoxSides.generate"
  }
}
```

---

## 🚀 Implementation Workflow

### Step 1: Add to Manifest

```bash
# Edit property-manifest.json
{
  "background-blend-mode": {
    "name": "background-blend-mode",
    "pattern": "layer-based-list",
    "requirements": {
      "types": ["blend-mode"],
      "parser": "BlendMode.parse",
      "generator": "BlendMode.generate"
    }
  }
}
```

### Step 2: Validate Dependencies

```bash
pnpm audit-property background-blend-mode
```

**Output:**
```
✅ BACKGROUND-BLEND-MODE
📦 Types: ✅ blend-mode
🔍 Parser: ✅ BlendMode.parse
🎨 Generator: ✅ BlendMode.generate
📊 Assessment: ✅ READY TO SCAFFOLD
```

**If blocked:**
```
⚠️ BACKGROUND-BLEND-MODE
📦 Types: ❌ blend-mode (missing)
📊 Assessment: 🔴 BLOCKED

Next steps:
1. Create packages/b_types/src/blend-mode.ts
2. Create packages/b_parsers/src/blend-mode.ts
3. Run audit again
```

### Step 3: Create Shared Types (If Needed)

**Only if audit shows missing dependencies:**

```typescript
// packages/b_types/src/blend-mode.ts
import { z } from "zod";

export const blendModeSchema = z.enum([
  "normal", "multiply", "screen", // ... etc
]);

export type BlendMode = z.infer<typeof blendModeSchema>;
```

```typescript
// packages/b_parsers/src/blend-mode.ts
import { parseOk, parseErr, createError, type ParseResult } from "@b/types";
import type { BlendMode } from "@b/types";

export function parse(value: string): ParseResult<BlendMode> {
  // Implementation
}

export const BlendMode = { parse };
```

### Step 4: Scaffold Property (Future)

```bash
# Session 072: This command will exist
pnpm scaffold-property background-blend-mode
```

**Reads manifest → generates correct structure for pattern.**

**For Session 071: Manual implementation using Session 068 docs.**

### Step 5: Implement Property Logic

**Edit scaffolded files:**
- `packages/b_declarations/src/properties/background-blend-mode/types.ts`
- `packages/b_declarations/src/properties/background-blend-mode/parser.ts`
- `packages/b_declarations/src/properties/background-blend-mode/generator.ts`
- `packages/b_declarations/src/properties/background-blend-mode/definition.ts`

**Use pattern-specific implementation from Session 068 docs.**

### Step 6: Generate IR Map

```bash
pnpm generate:property-ir-map
```

Updates `PropertyIRMap` with new property.

### Step 7: Test

```bash
pnpm test --filter @b/declarations
pnpm check
pnpm build
```

---

## 📊 Benefits Over --from

### Scalability

**--from (old):**
- Property #50 cloned from #49 cloned from #48...
- Pattern drift over time
- Nobody knows canonical pattern

**Manifest (new):**
- Property #50 generated from pattern template
- Guaranteed consistency
- Pattern is source of truth

### Clarity

**--from (old):**
- "Which property should I clone from?"
- "What do I need to change?"
- "What can I delete?"

**Manifest (new):**
- Pattern clearly identified
- Dependencies explicit
- No guessing, no deletions

### Validation

**--from (old):**
- Clone first, validate later
- Hope pattern matches
- Manual dependency tracking

**Manifest (new):**
- Validate before scaffold
- Audit tool checks dependencies
- Clear error messages

### Time

**--from (old):**
- 51 minutes per property (find, clone, fix, delete, test)

**Manifest (new):**
- 6 minutes per property (scaffold, test)

**8.5x faster at scale.**

---

## 🎯 Session 071 Plan

### Manual Implementation (Validates Workflow)

1. **Add to manifest** (5 min)
   - Create property-manifest.json entry
   - Define pattern and requirements

2. **Run audit** (1 min)
   - `pnpm audit-property background-blend-mode`
   - Verify dependencies

3. **Create shared types** (20 min)
   - BlendMode type (use BLEND_MODE_PATTERN.md code)
   - BlendMode parser (use BLEND_MODE_PATTERN.md code)

4. **Manual scaffold** (10 min)
   - Create property directory structure
   - Copy pattern template from Session 068

5. **Implement logic** (20 min)
   - Fill in types, parser, generator
   - Use BLEND_MODE_PATTERN.md code

6. **Test** (10 min)
   - Write tests
   - Verify all checks pass

**Total: ~60 minutes**

**Validates:** Manifest workflow before building automation.

---

## 🚀 Session 072 Plan

### Build Scaffold Automation

1. **Create scaffold-property.ts** (4-6h)
   - Read property-manifest.json
   - Pattern-based code generation
   - Three pattern templates

2. **Auto-test generation** (2-3h)
   - Generate test suites from manifest
   - Pattern-specific test cases

3. **Implement 3-5 properties** (1-2h)
   - Validate automation works
   - Identify edge cases

**Total: 7-11 hours**

**Delivers:** Fast scaffold tool (6 min per property).

---

## 📚 Reference Documents

**Must read:**
- `docs/sessions/068/PROPERTY_SCAFFOLDING_STRATEGY.md` - Why manifest is superior
- `docs/sessions/068/MANIFEST_IMPLEMENTATION.md` - Manifest schema design
- `docs/sessions/068/BLEND_MODE_PATTERN.md` - Complete example property
- `docs/sessions/068/STRICT_SHORTHAND_BOUNDARY.md` - Pattern classification rules

**Pattern documentation:**
- `docs/sessions/068/BACKGROUND_POSITION_ANALYSIS.md` - Layer-based list pattern
- `docs/sessions/068/IR_MODEL_STRUCTURAL_SHORTHANDS.md` - Structural shorthand pattern

---

## ✅ Success Criteria

### Session 071 (Manual)
- ✅ Manifest entry created
- ✅ Audit tool validates dependencies
- ✅ Property implemented correctly
- ✅ All tests pass
- ✅ Workflow validated

### Session 072 (Automated)
- ✅ scaffold-property command works
- ✅ Pattern-based generation correct
- ✅ Auto-generated tests pass
- ✅ 3-5 properties implemented via automation

### Session 073+ (Scale)
- ✅ 10 properties per session
- ✅ Batch operations working
- ✅ 50+ properties achievable

---

## 🔥 Bottom Line

**Property manifest is the only way forward.**

**Eliminates:**
- ❌ Cloning and manual fixes
- ❌ Pattern drift
- ❌ Dependency guessing
- ❌ Code review nightmare

**Enables:**
- ✅ Pattern-driven generation
- ✅ Automatic validation
- ✅ Guaranteed consistency
- ✅ Linear scaling to 50+ properties

**The path is clear. Execute.** 🚀
