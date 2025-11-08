#!/usr/bin/env tsx
/** biome-ignore-all lint/suspicious/noConsole: not a code file */

// b_path:: scripts/new-property.ts
//
// Deterministic scaffolder for @b/* CSS properties.
//
// Scope (v1):
// - Works with your existing stack (tsx-run TS, generate-property-ir-map).
// - Creates aligned scaffolding in:
//     - packages/b_parsers
//     - packages/b_generators
//     - packages/b_declarations
// - Wires declarations through defineProperty.
// - Adds a standardized property test harness + per-property test.
// - Respects existing architecture: parsers in @b_parsers, generators in @b_generators,
//   declarations as glue, PropertyIRMap via generate:property-ir-map.
//
// Usage examples:
//
//   pnpm new-prop background-color \
//     --mode single \
//     --syntax "<color>" \
//     --initial transparent \
//     --inherited false \
//     --ir BackgroundColorIR
//
//   pnpm new-prop font-family \
//     --mode multi \
//     --syntax "<family-name>#” \
//     --initial system-ui \
//     --inherited true \
//     --ir FontFamilyIR
//
//   pnpm new-prop background-blend-mode \
//     --from background-clip \
//     --ir BackgroundBlendModeIR
//
// Notes:
// - Does NOT edit types.map.ts directly. After running, use your existing:
//     pnpm generate:property-ir-map
//   to regenerate PropertyIRMap.
// - `--from` clones an existing property's files across declarations/parsers/generators
//   as a starting point, with mechanical renames.
// - Generated stubs include TODOs and are intentionally explicit, not magic.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

type Mode = "single" | "multi" | "raw";

interface Options {
  name: string; // new CSS property name, e.g. "background-color"
  from?: string; // existing property to clone from, e.g. "background-size"
  mode: Mode;
  syntax: string;
  inherited: boolean;
  initial: string;
  irName: string; // e.g. "BackgroundColorIR"
  keywords?: string[]; // optional keyword list scaffold hint
}

function usage(): never {
  console.error(
    [
      "Usage:",
      "  pnpm new-prop <css-property-name> [--from existing-property]",
      "                        [--mode single|multi|raw]",
      '                        [--syntax "<syntax>"]',
      "                        [--inherited true|false]",
      "                        [--initial value]",
      "                        [--ir NameIR]",
      '                        [--keywords "k1|k2|k3"]',
      "",
      "Examples:",
      '  pnpm new-prop background-color --mode single --syntax "<color>" --initial transparent --ir BackgroundColorIR',
      '  pnpm new-prop font-family --mode multi --syntax "<family-name>#” --initial system-ui --inherited true --ir FontFamilyIR',
      "  pnpm new-prop background-blend-mode --from background-clip --ir BackgroundBlendModeIR",
    ].join("\n"),
  );
  process.exit(1);
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  if (args.length === 0) usage();

  const name = args[0];
  if (!name || name.startsWith("-")) usage();

  let from: string | undefined;
  let mode: Mode = "single";
  let syntax = "<custom>";
  let inherited = false;
  let initial = "initial";
  let irName = toIRName(name);
  const keywords: string[] = [];

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === "--from" && args[i + 1]) {
      from = args[++i];
    } else if (a === "--mode" && args[i + 1]) {
      const m = args[++i] as Mode;
      if (!["single", "multi", "raw"].includes(m)) {
        console.error(`Invalid --mode: ${m}`);
        process.exit(1);
      }
      mode = m;
    } else if (a === "--syntax" && args[i + 1]) {
      syntax = args[++i];
    } else if (a === "--inherited" && args[i + 1]) {
      inherited = args[++i] === "true";
    } else if (a === "--initial" && args[i + 1]) {
      initial = args[++i];
    } else if (a === "--ir" && args[i + 1]) {
      irName = args[++i];
    } else if (a === "--keywords" && args[i + 1]) {
      keywords.push(
        ...args[++i]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }

  return {
    name,
    from,
    mode,
    syntax,
    inherited,
    initial,
    irName,
    keywords: keywords.length ? keywords : undefined,
  };
}

