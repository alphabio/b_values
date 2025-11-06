// b_path:: packages/b_values/src/me.ts
// @ts-nocheck
// // DO NOT DELETE THIS FILE. IT IS BY THE USER FOR ADHOC TESTING PURPOSES ONLY.

import * as decl from "@b/declarations";

// console.log(
//   JSON.stringify(
//     decl.parseDeclaration(`
//       background-image:
//         repeating-conic-gradient(from var(--angle) at 25% 25%, var(--color-1) calc(5 * var(--angle)) 5%, var(--color-4) 5% 10%);
// `),
//     null,
//     2,
//   ),
// );

console.log(
  JSON.stringify(
    decl.parseDeclaration(`
  background-image:
    radial-gradient(
      farthest-corner at calc(100% - 20px) 30%,
      oklch(80% 0.3 150),
      transparent
    ),

    conic-gradient(
      from 0.25turn at center,
      #ff0000,
      gold 15%,
      #0000ff 15% 30%, /* Hard stop */
      lime 50%
    ),

    linear-gradient(
      in oklab 135deg,
      hsl(200 100% 50% / 0.8),
      color(display-p3 1 0.5 0 / 0.2) 75%
    ),

    url("data:image/svg+xml,...");
`),
    null,
    2,
  ),
);
