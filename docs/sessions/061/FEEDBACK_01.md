# Feedback 01 - Executive Summary & Scaling Review

**Date:** 2025-11-10
**Source:** Architecture & Scaling Assessment

---

## Executive Summary

You already have an impressively modular architecture: registries, typed IRs, parser/generator symmetry, and a robust issue model. That foundation is absolutely good enough to scale beyond 50 properties. The main things to tighten up before you fan out are:

1. **Close correctness gaps** (e.g., lost warnings, misuse of `parseErr`, unhandled `rawValue` paths).
2. **Codify the "property lifecycle"** into tooling/templates so every new property hits the same quality bar with minimal manual work.
3. **Automate validation + synchronization** (type maps, registry health, CLI scaffolding, regression suites).

Below you'll find detailed comments, ranked fixes, scaling advice, and automation suggestions.

---

## Highlights (things to keep)

- **Clear layering:** `@b/{parsers,generators,types,keywords}` keeps responsibilities crisp and will scale with additional properties.
- **Consistent IR modeling with Zod:** the discriminated unions make extending the IR straightforward while de-risking generation.
- **Issue propagation & stamping:** helpers like `stampIssues`, `collectWarnings`, and context-aware messages mean you can surface rich diagnostics later.
- **Parser/generator symmetry:** each property folder reads like a mini playbook—ideal for onboarding new contributors.

---

## High-priority fixes (before scaling)

| Priority | Area                     | Issue                                                                                                           | Why it matters                                                                            | Suggested fix                                                                                        |
| -------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 🔴       | `createMultiValueParser` | Successful parses drop accumulated warnings (`issues: []`)                                                      | Warnings from child parsers vanish, so callers think everything is fine                   | Return `issues: allIssues` in the success branch                                                     |
| 🔴       | `createMultiValueParser` | Calls `parseErr("InvalidSyntax", …)` — the "property" field becomes `"InvalidSyntax"`                           | Downstream consumers expect a CSS property name (or undefined), not a diagnostic label    | Replace the first argument with the actual property name (thread it in via config) or `""`           |
| 🟠       | `parseDeclaration`       | `rawValue` flag in `PropertyDefinition` is ignored for non-custom props                                         | Any future property that wants raw strings (e.g., `font-family`) will break               | Add a branch: `if (definition.rawValue) parseResult = unsafeCallParser(definition.parser, value)`    |
| 🟠       | Warning hygiene          | Several helpers (`ensureProperty`, `parseDeclarationList`) re-wrap issues; some do not dedupe messages or paths | You already try to dedupe generator warnings but not uniformly—can cause noisy duplicates | Introduce a tiny `dedupeIssues` utility based on `(code, message, path)` and use it before returning |
| 🟡       | Naming consistency       | `backgroundSizeIRS` (types file) vs other `*IRSchema` names                                                     | Minor, but inconsistency multiplies when you add dozens of modules                        | Rename to `backgroundSizeIRSchema` (or align the rest if you prefer this style)                      |

---

## Medium-term improvements

1. **Registry safeguards**
   - Add an optional `logDuplicate` flag or expose a `register` return boolean to detect accidental double registration early.
   - Expose `propertyRegistry.getAll()` for debugging/telemetry.

2. **`ParseResult` ergonomics**
   - `parseErr` currently forces a `property` string, which tempts uses like `"InvalidSyntax"`. Consider overloading to accept `property?: string`.
   - Provide `linkIssues(property)` helper so you can retrofit context without repeating the spread logic.

3. **Parser ergonomics**
   - For multi-value properties, a reusable `createBackgroundMultiParser("background-repeat", parseFn, aggregateFn)` would reduce boilerplate and inject property names automatically (fixing the `parseErr` misuse above).

4. **Consistent math support**
   - `cssValueToCss` handles `calc-operation`, but consider normalizing parentheses (e.g., adding them when operator precedence demands it) to avoid invalid output when combining expressions.

5. **Testability hooks**
   - Provide pure helpers that (a) parse raw CSS into `csstree.Value`, (b) call property parser/generator, (c) return snapshot-friendly data. This will let you write golden tests for each property quickly.

---

## Scaling to 50+ properties (game plan)

1. **Property scaffolding CLI**
   - `pnpm b new property background-position` → generates `parser.ts`, `generator.ts`, `types.ts`, `definition.ts`, wires exports.
   - Pre-populate with `createMultiValueParser` or `createSingleValueParser` + TODO comments.

2. **Shared mixins**
   - E.g., `createListProperty({ name, itemParser, valueToCss })` to cover the repeating pattern in background-\* properties.
   - Offer optional hooks (`preParse`, `postValidate`) so one-off quirks don't break the abstraction.

3. **Documentation automation**
   - Generate Markdown from property definitions (`name`, `syntax`, `initial`, `inherited`) to keep docs up-to-date as you add modules.

4. **Regression suite**
   - Set up property-driven fixtures: `fixtures/property/background-repeat/*.json` containing `{ css, expect }`.
   - Create a harness that iterates files, runs parse→generate→parse roundtrip, and snapshots `issues`.

5. **IR contract tests**
   - As the IR grows, create a `validatePropertyIR(property, ir)` function driven by the Zod schema so parsers and generators share the same contract.

---

## Automation & tooling opportunities

| Category        | Opportunity                                                                                              | Benefit                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Code generation | Script to update `types.map.ts` by crawling `properties/**/definition.ts`                                | Eliminates manual sync errors (already noted TODO)                      |
| Templates       | `/scripts/scaffold-property.ts` that copies a base template                                              | Ensures new properties start with tests, exports, and consistent naming |
| Validation      | Pre-publish script: parse all property definitions, ensure parser/generator exist, ensure types exported | Catches regression before release                                       |
| Documentation   | Generate README tables from registry (name, initial, inherited)                                          | Stays accurate with zero manual upkeep                                  |
| CI              | Property-specific golden tests, schema snapshots                                                         | Gives confidence when refactoring shared utilities                      |

---

## Quick wins checklist

- [ ] Honor `rawValue` in `parseDeclaration`
- [ ] Fix warnings being dropped in `createMultiValueParser`
- [ ] Replace `"InvalidSyntax"` property strings in `parseErr` calls
- [ ] Add duplicate-registration guard (even a console warn)
- [ ] Rename `backgroundSizeIRS` → `backgroundSizeIRSchema`
- [ ] Add a CLI or script skeleton for scaffolding new properties
- [ ] Automate `types.map.ts` generation

---

## Closing thoughts

You already laid down the hard architectural work; scaling now is about **reducing per-property friction** and **protecting consistency**. Address the correctness gaps, add a bit more automation, and new properties will be almost rote. Happy to dive deeper into scaffolding scripts or regression harnesses if you want concrete implementations next.
