// b_path:: packages/b_declarations/src/properties/animation-name/types.ts

export type AnimationNameIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | "none";
    }
  | {
      kind: "custom-ident";
      value: string;
    };