function toPascalCase(name: string): string {
  return name
    .split(/[-_]/g)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function toIRName(name: string): string {
  return `${toPascalCase(name)}IR`;
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileIfAbsent(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    console.error(`SKIP (exists): ${filePath}`);
    return;
  }
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`CREATE ${filePath}`);
}

function _readIfExists(filePath: string): string | undefined {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : undefined;
}

function appendExportToIndex(indexPath: string, relPath: string) {
  if (!fs.existsSync(indexPath)) return;
  let src = fs.readFileSync(indexPath, "utf8");
  const exportLine = `export * from "./${relPath}";`;
  if (!src.includes(exportLine)) {
    src = `${src.replace(/\s*$/s, "")}\n${exportLine}\n`;
    fs.writeFileSync(indexPath, src, "utf8");
    console.log(`UPDATE ${indexPath}`);
  }
}

/**
 * Clone an existing property's implementations across:
 * - b_parsers
 * - b_generators
 * - b_declarations
 * applying mechanical renames.
 */
function cloneFromExisting(opts: Options): boolean {
  const { from, name, irName } = opts;
  if (!from) return false;

  const srcProp = from;
  const dstProp = name;

  const srcFolder = srcProp.replace(/_/g, "-");
  const dstFolder = dstProp.replace(/_/g, "-");

  const srcPascal = toPascalCase(srcProp);
  const dstPascal = toPascalCase(dstProp);

  const srcIR = toIRName(srcProp);
  const dstIR = irName;

  // b_declarations
  const declBase = path.resolve("packages/b_declarations/src/properties");
  const srcDeclDir = path.join(declBase, srcFolder);
  const dstDeclDir = path.join(declBase, dstFolder);

  if (!fs.existsSync(srcDeclDir)) {
    console.error(`--from: declarations source folder not found: ${srcDeclDir}`);
    process.exit(1);
  }

  if (fs.existsSync(dstDeclDir)) {
    console.error(`Target declarations folder already exists: ${dstDeclDir}`);
    process.exit(1);
  }

  ensureDir(dstDeclDir);

  for (const f of fs.readdirSync(srcDeclDir)) {
    if (!f.endsWith(".ts")) continue;
    const srcFile = path.join(srcDeclDir, f);
    const dstFile = path.join(dstDeclDir, f.replace(srcFolder, dstFolder));
    let content = fs.readFileSync(srcFile, "utf8");

    content = content.replace(new RegExp(srcIR, "g"), dstIR);
    content = content.replace(new RegExp(srcProp, "g"), dstProp);
    content = content.replace(new RegExp(srcPascal, "g"), dstPascal);

    fs.writeFileSync(dstFile, content, "utf8");
    console.log(`CREATE ${dstFile} (from ${srcFile})`);
  }

  // b_parsers (optional, best-effort)
  const parsersBase = path.resolve("packages/b_parsers/src");
  if (fs.existsSync(parsersBase)) {
    // heuristic: look for files containing srcProp in name or content
    const guess = path.join(parsersBase, `${srcProp}.ts`);
    if (fs.existsSync(guess)) {
      const dst = path.join(parsersBase, `${dstProp}.ts`);
      if (!fs.existsSync(dst)) {
        let content = fs.readFileSync(guess, "utf8");
        content = content.replace(new RegExp(srcIR, "g"), dstIR);
        content = content.replace(new RegExp(srcProp, "g"), dstProp);
        content = content.replace(new RegExp(srcPascal, "g"), dstPascal);
        fs.writeFileSync(dst, content, "utf8");
        console.log(`CREATE ${dst} (from ${guess})`);
      }
    }
  }

  // b_generators (optional, best-effort)
  const generatorsBase = path.resolve("packages/b_generators/src");
  if (fs.existsSync(generatorsBase)) {
    const guess = path.join(generatorsBase, `${srcProp}.ts`);
    if (fs.existsSync(guess)) {
      const dst = path.join(generatorsBase, `${dstProp}.ts`);
      if (!fs.existsSync(dst)) {
        let content = fs.readFileSync(guess, "utf8");
        content = content.replace(new RegExp(srcIR, "g"), dstIR);
        content = content.replace(new RegExp(srcProp, "g"), dstProp);
        content = content.replace(new RegExp(srcPascal, "g"), dstPascal);
        fs.writeFileSync(dst, content, "utf8");
        console.log(`CREATE ${dst} (from ${guess})`);
      }
    }
  }

  return true;
}

