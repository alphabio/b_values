// b_path:: packages/b_declarations/src/properties/animation-iteration-count/types.ts

export type AnimationIterationCountIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer" | "infinite";
    }
  | {
      kind: "number";
      value: number;
    };
