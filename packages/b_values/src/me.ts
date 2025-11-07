// b_path:: packages/b_values/src/me.ts
// @ts-nocheck
// // DO NOT DELETE THIS FILE. IT IS BY THE USER FOR ADHOC TESTING PURPOSES ONLY.

import * as decl from "@b/declarations";

console.log(
  JSON.stringify(
    decl.generateDeclaration({
      property: "background-image",
      ir: [
        {
          type: "Gradient",
          kind: "linear",
          direction: { type: "Angle", value: 45, unit: "deg" },
          stops: [
            { color: { type: "Color", format: "named", value: "red" } },
            { color: { type: "Color", format: "named", value: "blue" } },
          ],
        },
        {
          type: "Gradient",
          kind: "radial",
          shape: "ellipse",
          size: "farthest-corner",
          position: {
            x: { type: "Percentage", value: 20 },
            y: { type: "Length", value: 20, unit: "px" },
          },
          stops: [
            { color: { type: "Color", format: "rgb", r: 0, g: 0, b: 0, a: 0.5 } },
            { color: { type: "Color", format: "named", value: "transparent" } },
          ],
        },
      ],
      original:
        "linear-gradient(to 45deg, red, blue), radial-gradient(ellipse farthest-corner at top 20px left 20px, rgba(0, 0, 0, 0.5), transparent)",
    }),
    null,
    2,
  ),
);

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

// console.log(
//   JSON.stringify(
//     decl.parseDeclaration(`
//   background-image:
//     radial-gradient(
//       farthest-corner at calc(100% - 20px) 30%,
//       oklch(80% 0.3 150),
//       transparent
//     ),

//     conic-gradient(
//       from 0.25turn at center,
//       #ff0000,
//       gold 15%,
//       #0000ff 15% 30%, /* Hard stop */
//       lime 50%
//     ),

//     linear-gradient(
//       in oklab 135deg,
//       hsl(200 100% 50% / 0.8),
//       color(display-p3 1 0.5 0 / 0.2) 75%
//     ),

//     url("data:image/svg+xml,...");
// `),
//     null,
//     2,
//   ),
// );

// console.log(
//   JSON.stringify(
//     decl.parseDeclaration(`
//   background-image:
//     radial-gradient(
//       farthest-corner at calc(100% - 20px) 30%,
//       oklch(80% 0.3 150),
//       transparent
//     ),

//     conic-gradient(
//       from 0.25turn at center,
//       #ff0000,
//       gold 15%,
//       #0000ff 15% 30%, /* Hard stop */
//       lime 50%
//     ),

//     linear-gradient(
//       in oklab 135deg,
//       hsl(200 100% 50% / 0.8),
//       color(display-p3 1 0.5 0 / 0.2) 75%
//     ),

//     url("data:image/svg+xml,...");
// `),
//     null,
//     2,
//   ),
// );

// console.log(
//   JSON.stringify(
//     decl.parseDeclaration(`
//   background-image:
//     linear-gradient(
//       to top left,
//       red 10%,
//       30%,
//       yellow,
//       blue 90%
//     ),
//     radial-gradient(
//       ellipse at top 20px left 15%,
//       rgba(0, 0, 0, 0.5),
//       transparent
//     );
// `),
//     null,
//     2,
//   ),
// );

console.log("=== Testing just the radial gradient ===");
console.log(
  JSON.stringify(
    decl.parseDeclaration(`
  background-image:
    radial-gradient(
      10em 20%,
      at center,
      notacolor,
      transparent calc(50% / 20px)
    );
  `),
    null,
    2,
  ),
);

console.log("\n=== Testing all four gradients ===");
console.log(
  JSON.stringify(
    decl.parseDeclaration(`
  background-image:
   linear-gradient(
      blue,
      25%,
      yellow 50%,
      75%,
      green
    ),

    linear-gradient(to 45deg, red, blue),


    radial-gradient(
      10em 20%,
      at center,
      notacolor,
      transparent calc(50% / 20px)
    ),

    conic-gradient(
      from -100grad,
      hsl(50 100% 50% / 0.5) 0%,
      hsl(100 100% 50% / 0.9) 12.5%,
      hsl(150 100% 50%) 100%
    );
  `),
    null,
    2,
  ),
);

//     radial-gradient(
//       10em 20%,
//       at center,
//       notacolor,
//       transparent calc(50% & 20px)
//     ),

//     radial-gradient(
//       10em 20%,
//       at center,
//       notacolor,
//       transparent calc(50% / 20px)
//     ),

//     conic-gradient(
//       from -100grad,
//       hsl(50 100% 50% / 0.5) 0%,
//       hsl(100 100% 50% / 0.9) 12.5%,
//       hsl(150 100% 50%) 100%
//     );
//   `),
//     null,
//     2,
//   ),
// );

// console.log(
//   JSON.stringify(
//     decl.parseDeclaration(`
//   background-image:
//    linear-gradient(to 45deg, red, blue)
//    linear-gradient(
//       blue,
//       25%,
//       yellow 50%,
//       75%,
//       green
//     )
//   `),
//     null,
//     2,
//   ),
// );