// ---------- Fresh scaffolding templates (used when --from not provided) ----------

function genTypesContent(opts: Options): string {
  const { irName, keywords, name } = opts;

  if (keywords && keywords.length > 0) {
    return `import { z } from "zod";

/**
 * IR for ${name}.
 * Keyword union scaffold. Prefer mapping to @b/keywords where appropriate.
 */
export const ${irName}Schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: z.union([
${keywords.map((k) => `      z.literal("${k}"),`).join("\n")}
    ]),
  }),
]);

export type ${irName} = z.infer<typeof ${irName}Schema>;
`;
  }

  return `import { z } from "zod";

/**
 * IR for ${name}.
 * TODO: refine schema (consider shared components).
 */
export const ${irName}Schema = z.any();

export type ${irName} = z.infer<typeof ${irName}Schema>;
`;
}

function genParsersPackageContent(opts: Options): string {
  const { name, mode, irName } = opts;
  const pascal = toPascalCase(name);

  if (mode === "multi") {
    // Multi-value: encourage using shared helpers later.
    return `import type { ParseResult } from "@b/types";
import type { ${irName} } from "@b/declarations";
import type * as csstree from "@eslint/css-tree";

/**
 * Parser for ${name} into ${irName}.
 * TODO: implement using css-tree AST and shared utils.
 */
export function parse${pascal}(node: csstree.Value): ParseResult<${irName}> {
  return {
    ok: false,
    issues: [{
      code: "invalid-value",
      message: "Parser for ${name} not implemented",
      severity: "error",
    }],
  };
}
`;
  }

  if (mode === "raw") {
    return `import type { ParseResult } from "@b/types";
import type { ${irName} } from "@b/declarations";

/**
 * Raw parser for ${name}.
 */
export function parse${pascal}(value: string): ParseResult<${irName}> {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      ok: false,
      issues: [{
        code: "invalid-value",
        message: "Value cannot be empty",
        severity: "error",
      }],
    };
  }
  // TODO: map raw string into ${irName}.
  return {
    ok: true,
    value: trimmed as unknown as ${irName},
    issues: [],
  };
}
`;
  }

  // single
  return `import type { ParseResult } from "@b/types";
import type { ${irName} } from "@b/declarations";
import type * as csstree from "@eslint/css-tree";

/**
 * Parser for ${name} into ${irName}.
 * TODO: implement AST-based parsing.
 */
export function parse${pascal}(node: csstree.Value): ParseResult<${irName}> {
  return {
    ok: false,
    issues: [{
      code: "invalid-value",
      message: "Parser for ${name} not implemented",
      severity: "error",
    }],
  };
}
`;
}

function genGeneratorsPackageContent(opts: Options): string {
  const { name, irName } = opts;
  const pascal = toPascalCase(name);

  return `import type { ${irName} } from "@b/declarations";
import { generateOk, type GenerateResult } from "@b/types";

/**
 * Generator for ${name} from ${irName}.
 * Returns only the value; wrapper adds "property: value".
 */
export function generate${pascal}(ir: ${irName}): GenerateResult {
  // TODO: implement based on IR.
  return generateOk(String(ir));
}
`;
}

function genDeclParserWrapper(opts: Options): string {
  const { name } = opts;
  const pascal = toPascalCase(name);
  return `import type { ParseResult } from "@b/types";
import type { ${toIRName(name)} } from "./types";
import * as Parsers from "@b/parsers";

/**
 * Declaration-level parser for ${name}.
 * Delegates to @b/parsers implementation.
 */
export function parse${pascal}(value: string): ParseResult<${toIRName(name)}> {
  // TODO: if @b/parsers exposes a specific entry, delegate to it.
  // Placeholder: call a hypothetical parse function or leave to be wired.
  return Parsers.parse${pascal}(
    // @ts-expect-error placeholder until wired
    value,
  ) as unknown as ParseResult<${toIRName(name)}>;
}
`;
}

