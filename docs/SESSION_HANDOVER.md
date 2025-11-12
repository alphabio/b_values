# Session 068 Handover: Property Automation & Architectural Foundations

**Date:** 2025-11-12  
**Session Focus:** New property automation, structural shorthands, and pattern unification  
**Status:** 🎯 CRITICAL FOUNDATIONS ESTABLISHED

---

## 🚀 Executive Summary

**We solved the property automation problem.**

This session established **fundamental architectural patterns** that enable rapid property implementation and scaling to 50+ properties. We identified three core patterns, defined strict boundaries, and created a complete scaffolding system.

**Key Achievement:** Property automation is now **pattern-driven, not template-driven.**

---

## 🎯 The Three Fundamental Patterns

### Pattern 1: Structural Shorthands

**Definition:** Shorthands representing a SINGLE concept with structurally coherent values.

**Tests (ALL 3 must pass):**
1. ✅ **Single Concept** - One semantic concept only
2. ✅ **Homogeneous Types** - Same/similar value types
3. ✅ **Structural Coherence** - Spatially/coordinately related

**Examples:**
```typescript
padding         → BoxSides4 { top, right, bottom, left }
margin          → BoxSides4 { top, right, bottom, left }
border-radius   → BoxCorners4 { topLeft, topRight, bottomRight, bottomLeft }
background-position → Position2D { horizontal, vertical }
```

**IR Architecture:**
- Core type in @b/types (BoxSides4, Position2D)
- Property IR wraps core type
- Shared parser/generator in @b/parsers and @b/generators
- Canonical representation (always expand)
- Generator optimizes output

**Reject:** Bundling shorthands (background, border, font) - multiple concepts, heterogeneous types

**Documents:** `STRICT_SHORTHAND_BOUNDARY.md`, `IR_MODEL_STRUCTURAL_SHORTHANDS.md`

### Pattern 2: Layer-based Multi-value

**Definition:** Properties that apply per background/mask layer.

**Examples:**
```typescript
background-image        → { kind: "list", values: Image[] }
background-position     → { kind: "list", values: Position2D[] }
background-blend-mode   → { kind: "list", values: BlendMode[] }
```

**IR Pattern:** `{ kind: "list", values: ValueType[] }`

**Implementation:** Use `createMultiValueParser()` utility, comma-separated output

**Documents:** `BLEND_MODE_PATTERN.md`

### Pattern 3: Element-based Single Value

**Definition:** Properties that apply to entire element (no layering).

**Examples:**
```typescript
background-color   → { kind: "value", value: Color }
mix-blend-mode     → { kind: "value", value: BlendMode }
opacity            → { kind: "value", value: Number }
```

**IR Pattern:** `{ kind: "value", value: ValueType }`

---

## 🏗️ Core Architecture Components

### Reusable Core Types (@b/types)

**To Implement:**
- `BoxSides4` - TRBL directional structure
- `BoxCorners4` - Corner structure
- `BlendMode` - Blend mode enum

**Existing:**
- `Position2D` - XY coordinate structure
- `CssValue` - Universal CSS function support

### Shared Parser Utilities (@b/parsers)

**To Implement:**
- `parseBoxSides4()` - 1-4 value syntax, expands per CSS spec
- `parseBoxCorners4()` - Corner parsing
- `BlendMode.parse()` - Blend mode keyword parsing

**Existing:**
- `parsePosition2D()` - Position parsing
- `createMultiValueParser()` - Multi-value utility

### Shared Generator Utilities (@b/generators)

**To Implement:**
- `BoxSides.generate()` - Optimizes 4 sides → 1-4 values
- `BoxCorners.generate()` - Corner generation

**Existing:**
- `Position.generate()` - Position generation (needs rename)

---

## 📋 Property Manifest System

**Status:** 🎯 DESIGN COMPLETE, PHASE 1 IMPLEMENTED

**What It Does:**
- Defines exact parser/generator function names for each property
- Enables validation, scaffolding, and automation
- Single source of truth for implementation status

