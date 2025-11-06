// b_path:: packages/b_utils/src/generate/css-value.ts
import type { CssValue } from "@b/types";

/**
 * Generates CSS string representation from a CssValue
 * Handles all CSS value types including functions and operations
 * @see https://drafts.csswg.org/css-values-4/
 */
export function cssValueToCss(value: CssValue): string {
  switch (value.kind) {
    case "literal": {
      const { value: num, unit } = value;
      return unit ? `${num}${unit}` : String(num);
    }

    case "variable": {
      const { name, fallback } = value;
      if (fallback) {
        return `var(${name}, ${cssValueToCss(fallback)})`;
      }
      return `var(${name})`;
    }

    case "keyword": {
      return value.value;
    }

    case "list": {
      const { values, separator } = value;
      return values.map((v) => cssValueToCss(v)).join(separator);
    }

    case "calc": {
      return `calc(${cssValueToCss(value.value)})`;
    }

    case "calc-operation": {
      const { left, operator, right } = value;
      const leftStr = cssValueToCss(left);
      const rightStr = cssValueToCss(right);
      // Add spaces around operators for readability
      return `${leftStr} ${operator} ${rightStr}`;
    }

    case "min":
    case "max": {
      const { values } = value;
      const valuesStr = values.map((v) => cssValueToCss(v)).join(", ");
      return `${value.kind}(${valuesStr})`;
    }

    case "clamp": {
      const { min, preferred, max } = value;
      const minStr = cssValueToCss(min);
      const preferredStr = cssValueToCss(preferred);
      const maxStr = cssValueToCss(max);
      return `clamp(${minStr}, ${preferredStr}, ${maxStr})`;
    }

    case "url": {
      return `url(${value.url})`;
    }

    case "attr": {
      const { name, typeOrUnit, fallback } = value;
      let result = `attr(${name}`;
      if (typeOrUnit) {
        result += ` ${typeOrUnit}`;
      }
      if (fallback) {
        result += `, ${cssValueToCss(fallback)}`;
      }
      result += ")";
      return result;
    }

    case "function": {
      const { name, args } = value;
      const argsStr = args.map((arg) => cssValueToCss(arg)).join(", ");
      return `${name}(${argsStr})`;
    }

    case "rgb":
    case "rgba":
    case "hsl":
    case "hsla": {
      const { components } = value;
      const componentsStr = components.map((c) => cssValueToCss(c)).join(", ");
      return `${value.kind}(${componentsStr})`;
    }

    case "string": {
      return `"${value.value}"`;
    }
  }
}