function genDeclGeneratorWrapper(opts: Options): string {
  const { name } = opts;
  const pascal = toPascalCase(name);
  return `import type { ${toIRName(name)} } from "./types";
import type { GenerateResult } from "@b/types";
import * as Generators from "@b/generators";

/**
 * Declaration-level generator for ${name}.
 * Delegates to @b/generators; returns value-only result.
 */
export function generate${pascal}(ir: ${toIRName(name)}): GenerateResult {
  // TODO: if @b/generators exposes a specific entry, delegate to it.
  return Generators.generate${pascal}(
    // @ts-expect-error placeholder until wired
    ir as any,
  ) as GenerateResult;
}
`;
}

function genDefinitionContent(opts: Options): string {
  const { name, syntax, mode, inherited, initial, irName } = opts;
  const pascal = toPascalCase(name);
  const multiValue = mode === "multi";
  const rawValue = mode === "raw";

  const flags: string[] = [];
  if (multiValue) flags.push("multiValue: true");
  if (rawValue) flags.push("rawValue: true");

  const flagsBlock = flags.length ? `  ${flags.join(",\n  ")},\n` : "";

  return `import { defineProperty } from "../../core/registry";
import { parse${pascal} } from "./parser";
import { generate${pascal} } from "./generator";
import type { ${irName} } from "./types";

/**
 * ${name} property definition.
 * Generated by scripts/new-property.ts; refine as needed.
 */
export const ${pascal}Definition = defineProperty<${irName}>({
  name: "${name}",
  syntax: "${syntax}",
  inherited: ${inherited},
  initial: "${initial}",
${flagsBlock}  parser: parse${pascal},
  generator: generate${pascal},
});
`;
}

function genTestHarness(): string {
  return `import { parseDeclaration, generateDeclaration } from "@b/declarations";

function norm(s: string): string {
  return s.trim().replace(/\\s+/g, " ");
}

interface RoundtripCase {
  css: string;
  expectCss?: string;
}

interface ParseCase<TIR = unknown> {
  css: string;
  expectOk: boolean;
  irContains?: Partial<TIR>;
}

interface GenerateCase<TIR = unknown> {
  property: string;
  ir: TIR;
  expectOk: boolean;
  expectValue?: string;
}

/**
 * Shared standardized tests for a property.
 * Keeps expectations consistent across all properties.
 */
export function runPropertyTests<TIR>(opts: {
  property: string;
  parse?: ParseCase<TIR>[];
  generate?: GenerateCase<TIR>[];
  roundtrip?: RoundtripCase[];
}) {
  const { property } = opts;

  if (opts.parse?.length) {
    describe(\`\${property} parse\`, () => {
      for (const c of opts.parse!) {
        it(c.css, () => {
          const res = parseDeclaration(c.css);
          if (c.expectOk) {
            expect(res.ok).toBe(true);
            if (!res.ok) {
              // eslint-disable-next-line no-console
              console.error(res.issues);
              return;
            }
            if (c.irContains) {
              expect((res as any).value.ir).toMatchObject(c.irContains);
            }
          } else {
            expect(res.ok).toBe(false);
          }
        });
      }
    });
  }

  if (opts.generate?.length) {
    describe(\`\${property} generate\`, () => {
      for (const c of opts.generate!) {
        it(JSON.stringify(c.ir), () => {
          const res = generateDeclaration({
            property: c.property as any,
            ir: c.ir as any,
          });
          if (c.expectOk) {
            expect(res.ok).toBe(true);
            if (!res.ok) {
              // eslint-disable-next-line no-console
              console.error(res.issues);
              return;
            }
            if (c.expectValue) {
              expect(norm(res.value)).toBe(norm(c.expectValue));
            }
          } else {
            expect(res.ok).toBe(false);
          }
        });
      }
    });
  }

  if (opts.roundtrip?.length) {
    describe(\`\${property} roundtrip\`, () => {
      for (const c of opts.roundtrip!) {
        it(c.css, () => {
          const parsed = parseDeclaration(c.css);
          expect(parsed.ok).toBe(true);
          if (!parsed.ok) {
            // eslint-disable-next-line no-console
            console.error(parsed.issues);
            return;
          }
          const gen = generateDeclaration({
            property: property as any,
            ir: (parsed as any).value.ir,
          });
          expect(gen.ok).toBe(true);
          if (!gen.ok) {
            // eslint-disable-next-line no-console
            console.error(gen.issues);
            return;
          }
          const expected = c.expectCss ?? c.css;
          expect(norm(gen.value)).toBe(norm(expected));
        });
      }
    });
  }
}
`;
}