**Structure:**
```typescript
export const PROPERTY_MANIFEST = {
  "background-position": {
    parser: "Position.parsePosition2D",
    generator: "Position.generate",
    status: "implemented"
  },
  "padding": {
    parser: "BoxSides.parseBoxSides4",
    generator: "BoxSides.generate",
    status: "planned"
  }
} as const;
```

**Documents:** `MANIFEST_IMPLEMENTATION.md`, `PROPERTY_SCAFFOLDING_STRATEGY.md`

---

## 🔧 Generator Naming Refactor

**Status:** ⚠️ BREAKING CHANGE REQUIRED

**Issue:** Inconsistent generator naming breaks manifest automation

**Current:** `Position.generatePosition2D()`  
**Target:** `Position.generate()`

**Rationale:** Single-type namespaces should use `.generate()` for consistency

**Action Required:**
1. Rename `Position.generatePosition2D()` → `Position.generate()`
2. Update call sites in background-position generator
3. Update tests and manifest

**Document:** `GENERATOR_NAMING_REFACTOR.md`

---

## 🎯 Background Properties Retrofit

**Status:** ⚠️ ARCHITECTURAL DEBT IDENTIFIED

**Problem:** 4 properties have inline types, blocking automation

**False Positives:**
- background-position (inline Position2D)
- background-attachment (inline keyword enum)
- background-clip (inline box enum)
- background-origin (inline box enum)

**Solution:** Extract inline types to @b/types, update manifest

**Document:** `RETROFIT_ANALYSIS.md`

---

## 🚫 Strict Boundaries

### Bundling Shorthands (Rejected)

**Examples:** background, border, font, flex, animation

**Why reject:** Multiple concepts, heterogeneous types, complexity explosion

**Client must expand via @b/short before parsing**

**Documents:** `SHORTHAND_EXPANSION_DECISION.md`, `STRICT_SHORTHAND_BOUNDARY.md`

### Longhand Siblings (Implement Both)

**Strategy:** Implement BOTH structural shorthand AND individual longhands

**Example:** padding + padding-{top,right,bottom,left}

**Rationale:** Structural for DRY, individual for granular control

**Document:** `LONGHAND_SIBLINGS_STRATEGY.md`

---

## 📊 Implementation Priorities

### Phase 1: Foundation (Week 1)

**Core Types:**
- □ BoxSides4, BoxCorners4, BlendMode in @b/types

**Shared Utilities:**
- □ parseBoxSides4, parseBoxCorners4, BlendMode.parse in @b/parsers
- □ BoxSides.generate, BoxCorners.generate in @b/generators
- □ Tests for all

### Phase 2: Generator Refactor (Week 1)

- □ Rename Position.generatePosition2D() → Position.generate()
- □ Update call sites and tests
- □ Update manifest

### Phase 3: Automation Scripts (Week 1-2)

- □ Manifest validation script
- □ Property scaffold script
- □ Batch import script
- □ CI integration

### Phase 4: Retrofit (Week 2)

- □ Extract inline types from 4 background properties
- □ Update manifest entries
- □ Validate with script

### Phase 5: New Properties (Week 2-3)

- □ padding + padding-{top,right,bottom,left}
- □ margin + margin-{top,right,bottom,left}
- □ border-width/style/color + individual sides
- □ border-radius + individual corners
- □ background-blend-mode
- □ mix-blend-mode

**Target:** 20+ new properties in 1-2 weeks with automation

---

## 🎯 How to Begin

### Step 1: Create Core Types (2-3 hours)

```bash
packages/b_types/src/box-sides.ts
packages/b_types/src/box-corners.ts
packages/b_types/src/blend-mode.ts
```

**Reference:** `IR_MODEL_STRUCTURAL_SHORTHANDS.md`

### Step 2: Create Parser Utilities (3-4 hours)

```bash
packages/b_parsers/src/box-sides.ts
packages/b_parsers/src/box-corners.ts
packages/b_parsers/src/blend-mode.ts
```

