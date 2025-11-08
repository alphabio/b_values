import * as decl from "@b/declarations";

console.log(
  JSON.stringify(
    decl.parseDeclarationList(`
    --brand-color: #0066cc;
    --default-size: 100px;
    --bg-repeat-val: no-repeat;

    background-size: var(--special-size, 50%);
    background-clip: var(--clip-type, border-box);
    background-repeat: var(--bg-repeat-val, var(--fallback-repeat, repeat));
  `),
    null,
    2,
  ),
);
