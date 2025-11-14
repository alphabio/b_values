// b_path:: packages/b_declarations/src/properties/transition-property/types.ts

export type TransitionPropertyIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | "none" | "all";
    }
  | {
      kind: "custom-ident";
      value: string;
    };
