# Generator Naming Consistency Refactor

**Issue:** Background generators use inconsistent naming pattern
**Value:** "We strive for consistency / we break inconsistency / we have no fear"

---

## 🎯 Current Inconsistency

### Consistent (Generic Pattern)

- ✅ `Color.generate()`
- ✅ `Gradient.generate()`
- ✅ `Position.generate()`
- ✅ `Length.generate()`
- ✅ `Angle.generate()`

### Inconsistent (Specific Pattern)

- ❌ `Background.generateImageValue()`
- ❌ `Background.generateBackgroundClipValue()`
- ❌ `Background.generateBackgroundOriginValue()`
- ❌ `Background.generateBackgroundRepeatValue()`
- ❌ `Background.generateBackgroundAttachmentValue()`
- ❌ `Background.generateBackgroundSizeValue()`

---

## ✅ Target State

### Normalized Pattern

- ✅ `Background.generateImage()`
- ✅ `Background.generateClip()`
- ✅ `Background.generateOrigin()`
- ✅ `Background.generateRepeat()`
- ✅ `Background.generateAttachment()`
- ✅ `Background.generateSize()`

**Alternative (even better):**

- ✅ `Background.Image.generate()`
- ✅ `Background.Clip.generate()`
- ✅ `Background.Origin.generate()`

---

## 🔧 Refactor Steps

### Step 1: Rename Generator Functions (packages/b_generators/src/background/)

```typescript
// image.ts
export function generateImageValue → export function generateImage

// clip.ts
export function generateBackgroundClipValue → export function generateClip

// origin.ts
export function generateBackgroundOriginValue → export function generateOrigin

// repeat.ts
export function generateBackgroundRepeatValue → export function generateRepeat

// attachment.ts
export function generateBackgroundAttachmentValue → export function generateAttachment

// size.ts
export function generateBackgroundSizeValue → export function generateSize
```

### Step 2: Update Background Index Export

```typescript
// packages/b_generators/src/background/index.ts
export { generateImage } from "./image";
export { generateClip } from "./clip";
export { generateOrigin } from "./origin";
export { generateRepeat } from "./repeat";
export { generateAttachment } from "./attachment";
export { generateSize } from "./size";
```

### Step 3: Update Property Generators

```typescript
// packages/b_declarations/src/properties/background-image/generator.ts
import * as Generators from "@b/generators";

export function generateBackgroundImage(ir: BackgroundImageIR): GenerateResult {
  // Before: Generators.Background.generateImageValue(layer, [])
  // After:
  return Generators.Background.generateImage(layer, []);
}
```

### Step 4: Update Manifest

```json
{
  "background-image": {
    "generator": "Background.generateImage"
  },
  "background-clip": {
    "generator": "Background.generateClip"
  }
  // ... etc
}
```

### Step 5: Run Tests

```bash
pnpm test
pnpm typecheck
pnpm check
```

---

## 📊 Impact Analysis

### Files to Change

**Generators (6 files):**

- `packages/b_generators/src/background/*.ts` (6 files)

**Property Generators (8 files):**

- `packages/b_declarations/src/properties/background-*/generator.ts` (8 files)

**Manifest (1 file):**

- `scripts/manifest/property-manifest.json`

**Total: 15 files**

### Estimated Time

- Rename functions: 10 min
- Update call sites: 10 min
- Update manifest: 2 min
- Test: 5 min
- **Total: 30 minutes**

### Risk Assessment

- ✅ Low risk: All internal APIs
- ✅ Type system catches breakages
- ✅ 2427 tests validate correctness
- ⚠️ Must be done in single commit (atomic change)

---

## 💡 Future-Proofing

### Manifest Template Can Assume

```typescript
// Scaffold template can now rely on:
const generatorCall = `${namespace}.generate${CapitalizedType}(value)`;

// Examples:
("Color.generate()");
("Background.generateImage()");
("Position.generate()");
```

### Documentation Update

Add to `AGENTS.md`:

```markdown
## 🎯 Generator Naming Convention

**RULE:** Use specific generator names that match the type being generated.

**Pattern:**

- Single-type namespaces: `Color.generate()`, `Position.generate()`
- Multi-type namespaces: `Background.generateImage()`, `Background.generateClip()`

**Rationale:**

- Enables manifest system automation
- Predictable API for scaffold templates
- Clear semantic meaning

**Violation:** Inconsistent naming breaks manifest automation
```

---

## 🚀 Execution Strategy

### Immediate (DO THIS NOW)

1. Create feature branch: `refactor/generator-naming-consistency`
2. Batch rename all 6 background generators
3. Update all 8 call sites
4. Update manifest
5. Run full test suite
6. Commit atomically
7. Merge to main

### Why Now?

- ✅ Manifest system depends on it
- ✅ Scaffold generator (Phase 2) needs predictable naming
- ✅ Only 8 properties affected (small blast radius)
- ✅ Before we add 40+ more properties

**Cost of waiting:** Every new property perpetuates inconsistency

---

## 🎯 Alternative: Smart Manifest System

If we DON'T refactor, manifest system must:

1. Support multiple naming patterns
2. Document pattern per property
3. Scaffold templates need conditional logic

**This violates "consistency over flexibility"**

---

## 🏆 Recommendation

**REFACTOR NOW. Break the inconsistency.**

**WE NEVER WORKAROUND INCONSISTENCIES.**

**Why:**

- Aligns with core value system
- Unblocks Phase 2 (scaffold generator)
- Small blast radius (15 files)
- 30 minutes investment
- Prevents 40+ properties from perpetuating inconsistency
- **No workarounds. No Band-Aids. No "temporary" solutions.**

**The value system says: "we have no fear"**

**Let's break it to fix it. 🔥**

---

## ❌ NO Alternative

~~Option: Document as tech debt and work around it~~

**REJECTED.** We do not compromise consistency for convenience.

Workarounds are:

- ❌ Technical debt in disguise
- ❌ Complexity multipliers
- ❌ Future maintenance nightmares
- ❌ Violations of core values

**If it's inconsistent, we stop and fix. Period.**
