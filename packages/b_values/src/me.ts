// b_path:: packages/b_values/src/me.ts
// // b_path:: packages/b_values/src/me.ts
// // DO NOT DELETE THIS FILE. IT IS BY THE USER FOR ADHOC TESTING PURPOSES ONLY.

import * as decl from "@b/declarations";
// import * as gen from "@b/generators";
// import * as utils from "@b/utils";
// import { z } from "zod";

// // console.log(utils.validate("color: rgb(255, 'a0', 0)"));

// // process.exit(0);

// // const schema = z.object({
// //   kind: z.literal("named"),
// //   name: z.string({
// //     message: 'The "name" property must be a string.',
// //   }),
// // });

// // console.log(schema.safeParse({ kind: "named" }).error);
// // const lit = (value: number) => ({ kind: "literal" as const, value });
// // console.log(gen.Color.Rgb.generate({ kind: "rgb", r: lit(255), g: lit(0), b: lit(0) }));

// // console.log(gen.Color.Named.generate({ kind: "named", names: "red" }));
// // process.exit(0);

// // console.log(decl.parseDeclaration("background-image: linear-gradient(redss, blue)"));

// // import * as exp from "b_short";

console.log(
  decl.generateDeclaration({
    property: "background-image",
    ir: {
      kind: "layers",
      layers: [
        {
          kind: "gradient",
          gradient: {
            kind: "radial",
            repeating: false,
            shape: "circle",
            size: { kind: "keyword", value: "closest-side" },
            position: {
              horizontal: { value: 0, unit: "%" },
              vertical: { value: 0, unit: "%" },
            },
            colorStops: [
              {
                color: {
                  kind: "rgb",
                  r: { kind: "literal", value: 255 },
                  g: { kind: "literal", value: 255 },
                  b: { kind: "literal", value: 255 },
                },
              },
              {
                color: {
                  kind: "named",
                  name: "notacolor" as any, // Test invalid color
                },
              },
            ],
          },
        },
      ],
    },
  }),
);

// // console.log(
// //   decl.parseDeclaration(
// //     "background-image: radial-gradient(rgb(255,255,255,0) 0, rgb(255,255,255,.15) 30%, rgb(255,255,255,.3) 32%, rgb(255,255,255,0) 33%) 0 0",
// //   ),
// // );

// // console.log(JSON.stringify(decl.parseDeclaration("background-image: url()"), null, 2));

// // import * as gen from "@b/generators";

// // console.log(
// //   gen.Color.generate({
// //     kind: "hsl",
// //     h: {
// //       kind: "calc",
// //       value: {
// //         kind: "calc-operation",
// //         operator: "+",
// //         left: { kind: "variable", name: "--a" },
// //         right: {
// //           kind: "calc-operation",
// //           operator: "-",
// //           left: { kind: "literal", value: 10, unit: "deg" },
// //           right: { kind: "literal", value: 0, unit: "deg" },
// //         },
// //       },
// //     },
// //     s: { kind: "url", url: "https://example.com/saturation" },
// //     l: { kind: "literal", value: 50a, unit: "%" },
// //     alpha: { kind: "literal", value: 0.5 },
// //   }),
// // );
