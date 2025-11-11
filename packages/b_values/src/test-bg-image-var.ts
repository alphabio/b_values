// b_path:: packages/b_values/src/test-bg-image-var.ts
import * as decl from "@b/declarations";

console.log(
  JSON.stringify(
    decl.parseDeclarationList(`
    background-image: var(--gradient-overlay), url("pattern.svg"), none;
  `),
    null,
    2,
  ),
);
