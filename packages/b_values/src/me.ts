// b_path:: packages/b_values/src/me.ts
// DO NOT DELETE THIS FILE. IT IS BY THE USER FOR ADHOC TESTING PURPOSES ONLY.

import * as decl from "@b/declarations";

console.log(
  decl.parseDeclaration(
    "background-image: radial-gradient(rgba(255,255,255,0) 0, rgba(255,255,255,.15) 30%, rgba(255,255,255,.3) 32%, rgba(255,255,255,0) 33%) 0 0",
  ).value?.ir,
);

// import * as gen from "@b/generators";

// console.log(
//   gen.Color.generate({
//     kind: "hsl",
//     h: {
//       kind: "calc",
//       value: {
//         kind: "calc-operation",
//         operator: "+",
//         left: { kind: "variable", name: "--a" },
//         right: {
//           kind: "calc-operation",
//           operator: "-",
//           left: { kind: "literal", value: 10, unit: "deg" },
//           right: { kind: "literal", value: 0, unit: "deg" },
//         },
//       },
//     },
//     s: { kind: "url", url: "https://example.com/saturation" },
//     l: { kind: "literal", value: 50, unit: "%" },
//     alpha: { kind: "literal", value: 0.5 },
//   }),
// );
