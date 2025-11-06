// b_path:: packages/b_values/src/me.ts
// @ts-nocheck
// // DO NOT DELETE THIS FILE. IT IS BY THE USER FOR ADHOC TESTING PURPOSES ONLY.

import * as decl from "@b/declarations";

console.log(
  JSON.stringify(
    decl.parseDeclaration(`
      background-image:
        repeating-conic-gradient(from  at 25% 25%, var(--color-1) 0% 5%, var(--color-4) 5% 10%);
`),
    null,
    2,
  ),
);
