// b_path:: packages/b_declarations/src/properties/custom-property/types.ts

/**
 * Custom property IR (--*)
 * Stores value as an unparsed string per CSS spec.
 * We use a "raw" kind to distinguish it from standard keywords or values.
 * @see https://www.w3.org/TR/css-variables-1/#defining-variables
 */
export type CustomPropertyIR = { kind: "raw"; value: string };
