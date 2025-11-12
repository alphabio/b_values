# Property Scaffolding Strategy: Critical Analysis

**Session:** 068
**Date:** 2025-11-12
**Goal:** Fool-proof automation to scale from 9 → 50+ properties

---

## 🚨 The Core Problem

**Your idea:** Generate everything, then delete what's not needed.

**My analysis:** This is **fundamentally backwards** and will create chaos at scale.

---

## Why "Generate Then Delete" Fails

### 1. **Cognitive Overload**

For each property you need to:

- ❓ Does this need new keywords? (audit @b/keywords)
- ❓ Does this need new units? (audit @b/units)
- ❓ Do types exist? (audit @b/types)
- ❓ Do parsers exist? (audit @b/parsers)
- ❓ Do generators exist? (audit @b/generators)
- ❓ Which files do I delete?
- ❓ What's safe to remove vs critical?

**Result:** 50+ properties × 6+ decision points = **300+ manual decisions**

### 2. **Deletion Risk**

```bash
# Generated scaffold:
keywords.ts          # ← Do I need this?
units.ts             # ← Do I need this?
custom-types.ts      # ← Do I need this?
parser-helpers.ts    # ← Do I need this?
```

**Problems:**

- Junior dev deletes needed file → runtime error
- Senior dev keeps unnecessary file → technical debt
- No one deletes anything → bloat × 50 properties
- Delete too much → broken imports

### 3. **Pattern Fragmentation**

After 50 properties with manual deletions:

