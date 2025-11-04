// b_path:: packages/b_values/src/me.ts
// DO NOT DELETE THIS FILE. IT IS BY THE USER FOR ADHOC TESTING PURPOSES ONLY.

import * as gen from "@b/generators";

console.log(
  gen.Color.Named.generate({
    kind: "named",
    name: "red",
  }),
);
