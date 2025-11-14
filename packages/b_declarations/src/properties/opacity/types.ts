// b_path:: packages/b_declarations/src/properties/opacity/types.ts

export type OpacityIR =
  | {
      kind: "keyword";
      value: "initial" | "inherit" | "unset" | "revert" | "revert-layer";
    }
  | {
      kind: "number";
      value: number;
    };
