// b_path:: docs/sessions/080/audit-units.js
const fs = require("fs");
const path = require("path");

const PROPERTIES_DIR = "packages/b_declarations/src/properties";

function auditUnitsAndValues() {
  const properties = fs
    .readdirSync(PROPERTIES_DIR)
    .filter((f) => fs.statSync(path.join(PROPERTIES_DIR, f)).isDirectory());

  const failures = [];

  properties.forEach((prop) => {
    const typesPath = path.join(PROPERTIES_DIR, prop, "types.ts");
    const definitionPath = path.join(PROPERTIES_DIR, prop, "definition.ts");

    if (fs.existsSync(definitionPath) && fs.existsSync(typesPath)) {
      const defContent = fs.readFileSync(definitionPath, "utf8");
      const typesContent = fs.readFileSync(typesPath, "utf8");

      // Check if property accepts length/percentage/number
      const acceptsUnits = /<length|percentage|number|angle|time>/.test(defContent);

      if (acceptsUnits) {
        // If it accepts units, it MUST use CssValue in types.ts
        if (!typesContent.includes("CssValue")) {
          failures.push({ prop, file: "types.ts", issue: "Property accepts units but does not import CssValue." });
        }
      }
    }
  });

  return failures;
}

const results = auditUnitsAndValues();
console.log(JSON.stringify(results, null, 2));
