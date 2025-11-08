import * as decl from "@b/declarations";

console.log("=== background-size (works) ===");
console.log(JSON.stringify(decl.parseDeclaration("background-size: var(--size)"), null, 2));

console.log("\n=== background-clip (fails) ===");
console.log(JSON.stringify(decl.parseDeclaration("background-clip: var(--clip)"), null, 2));

console.log("\n=== background-repeat (fails) ===");
console.log(JSON.stringify(decl.parseDeclaration("background-repeat: var(--repeat)"), null, 2));
