# `new-property.ts` Script Audit

**Location:** `scripts/new-property.ts`  
**Lines:** 701  
**Status:** ⚠️ Exists but not registered in package.json  
**Purpose:** Scaffold new CSS properties across the entire monorepo

---

## 📋 Executive Summary

The script **exists and is comprehensive** but is **not wired up** for use. It's designed to scaffold properties across **3 packages** simultaneously:

- `@b/declarations` (property definitions)
- `@b/parsers` (CSS → IR)
- `@b/generators` (IR → CSS)

---

## 🎯 Two Modes of Operation

### Mode 1: Clone from Existing (`--from`)

**Fast path:** Copy an existing property and rename everything

```bash
pnpm new-prop background-blend-mode \
  --from background-clip \
  --ir BackgroundBlendModeIR
```

**What it does:**

1. Copies ALL files from source property across 3 packages
2. Renames using regex:
   - Property names: `background-clip` → `background-blend-mode`
   - PascalCase: `BackgroundClip` → `BackgroundBlendMode`
   - IR types: `BackgroundClipIR` → `BackgroundBlendModeIR`
3. Updates imports and exports automatically

**Packages affected:**

- ✅ `b_declarations/src/properties/` - **guaranteed** (exits if not found)
- ⚠️ `b_parsers/src/` - **best-effort** (heuristic: looks for `{property}.ts`)
- ⚠️ `b_generators/src/` - **best-effort** (heuristic: looks for `{property}.ts`)

**Current reality check:**

- Your parsers are in **`background/`** folder, not `background-clip.ts`
- Your generators are in **`background/`** folder, not `background-clip.ts`
- **The heuristic will fail** for current structure ❌

---

### Mode 2: Fresh Scaffold (`--mode`)

**Clean slate:** Generate stub files from templates

```bash
pnpm new-prop background-color \
  --mode single \
  --syntax "<color>" \
  --initial transparent \
  --inherited false \
  --ir BackgroundColorIR
```

**Three modes:**

1. **`single`** - Single value property (e.g., `background-color: red`)
2. **`multi`** - Comma-separated values (e.g., `background-image: url(a), url(b)`)
3. **`raw`** - Raw string (e.g., custom properties)

**What it generates:**

#### In `@b/declarations`

```
properties/{property-name}/
├── types.ts         # IR schema (Zod)
├── parser.ts        # Wrapper delegating to @b/parsers
├── generator.ts     # Wrapper delegating to @b/generators
├── definition.ts    # defineProperty() call
├── index.ts         # Barrel exports
└── {property}.test.ts # Test scaffolding
```

#### In `@b/parsers`

```
src/{property-name}.ts   # Parser stub with TODOs
```

#### In `@b/generators`

```
src/{property-name}.ts   # Generator stub with TODOs
```

---

## 🔍 Detailed Flow Breakdown

### 1. Argument Parsing

**Required:**

- `<property-name>` - First positional arg (e.g., `background-color`)

**Optional:**

- `--from <existing>` - Clone from existing property
- `--mode <single|multi|raw>` - Value type (default: `single`)
- `--syntax "<string>"` - CSS syntax (default: `"<custom>"`)
- `--inherited <true|false>` - Inherits from parent? (default: `false`)
- `--initial <value>` - Initial value (default: `"initial"`)
- `--ir <NameIR>` - IR type name (default: auto-generated)
- `--keywords "k1|k2|k3"` - Keyword scaffold hint

**Defaults are sensible** - you can run with just a property name.

---

### 2. Clone Logic (`--from` path)

**File:** Lines 189-272

**Steps:**

1. **Validate source exists**

   ```typescript
   const srcDeclDir = path.join(declBase, srcFolder);
   if (!fs.existsSync(srcDeclDir)) {
     console.error(`--from: declarations source folder not found`);
     process.exit(1);
   }
   ```

2. **Copy declarations** (guaranteed)
   - Loop through all `.ts` files in source
   - Apply 3 regex replacements:
     - IR name: `BackgroundClipIR` → `BackgroundBlendModeIR`
     - Property name: `background-clip` → `background-blend-mode`
     - PascalCase: `BackgroundClip` → `BackgroundBlendMode`
   - Write to destination

3. **Copy parsers** (best-effort)
   - Looks for: `packages/b_parsers/src/{srcProp}.ts`
   - **Problem:** Your structure is `packages/b_parsers/src/background/*.ts`
   - **Result:** Will not find/copy anything ❌

4. **Copy generators** (best-effort)
   - Looks for: `packages/b_generators/src/{srcProp}.ts`
   - **Problem:** Your structure is `packages/b_generators/src/background/*.ts`
   - **Result:** Will not find/copy anything ❌

---

### 3. Fresh Scaffold Logic (no `--from`)

**File:** Lines 274-480 (template generators)

#### 3.1 Types Template (`types.ts`)

**With keywords:**

