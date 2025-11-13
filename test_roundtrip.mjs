import { parseDeclaration, generateDeclaration } from "./packages/b_declarations/dist/index.js";

const tests = [
  "padding-top: 10px",
  "padding-top: 2rem",
  "margin-top: auto",
  "margin-top: 0",
  "border-top-width: thin",
  "border-top-width: 2px",
  "border-top-left-radius: 5px",
  "border-top-left-radius: 10px 20px"
];

console.log("🔍 Testing parse → generate round-trip\n");

for (const css of tests) {
  const parsed = parseDeclaration(css);
  
  if (!parsed.ok) {
    console.log(`❌ ${css}`);
    console.log(`   Parse failed: ${JSON.stringify(parsed.issues)}`);
    continue;
  }
  
  const generated = generateDeclaration(parsed.value);
  
  if (!generated.ok) {
    console.log(`❌ ${css}`);
    console.log(`   Generate failed: ${JSON.stringify(generated.issues)}`);
    continue;
  }
  
  console.log(`✅ ${css} → ${generated.value}`);
}