function genPropertyTest(opts: Options): string {
  const { name, irName } = opts;
  const pascal = toPascalCase(name);

  return `import type { ${irName} } from "./types";
import { runPropertyTests } from "../../test/property-test-utils";

/**
 * Baseline tests for ${name}.
 * Fill in parse/generate/roundtrip cases as implementation matures.
 */
runPropertyTests<${irName}>({
  property: "${name}",
  parse: [
    // { css: "${name}: ${pascal}", expectOk: false },
  ],
  generate: [
    // { property: "${name}", ir: {} as ${irName}, expectOk: false },
  ],
  roundtrip: [
    // { css: "${name}: ${pascal}" },
  ],
});
`;
}

function ensureTestUtils() {
  const base = path.resolve("packages/b_declarations/test");
  ensureDir(base);
  const utilsPath = path.join(base, "property-test-utils.ts");
  if (!fs.existsSync(utilsPath)) {
    fs.writeFileSync(utilsPath, genTestHarness(), "utf8");
    console.log(`CREATE ${utilsPath}`);
  }
}

async function run() {
  const opts = parseArgs();

  // Ensure shared test harness
  ensureTestUtils();

  // Attempt clone-from-existing across packages
  const cloned = !!opts.from && cloneFromExisting(opts);

  const declBase = path.resolve("packages/b_declarations/src/properties");
  const parsersBase = path.resolve("packages/b_parsers/src");
  const generatorsBase = path.resolve("packages/b_generators/src");

  const folderName = opts.name.replace(/_/g, "-");
  const declDir = path.join(declBase, folderName);

  if (!cloned) {
    // Fresh scaffolding across packages

    // 1) IR types in declarations
    ensureDir(declDir);
    writeFileIfAbsent(path.join(declDir, "types.ts"), genTypesContent(opts));

    // 2) Parsers package stub
    ensureDir(parsersBase);
    const parsersFile = path.join(parsersBase, `${folderName}.ts`);
    writeFileIfAbsent(parsersFile, genParsersPackageContent(opts));

    // 3) Generators package stub
    ensureDir(generatorsBase);
    const generatorsFile = path.join(generatorsBase, `${folderName}.ts`);
    writeFileIfAbsent(generatorsFile, genGeneratorsPackageContent(opts));

    // 4) Declaration wrappers delegating to parsers/generators
    writeFileIfAbsent(path.join(declDir, "parser.ts"), genDeclParserWrapper(opts));
    writeFileIfAbsent(path.join(declDir, "generator.ts"), genDeclGeneratorWrapper(opts));
    writeFileIfAbsent(path.join(declDir, "definition.ts"), genDefinitionContent(opts));
    writeFileIfAbsent(
      path.join(declDir, "index.ts"),
      `export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
`,
    );
  }

  // 5) Property-specific tests (for both cloned and fresh)
  const testFile = path.join(declDir, `${folderName}.test.ts`);
  writeFileIfAbsent(testFile, genPropertyTest(opts));

  // 6) Wire declarations barrel
  const declIndex = path.join(declBase, "index.ts");
  appendExportToIndex(declIndex, folderName);

  console.log("");
  console.log("Scaffold complete.");
  console.log("Next steps:");
  console.log("- Implement IR schema, parser, and generator logic for this property.");
  console.log("- Run: pnpm generate:property-ir-map");
  console.log("- Run: pnpm test --filter @b/declarations (or equivalent) to validate.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