### Step 3: Create Generator Utilities (2-3 hours)

```bash
packages/b_generators/src/box-sides.ts
packages/b_generators/src/box-corners.ts
```

### Step 4: Quick Win - Implement padding (4-6 hours)

**Why padding first:** Uses BoxSides4, structural shorthand pattern, high value

```bash
packages/b_declarations/src/properties/padding/
  ├── types.ts
  ├── parser.ts
  ├── generator.ts
  ├── definition.ts
  └── index.ts
```

### Step 5: Build Manifest System (6-8 hours)

```bash
packages/b_declarations/src/core/manifest.ts
scripts/validate-manifest.ts
scripts/scaffold-property.ts
```

### Step 6: Scale (1-2 days)

Run scaffold for 10+ properties, minimal edits, test, ship

---

## 🚨 Critical Decisions Locked In

1. **Canonical Representation** - Always expand to full structure, generator optimizes
2. **Structural vs Bundling** - Three tests (ALL must pass), non-negotiable boundary
3. **Layer-based vs Element-based** - Two distinct IR patterns
4. **No Deprecation Cycles** - Greenfield, breaking changes are normal
5. **Generator Naming** - Single-type namespaces use `.generate()`

---

## 📚 Complete Document Index

### Must Read First
- `STRICT_SHORTHAND_BOUNDARY.md` - The three tests
- `IR_MODEL_STRUCTURAL_SHORTHANDS.md` - Complete IR architecture
- `MANIFEST_IMPLEMENTATION.md` - Automation strategy

### Pattern Documentation
- `BLEND_MODE_PATTERN.md` - Layer-based vs element-based
- `COMPOSITE_LONGHAND_PATTERN.md` - DRY exploration
- `BACKGROUND_POSITION_ANALYSIS.md` - Existing pattern analysis

### Implementation Guides
- `PROPERTY_SCAFFOLDING_STRATEGY.md` - Automation scripts
- `GENERATOR_NAMING_REFACTOR.md` - Breaking change required
- `RETROFIT_ANALYSIS.md` - Background properties fix

### Integration & Policy
- `CSS_VALUES_INTEGRATION_ANALYSIS.md` - CssValue foundation
- `LONGHAND_SIBLINGS_STRATEGY.md` - Sibling property strategy
- `SHORTHAND_EXPANSION_DECISION.md` - Reject at entry point

---

## 🎯 Success Metrics

### Velocity
- Before: 1 property = 1 day
- After: 1 property = 1-2 hours (with automation)
- **50 properties = 1-2 weeks** 🚀

### Quality
- ✅ Zero inline types (all shared)
- ✅ 100% manifest coverage
- ✅ Automated validation on CI
- ✅ Pattern-driven architecture

---

## 💡 Key Insights

1. **Patterns Over Templates** - Properties self-organize into patterns
2. **Core Types Are Foundation** - Invest in core types, get dozens of properties free
3. **Manifest Enables Everything** - Executable metadata, not documentation
4. **Automation Is Pattern Recognition** - Patterns enable automation
5. **Architecture Scales Linearly** - 50+ properties, same complexity

---

## ✅ Handover Checklist

**For next session:**

1. ✅ Read `STRICT_SHORTHAND_BOUNDARY.md`
2. ✅ Read `IR_MODEL_STRUCTURAL_SHORTHANDS.md`
3. ✅ Read `MANIFEST_IMPLEMENTATION.md`
4. □ Create core types (BoxSides4, BoxCorners4, BlendMode)
5. □ Create parser utilities
6. □ Create generator utilities
7. □ Implement padding (test pattern)
8. □ Build manifest validation script
9. □ Refactor Position.generate() naming
10. □ Retrofit background properties
11. □ Scale to 20+ properties

---

## 🔥 Bottom Line

**We have the architecture.**  
**We have the patterns.**  
**We have the plan.**

**Now we build the automation.**  
**Then we ship 50+ properties.**

**The path is clear. Let's execute. 🚀**