```typescript
import { z } from "zod";

export const BackgroundColorIR = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: z.union([
      z.literal("transparent"),
      z.literal("inherit"),
      // ... more keywords
    ]),
  }),
]);

export type BackgroundColorIR = z.infer<typeof BackgroundColorIRSchema>;
```

**Without keywords:**

```typescript
export const BackgroundColorIRSchema = z.any(); // TODO: refine
```

---

#### 3.2 Parser Template (`@b/parsers`)

**Mode: single**

```typescript
export function parseBackgroundColor(node: csstree.Value): ParseResult<BackgroundColorIR> {
  return {
    ok: false,
    issues: [
      {
        code: "invalid-value",
        message: "Parser for background-color not implemented",
        severity: "error",
      },
    ],
  };
}
```

**Mode: multi**

```typescript
// Similar but encourages using shared helpers
// TODO: implement using css-tree AST and shared utils
```

**Mode: raw**

```typescript
export function parseBackgroundColor(value: string): ParseResult<BackgroundColorIR> {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, issues: [...] };
  }
  return { ok: true, value: trimmed as unknown as BackgroundColorIR, issues: [] };
}
```

---

#### 3.3 Generator Template (`@b/generators`)

```typescript
export function generateBackgroundColor(ir: BackgroundColorIR): GenerateResult {
  // TODO: implement based on IR.
  return generateOk(String(ir));
}
```

**Always returns value-only** (no `property:` prefix) ✅

---

#### 3.4 Declaration Wrappers

**Parser wrapper:**

```typescript
import * as Parsers from "@b/parsers";

export function parseBackgroundColor(value: string): ParseResult<BackgroundColorIR> {
  return Parsers.parseBackgroundColor(
    // @ts-expect-error placeholder until wired
    value
  ) as unknown as ParseResult<BackgroundColorIR>;
}
```

**Generator wrapper:**

```typescript
import * as Generators from "@b/generators";

export function generateBackgroundColor(ir: BackgroundColorIR): GenerateResult {
  return Generators.generateBackgroundColor(
    // @ts-expect-error placeholder until wired
    ir as any
  ) as GenerateResult;
}
```

**Definition:**

```typescript
export const backgroundColorDefinition = defineProperty<BackgroundColorIR>({
  name: "background-color",
  syntax: "<color>",
  inherited: false,
  initial: "transparent",
  // multiValue: true,  // if --mode multi
  // rawValue: true,    // if --mode raw
  parser: parseBackgroundColor,
  generator: generateBackgroundColor,
});
```

---

#### 3.5 Test Scaffolding

**Shared harness** (created once):

- `packages/b_declarations/test/property-test-utils.ts`
- Contains `runPropertyTests` helper
- Same pattern as current `runPropertyTests` in existing tests

**Per-property test:**

```typescript
import { runPropertyTests } from "../../test/property-test-utils";

runPropertyTests<BackgroundColorIR>({
  property: "background-color",
  parse: [
    // { css: "background-color: red", expectOk: true },
  ],
  generate: [
    // { property: "background-color", ir: {...}, expectOk: true },
  ],
  roundtrip: [
    // { css: "background-color: red" },
  ],
});
```

**Intentionally commented out** - fill in as you implement.

---

### 4. Wiring

**Updates these files automatically:**

1. `packages/b_declarations/src/properties/index.ts`
   - Adds: `export * from "./{property-name}";`

2. ⚠️ **Does NOT update:**
   - `packages/b_parsers/src/index.ts`
   - `packages/b_generators/src/index.ts`
   - `packages/b_declarations/src/properties/definitions.ts`

**You still need to run:**

```bash
pnpm generate:definitions  # Update PropertyIRMap
```

---

## 🚨 Issues with Current Architecture

### Issue #1: Parser/Generator Folder Structure Mismatch

**Script expects:**

```
packages/b_parsers/src/background-clip.ts
packages/b_generators/src/background-clip.ts
```

**Your actual structure:**

```
packages/b_parsers/src/background/clip.ts
packages/b_generators/src/background/clip.ts
```

**Impact:**

- `--from` mode **will not copy** parsers/generators
- Only declarations will be cloned
- You'll need to manually create parser/generator

**Fix options:**

1. Update script heuristic to check folder-based structure
2. Flatten your parsers/generators structure (breaking change)
3. Document that `--from` only copies declarations

---

### Issue #2: Missing Package Registration

**Script is executable** (`#!/usr/bin/env tsx`) but not in `package.json`:

```json
{
  "scripts": {
    "generate:definitions": "..."
    // ❌ Missing: "new-prop": "npx tsx scripts/new-property.ts"
  }
}
```

**Impact:**

- Can't run with `pnpm new-prop`
- Must run directly: `npx tsx scripts/new-property.ts ...`

---

### Issue #3: Test Harness Location

**Script creates:**

```
packages/b_declarations/test/property-test-utils.ts
```

**Your actual location:**

```
packages/b_declarations/src/test/property-contract.ts  # Contains runPropertyTests
```

**Impact:**

- Will create duplicate test utilities
- Existing `runPropertyTests` is more mature