- Property A has keywords file (real keywords)
- Property B has keywords file (forgot to delete, empty)
- Property C has no keywords file (correctly assessed)
- Property D has inline keywords (didn't use file)

**Result:** Zero consistency. Code review nightmare.

---

## 🎯 The Right Approach: Declarative Configuration

**Principle:** Specify WHAT you need, generate ONLY that.

### Property Manifest Schema

```typescript
// property-manifest.json
{
  "width": {
    "name": "width",
    "syntax": "auto | <length-percentage> | min-content | max-content | fit-content",
    "inherited": false,
    "initial": "auto",
    "mode": "single",

    // ⭐ DECLARATIVE REQUIREMENTS
    "requirements": {
      "keywords": ["auto", "min-content", "max-content", "fit-content"],
      "types": ["length-percentage"],
      "parser": "length-percentage",  // reuse existing
      "generator": "length-percentage" // reuse existing
    }
  },

  "transform": {
    "name": "transform",
    "syntax": "none | <transform-list>",
    "inherited": false,
    "initial": "none",
    "mode": "multi",

    "requirements": {
      "keywords": ["none"],
      "types": ["transform-function"], // NEW - needs creation
      "parser": "transform",             // NEW - needs creation
      "generator": "transform"           // NEW - needs creation
    }
  }
}
```

---

## 🏗️ Scaffolding Pipeline (3 Phases)

### Phase 1: Audit (Automated)

```bash
pnpm audit-property width
```

**Output:**

```
✅ Keywords exist: auto, min-content, max-content, fit-content
✅ Types exist: length-percentage (@b/types)
✅ Parser exists: Length.parseLengthPercentage (@b/parsers)
✅ Generator exists: Length.generateLengthPercentage (@b/generators)

📊 Assessment: READY TO GENERATE (0 missing dependencies)
```

**For transform:**

```
✅ Keywords exist: none
❌ Types missing: transform-function
❌ Parser missing: Transform.parseTransformFunction
❌ Generator missing: Transform.generateTransformFunction

📊 Assessment: BLOCKED (3 missing dependencies)

🎯 Next Steps:
1. Create @b/types/src/transform/function.ts
2. Create @b/parsers/src/transform/function.ts
3. Create @b/generators/src/transform/function.ts
4. Re-run audit
```

### Phase 2: Scaffold (Conditional Generation)

```bash
pnpm scaffold-property width
```

**Generates ONLY:**

```
@b/declarations/src/properties/width/
├── definition.ts      # defineProperty with manifest data
├── parser.ts          # delegates to existing Length parser
├── generator.ts       # delegates to existing Length generator
├── types.ts           # IR schema (simple wrapper)
├── parser.test.ts     # test template
├── generator.test.ts  # test template
└── index.ts           # barrel exports
```

**Does NOT generate:**

- ❌ keywords.ts (reuses existing)
- ❌ units.ts (reuses existing)
- ❌ custom parser logic (delegates)

### Phase 3: Validate (Automated)

```bash
pnpm validate-property width
```

**Checks:**

- ✅ definition.ts exports valid PropertyDefinition
- ✅ parser.ts implements correct signature
- ✅ generator.ts implements correct signature
- ✅ types.ts exports IR schema
- ✅ All imports resolve
- ✅ TypeScript compiles
- ✅ Tests exist (may be failing, that's OK)

---

## 🎨 Template Strategy: Composition over Generation

### Current Templates (Generate Everything)

```typescript
// ❌ PROBLEM: Always generates keywords file
templates / keywords.ts.hbs;
```

### Proposed Templates (Conditional Sections)

```typescript
// definition.ts.hbs
import { defineProperty } from "../../core";
import { parse{{PropertyName}} } from "./parser";
import { generate{{PropertyName}} } from "./generator";
import type { {{IRType}} } from "./types";

{{#if requirements.keywords.new}}
// Property-specific keywords
import * as Keywords from "./keywords";
{{/if}}

export const {{propertyName}} = defineProperty<{{IRType}}>({
  name: "{{cssName}}",
  syntax: "{{syntax}}",
  parser: parse{{PropertyName}},
  generator: generate{{PropertyName}},
  inherited: {{inherited}},
  initial: "{{initial}}",
});
```

**Key insight:** Template has logic, not filesystem.

---

## 📊 Decision Matrix

| Scenario                         | Current (Session 067)      | Your Idea                    | Proposed                                  |
| -------------------------------- | -------------------------- | ---------------------------- | ----------------------------------------- |
| **New property, existing types** | Manual audit + clone       | Generate all → delete        | Audit → scaffold minimal                  |
| **New property, new types**      | Manual impl × 4 packages   | Generate all → delete → impl | Audit (shows gaps) → impl gaps → scaffold |
| **Consistency**                  | Varies by property         | Varies by deletion           | Enforced by manifest                      |
| **Onboarding**                   | Read 8 properties to learn | Read scaffold + delete docs  | Read manifest examples                    |
| **Errors**                       | Forget to impl parser      | Delete wrong file            | Blocked until deps exist                  |

---

## 🚀 Implementation Phases

### Phase 0: Inventory (1 hour)

**Goal:** Know what exists

```bash
pnpm inventory

# Output: dependency-map.json
{
  "keywords": ["auto", "none", "transparent", "initial", ...],
  "types": ["color", "length-percentage", "image", ...],
  "parsers": {
    "Color": ["parseColor", "parseNamedColor", ...],
    "Length": ["parseLength", "parseLengthPercentage", ...]
  },
  "generators": {
    "Color": ["generateColor"],
    "Length": ["generateLength", ...]
  }
}
```

### Phase 1: Manifest + Audit (2 hours)

1. Create `property-manifest.json` schema
2. Add 5 test properties (width, height, color, opacity, transform)
3. Build audit tool
4. Validate against existing properties

### Phase 2: Scaffold Generator (4 hours)

1. Build conditional template engine
2. Wire up to `pnpm new-prop` command
3. Add validation checks
4. Test on 3 properties (simple, medium, complex)

### Phase 3: Migration (ongoing)

Use new system for all new properties going forward.

---

## 💡 Key Insights

### Why This Beats "Generate + Delete"

1. **Explicit over Implicit**
   - Manifest declares needs upfront
   - No guessing what to delete

2. **Fail Fast**
   - Audit catches missing deps before generation
   - No half-built properties

3. **Discoverable**
   - `dependency-map.json` shows what exists
   - Manifest shows what properties need
   - Easy to spot patterns

4. **Scalable**
   - Add 50 properties? Just extend manifest
   - Audit runs in seconds
   - No per-property cognitive load

5. **Maintainable**
   - Manifest is source of truth
   - Templates are dumb (just rendering)
   - Easy to update all properties (regenerate from manifest)

---

## 🎯 Concrete Example: Width Property

### Step 1: Add to manifest

```json
{
  "width": {
    "syntax": "auto | <length-percentage> | min-content | max-content",
    "requirements": {
      "keywords": ["auto", "min-content", "max-content"],
      "types": ["length-percentage"],
      "parser": "Length.parseLengthPercentage",
      "generator": "Length.generateLengthPercentage"
    }
  }
}
```

### Step 2: Audit

```bash
$ pnpm audit-property width
✅ All dependencies exist
```

### Step 3: Scaffold

```bash
$ pnpm scaffold-property width
Generated:
  - properties/width/definition.ts
  - properties/width/parser.ts (delegates to Length parser)
  - properties/width/generator.ts (delegates to Length generator)
  - properties/width/types.ts
  - properties/width/*.test.ts
```

### Step 4: Implement tests

```typescript
// parser.test.ts - generated template with TODOs
describe("parseWidth", () => {
  it.todo("parses auto keyword");
  it.todo("parses length values");
  it.todo("parses percentage values");
  it.todo("parses min-content keyword");
});
```

### Step 5: Run validation

```bash
$ pnpm validate-property width
✅ Definition exports valid PropertyDefinition
✅ Parser has correct signature
✅ Generator has correct signature
✅ Types export IR schema
⚠️  Tests: 4 todo, 0 passing (implement tests)
```

**Total time:** ~15 minutes (vs 40+ minutes manual)

---

## ⚠️ Why Your Idea Has Merit (But Wrong Direction)

**Your instinct is correct:** We need comprehensive scaffolding.

**Where it goes wrong:** Generate → Delete is backwards.

**Better direction:** Declare → Audit → Generate (minimal)

The "fool-proof" part isn't about generating everything safely.
It's about **preventing generation of unnecessary code** in the first place.

---

## 🎪 Alternative: Hybrid Approach

If you really want "generate everything" for exploration:

```bash
# Exploration mode (safe to delete)
pnpm scaffold-property width --mode=explore --output=/tmp/width-explore

# This generates EVERYTHING in /tmp (not in packages)
# You audit the generated code
# Then run with real mode using insights:

pnpm scaffold-property width --mode=minimal --uses=length-percentage
```

**Benefit:** You get to see "what could be" without polluting codebase.

**Cost:** Extra step. But safe.

---

## 📌 Recommendation

**Invest 8 hours building the manifest + audit + scaffold system.**

**ROI:**

- 50 properties × 30 min savings = 25 hours saved
- Consistency = priceless
- Onboarding new devs = way easier
- Reduces errors by 90%

**Start simple:**

1. Property manifest (JSON schema)
2. Audit tool (checks dependencies exist)
3. Minimal scaffolding (only generate what's needed)

**Complexity creeps in with "generate everything" approach.**
**Simplicity scales with "declare and validate" approach.**

---

## 🔮 Future: AI-Assisted Manifest Generation

Once manifest system exists:

```bash
pnpm suggest-property transform

# AI reads:
# - CSS spec for transform property
# - Existing dependency-map.json
# - Other property manifests as examples

# Outputs:
# - Proposed manifest entry
# - Gap analysis (what's missing)
# - Implementation estimate
```

**But this only works if manifest system is robust.**

Generate-then-delete has no structure for AI to leverage.
