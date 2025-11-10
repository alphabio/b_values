# Feedback 01 - Architecture & Scaling

**Captured:** 2025-11-10
**Source:** Executive summary on architecture/scaling to 50+ properties

---

## Executive Summary

Foundation is solid for scaling beyond 50 properties. Main focus areas:

1. Close correctness gaps (lost warnings, `parseErr` misuse, `rawValue` paths)
2. Codify property lifecycle into tooling/templates
3. Automate validation + synchronization

---

## Highlights (Keep These)

- **Clear layering:** `@b/{parsers,generators,types,keywords}` - responsibilities crisp, will scale
- **Consistent IR modeling with Zod:** discriminated unions straightforward to extend
- **Issue propagation & stamping:** `stampIssues`, `collectWarnings`, context-aware messages
- **Parser/generator symmetry:** each property folder = mini playbook, good for onboarding

---

## High-Priority Fixes

### 🔴 Critical

1. **`createMultiValueParser` - Lost Warnings**
   - **Issue:** Successful parses drop accumulated warnings (`issues: []`)
   - **Impact:** Warnings from child parsers vanish
   - **Fix:** Return `issues: allIssues` in success branch

2. **`createMultiValueParser` - `parseErr` Misuse**
   - **Issue:** Calls `parseErr("InvalidSyntax", …)` - property field becomes `"InvalidSyntax"`
   - **Impact:** Downstream expects CSS property name or undefined, not diagnostic label
   - **Fix:** Replace first argument with actual property name (thread via config) or `""`

### 🟠 High

3. **`parseDeclaration` - `rawValue` Ignored**
   - **Issue:** `rawValue` flag in `PropertyDefinition` ignored for non-custom props
   - **Impact:** Future properties wanting raw strings (e.g., `font-family`) will break
   - **Fix:** Add branch: `if (definition.rawValue) parseResult = unsafeCallParser(definition.parser, value)`

4. **Warning Hygiene - Deduplication**
   - **Issue:** Helpers (`ensureProperty`, `parseDeclarationList`) re-wrap issues, not uniform deduplication
   - **Impact:** Noisy duplicate warnings
   - **Fix:** Introduce `dedupeIssues` utility based on `(code, message, path)`

### 🟡 Medium

5. **Naming Consistency**
   - **Issue:** `backgroundSizeIRS` vs other `*IRSchema` names
   - **Impact:** Inconsistency multiplies with dozens of modules
   - **Fix:** Rename to `backgroundSizeIRSchema`

---

## Medium-Term Improvements

1. **Registry Safeguards**
   - Add `logDuplicate` flag or `register` return boolean for duplicate detection
   - Expose `propertyRegistry.getAll()` for debugging/telemetry

2. **`ParseResult` Ergonomics**
   - `parseErr` forces `property` string, tempts misuse like `"InvalidSyntax"`
   - Overload to accept `property?: string`
   - Provide `linkIssues(property)` helper for retrofitting context

3. **Parser Ergonomics**
   - Reusable `createBackgroundMultiParser("background-repeat", parseFn, aggregateFn)`
   - Reduces boilerplate, injects property names automatically

4. **Consistent Math Support**
   - `cssValueToCss` handles `calc-operation`
   - Normalize parentheses for operator precedence to avoid invalid output

5. **Testability Hooks**
   - Pure helpers: (a) parse raw CSS → `csstree.Value`, (b) call parser/generator, (c) snapshot-friendly data
   - Enable golden tests per property

---

## Scaling to 50+ Properties - Game Plan

1. **Property Scaffolding CLI**
   - `pnpm b new property background-position`
   - Generates: `parser.ts`, `generator.ts`, `types.ts`, `definition.ts`, wires exports
   - Pre-populate with `createMultiValueParser`/`createSingleValueParser` + TODOs

2. **Shared Mixins**
   - `createListProperty({ name, itemParser, valueToCss })` for background-\* pattern
   - Optional hooks: `preParse`, `postValidate` for one-off quirks

3. **Documentation Automation**
   - Generate Markdown from property definitions (`name`, `syntax`, `initial`, `inherited`)
   - Keep docs up-to-date automatically

4. **Regression Suite**
   - Property-driven fixtures: `fixtures/property/background-repeat/*.json` with `{ css, expect }`
   - Harness: parse→generate→parse roundtrip, snapshot `issues`

5. **IR Contract Tests**
   - `validatePropertyIR(property, ir)` driven by Zod schema
   - Parsers and generators share same contract

---

## Automation & Tooling Opportunities

| Category        | Opportunity                                                               | Benefit                                      |
| --------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| Code generation | Script to update `types.map.ts` by crawling `properties/**/definition.ts` | Eliminates manual sync errors                |
| Templates       | `/scripts/scaffold-property.ts` copies base template                      | Consistent new properties with tests/exports |
| Validation      | Pre-publish script: validate all property definitions                     | Catches regressions before release           |
| Documentation   | Generate README tables from registry                                      | Zero manual upkeep                           |
| CI              | Property-specific golden tests, schema snapshots                          | Confidence when refactoring                  |

---

## Quick Wins Checklist

- [ ] Honor `rawValue` in `parseDeclaration`
- [ ] Fix warnings dropped in `createMultiValueParser`
- [ ] Replace `"InvalidSyntax"` property strings in `parseErr` calls
- [ ] Add duplicate-registration guard (console warn)
- [ ] Rename `backgroundSizeIRS` → `backgroundSizeIRSchema`
- [ ] Add CLI/script skeleton for scaffolding new properties
- [ ] Automate `types.map.ts` generation

---

## Closing Thoughts

Hard architectural work done. Scaling = **reduce per-property friction** + **protect consistency**.
Address correctness gaps, add automation, new properties become rote.
