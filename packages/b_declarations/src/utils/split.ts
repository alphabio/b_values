// b_path:: packages/b_declarations/src/utils/split.ts
/**
 * Split a CSS value by comma, respecting nested functions.
 *
 * @example
 * splitByComma("url(a.png), linear-gradient(red, blue)")
 * // ["url(a.png)", "linear-gradient(red, blue)"]
 */
export function splitByComma(value: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (char === "(") {
      depth++;
      current += char;
    } else if (char === ")") {
      depth--;
      current += char;
    } else if (char === "," && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}