**Fix:**

- Update script to use existing test utils path
- Or merge generated harness with existing

---

### Issue #4: Generator Codegen Reference

**Script says:**

```
Run: pnpm generate:property-ir-map
```

**Your actual command:**

```
pnpm generate:definitions
```

**Minor:** Just outdated comment in output.

---

## ✅ What Works Well

### 1. Two-Path Design

**Clone path** (`--from`) for similar properties  
**Fresh path** (`--mode`) for new patterns  
Both are valid, complementary approaches.

### 2. Intentional TODOs

Generated code has explicit TODO comments:

```typescript
// TODO: implement based on IR
// TODO: if @b/parsers exposes a specific entry, delegate
```

**Philosophy:** Scaffolding is a starting point, not magic.

### 3. Safety Checks

- Won't overwrite existing files
- Validates source exists before cloning
- Exits cleanly with helpful errors

### 4. Naming Conventions

Auto-converts between formats:

- `background-color` → `BackgroundColor` → `BackgroundColorIR`
- Respects existing conventions

### 5. Mode-Specific Templates

Each mode (`single`/`multi`/`raw`) generates appropriate:

- Parser signatures (AST vs string)
- Flags in definition (`multiValue`, `rawValue`)
- Helpful comments

---

## 📊 Comparison: Manual vs Script

### Current Manual Process (Estimated)

1. Create property folder in declarations (~2 min)
2. Create types.ts with Zod schema (~5 min)
3. Create parser.ts wrapper (~3 min)
4. Create generator.ts wrapper (~3 min)
5. Create definition.ts (~4 min)
6. Create index.ts (~1 min)
7. Create test file (~5 min)
8. Update properties/index.ts (~1 min)
9. Create parser in @b/parsers (~10 min)
10. Create generator in @b/generators (~10 min)
11. Wire everything up (~5 min)
12. Run generate:definitions (~1 min)

**Total: ~50 minutes** (for experienced dev)

### With Script (After Fixes)

**Clone mode:**

```bash
pnpm new-prop background-blend-mode --from background-clip --ir BackgroundBlendModeIR
# ~30 seconds
```

**Fresh mode:**

```bash
pnpm new-prop font-family --mode multi --syntax "<family-name>#" --initial system-ui --inherited true
# ~30 seconds
```

Then just implement the logic, tests, and run `pnpm generate:definitions`.

**Estimated time saved: 30-40 minutes per property**

---

## 🎯 Recommendations

### Priority 1: Fix Structural Issues (30 min)

1. **Update clone logic** to match folder structure:

   ```typescript
   // Instead of:
   const guess = path.join(parsersBase, `${srcProp}.ts`);

   // Try both:
   const guesses = [
     path.join(parsersBase, `${srcProp}.ts`),
     path.join(parsersBase, srcProp.split("-")[0], `${srcProp.split("-").slice(1).join("-")}.ts`),
   ];
   ```

2. **Update test harness path**:

   ```typescript
   const base = path.resolve("packages/b_declarations/src/test");
   ```

3. **Fix output message**:

   ```typescript
   console.log("- Run: pnpm generate:definitions");
   ```

### Priority 2: Add to package.json (1 min)

```json
{
  "scripts": {
    "new-prop": "npx tsx scripts/new-property.ts"
  }
}
```

### Priority 3: Add propertyName to Multi-Value Scaffolding (5 min)

When generating parser wrapper for `--mode multi`, include:

```typescript
export const parseBackgroundImage = createMultiValueParser({
  propertyName: "background-image",  // ← Add this
  itemParser: ...,
  aggregator: ...,
});
```

### Priority 4: Document (15 min)

Add `docs/ADDING_PROPERTIES.md`:

- When to use `--from` vs `--mode`
- Current limitations (parser/generator heuristic)
- Step-by-step examples

---

## 🔮 Future Enhancements (Optional)

### 1. Interactive Mode

```bash
pnpm new-prop
# Prompt for property name, mode, etc.
```

### 2. Validation

- Check if property already exists in CSS spec
- Warn if similar property exists
- Validate syntax string format

### 3. Multi-Property Batch

```bash
pnpm new-prop --batch font-properties.yaml
```

### 4. AI-Assisted Generation

- Parse MDN/spec for property details
- Generate IR schema from spec syntax
- Create realistic test cases

---

## 📝 Summary

### Current State: **60% Complete** ⚠️

✅ **What works:**

- Comprehensive scaffolding templates
- Two-mode design (clone/fresh)
- Safety checks and validation
- Naming conventions
- Mode-specific generation

❌ **What needs fixing:**

- Parser/generator heuristic (folder structure mismatch)
- Package.json registration
- Test harness path mismatch
- Outdated codegen reference

🎯 **With 1 hour of fixes:**

- Script will be production-ready
- Can save ~40 minutes per property
- Will scale smoothly to 50+ properties

**Value proposition: High** 📈  
**Effort to fix: Low** 🔧  
**Should we fix it: YES** ✅
