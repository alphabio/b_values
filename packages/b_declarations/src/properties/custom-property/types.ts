// b_path:: packages/b_declarations/src/properties/custom-property/types.ts
/**
 * Custom property IR (--*)
 * Stores value as unparsed string per CSS spec
 * @see https://www.w3.org/TR/css-variables-1/#defining-variables
 */
export type CustomPropertyIR = { kind: "keyword"; value: string } | { kind: "value"; value: string };
