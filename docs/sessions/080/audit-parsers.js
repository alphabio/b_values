// b_path:: docs/sessions/080/audit-parsers.js
const fs = require("fs");
const path = require("path");

const PROPERTIES_DIR = "packages/b_declarations/src/properties";

function auditParsersAndGenerators() {
  const properties = fs
    .readdirSync(PROPERTIES_DIR)
    .filter((f) => fs.statSync(path.join(PROPERTIES_DIR, f)).isDirectory());

  const failures = [];

  properties.forEach((prop) => {
    const parserPath = path.join(PROPERTIES_DIR, prop, "parser.ts");
    const generatorPath = path.join(PROPERTIES_DIR, prop, "generator.ts");

    // CHECK PARSER
    if (fs.existsSync(parserPath)) {
      const content = fs.readFileSync(parserPath, "utf8");

      // Check 1: Manual AST Inspection of Dimensions/Numbers
      if (content.includes('.type === "Dimension"') || content.includes('.type === "Number"')) {
        failures.push({
          prop,
          file: "parser.ts",
          issue: "Manual AST inspection of Dimension/Number. Should delegate to Parsers.Length/Number.",
        });
      }

      // Check 2: Manual Hex Parsing
      if (content.includes("#") && content.includes("parse")) {
        // Weak check, but might catch manual hex regex
      }
    }

    // CHECK GENERATOR
    if (fs.existsSync(generatorPath)) {
      const content = fs.readFileSync(generatorPath, "utf8");

      // Check 3: Manual String Concatenation for Units
      // Look for template literals ending in units like `${val}px`
      if (/`\$\{.*\}px`/.test(content) || /`\$\{.*\}%`/.test(content) || /`\$\{.*\}em`/.test(content)) {
        failures.push({
          prop,
          file: "generator.ts",
          issue: "Manual string concatenation for units. Should delegate to Generators.Length/etc.",
        });
      }
    }
  });

  return failures;
}

const results = auditParsersAndGenerators();
console.log(JSON.stringify(results, null, 2));
