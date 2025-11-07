// Comprehensive test to understand source context enrichment
import * as decl from "@b/declarations";

console.log("=" .repeat(80));
console.log("UNDERSTANDING SOURCE CONTEXT ENRICHMENT");
console.log("=".repeat(80));

console.log("\n📍 SCENARIO 1: Parser detects syntax error with AST location");
console.log("-".repeat(80));
const test1 = decl.parseDeclaration("background-image: linear-gradient(to invalid-direction, red, blue)");
console.log("Input: background-image: linear-gradient(to invalid-direction, red, blue)");
console.log("\nResult:");
console.log(JSON.stringify(test1, null, 2));
console.log("\n✅ Expected: Parser error should have location → sourceContext added");
console.log(`📊 Has location? ${test1.issues[0]?.location ? 'YES' : 'NO'}`);
console.log(`📊 Has sourceContext? ${test1.issues[0]?.sourceContext ? 'YES' : 'NO'}`);
console.log(`📊 Has property? ${test1.issues[0]?.property ? 'YES (' + test1.issues[0]?.property + ')' : 'NO'}`);

console.log("\n\n📍 SCENARIO 2: Generator validation error (deep in IR)");
console.log("-".repeat(80));
const test2 = decl.parseDeclaration(`
  background-image: linear-gradient(red, notacolor, blue)
`);
console.log("Input: linear-gradient(red, notacolor, blue)");
console.log("\nResult:");
console.log(JSON.stringify(test2, null, 2));
console.log("\n⚠️  Expected: Generator error has path but NO location → NO sourceContext");
console.log(`📊 Has location? ${test2.issues[0]?.location ? 'YES' : 'NO'}`);
console.log(`📊 Has sourceContext? ${test2.issues[0]?.sourceContext ? 'YES' : 'NO'}`);
console.log(`📊 Has property? ${test2.issues[0]?.property ? 'YES (' + test2.issues[0]?.property + ')' : 'NO'}`);
console.log(`📊 Has path? ${test2.issues[0]?.path ? 'YES (deep IR validation)' : 'NO'}`);

console.log("\n\n📍 SCENARIO 3: Multi-value with parse error in one segment");
console.log("-".repeat(80));
const test3 = decl.parseDeclaration(`
  background-image: url(a.png), linear-gradient(red blue green), url(b.png)
`);
console.log("Input: url(a.png), linear-gradient(red blue green), url(b.png)");
console.log("\nResult:");
console.log(JSON.stringify(test3, null, 2));
console.log("\n⚠️  Expected: Multi-value parser uses string-split → NO location → NO sourceContext");
console.log(`📊 Has location? ${test3.issues[0]?.location ? 'YES' : 'NO'}`);
console.log(`📊 Has sourceContext? ${test3.issues[0]?.sourceContext ? 'YES' : 'NO'}`);
console.log(`📊 Has property? ${test3.issues[0]?.property ? 'YES (' + test3.issues[0]?.property + ')' : 'NO'}`);

console.log("\n\n" + "=".repeat(80));
console.log("SUMMARY");
console.log("=".repeat(80));
console.log(`
✅ property enrichment: ALWAYS added (all scenarios have it)
✅ sourceContext enrichment: Only when issue has location data
❌ Multi-value parsers: Use string-split, no AST, no location
❌ Generator validation: Deep IR checks, no original source location

Why no location in your example?
---------------------------------
Your test: linear-gradient(red, notacolor, blue)

1. Parser phase:
   - Splits by comma: ["red", "notacolor", "blue"] (string split, no AST!)
   - Each segment parsed individually
   - "notacolor" parses as named color (valid syntax)
   - Parser succeeds! ✅ ok: true

2. Generator phase:
   - Validates IR: checks if "notacolor" is valid CSS color
   - Generator finds it's invalid ❌
   - Creates issue with path: ["layers", 1, "gradient", "colorStops", 0, "color", "name"]
   - But NO location (no reference back to original source position)

Result: You get property ✅ but NO sourceContext ❌

How to get sourceContext?
--------------------------
Need parse-time AST errors, like:
- linear-gradient(to invalid-direction, red, blue)  ← Parser detects bad direction
- rgb(999 999 999)  ← Single-value parser with AST
`);
