// b_path:: docs/sessions/080/audit-keywords.js
const fs = require("fs");
const path = require("path");

const PROPERTIES_DIR = "packages/b_declarations/src/properties";
const KEYWORDS_DIR = "packages/b_keywords/src";

function auditKeywordsAndTypes() {
  const properties = fs
    .readdirSync(PROPERTIES_DIR)
    .filter((f) => fs.statSync(path.join(PROPERTIES_DIR, f)).isDirectory());

  const failures = [];

  properties.forEach((prop) => {
    const typesPath = path.join(PROPERTIES_DIR, prop, "types.ts");
    const parserPath = path.join(PROPERTIES_DIR, prop, "parser.ts");

    if (fs.existsSync(typesPath)) {
      const content = fs.readFileSync(typesPath, "utf8");

      // Check 1: Local Enums (z.union/z.enum in types.ts)
      // Exception: "kind" discriminators are allowed
      if ((content.includes("z.union([") || content.includes("z.enum([")) && !content.includes("// b_ignore_audit")) {
        // Naive check, might flag valid discriminated unions if not careful.
        // But we want to flag suspicious things.
        // Actually, z.union is used for the IR definition itself (keyword | value).
        // We want to find *string literal unions* that look like keywords.

        // Look for z.literal("foo") inside a union that ISN'T the main IR union
        // This is hard to regex perfectly, but let's look for multiple z.literal lines
        const literalCount = (content.match(/z\.literal\("/g) || []).length;
        if (literalCount > 5) {
          // Arbitrary threshold: >5 literals usually means a local keyword enum
          failures.push({
            prop,
            file: "types.ts",
            issue: "Potential local enum defined (high literal count). Should be in @b/keywords?",
          });
        }
      }

      // Check 2: Schema Naming (import *Schema)
      if (content.includes("import") && content.includes("@b/keywords")) {
        // Check if imports from keywords end in 'Schema' or are 'cssWide'
        // This is hard to enforce strictly via regex without parsing AST,
        // but we can check if we use `Keywords.foo` instead of `Keywords.fooSchema`
        // Actually, the Gold Standard says "Schema Naming: camelCase + Schema suffix".
        // Let's check if we are using `z.infer<typeof ...>`
        if (!content.includes("z.infer<typeof")) {
          failures.push({ prop, file: "types.ts", issue: "Missing z.infer<typeof ...> pattern" });
        }
      }
    }
  });

  return failures;
}

const results = auditKeywordsAndTypes();
console.log(JSON.stringify(results, null, 2));
