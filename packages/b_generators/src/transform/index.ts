// b_path:: packages/b_generators/src/transform/index.ts

import { generateErr, generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * Generate transform function CSS from IR
 */
export function generate(ir: Type.TransformFunction): GenerateResult {
  switch (ir.kind) {
    case "translate": {
      const x = cssValueToCss(ir.x);
      const y = cssValueToCss(ir.y);
      return generateOk(`translate(${x}, ${y})`);
    }

    case "translateX": {
      const x = cssValueToCss(ir.x);
      return generateOk(`translateX(${x})`);
    }

    case "translateY": {
      const y = cssValueToCss(ir.y);
      return generateOk(`translateY(${y})`);
    }

    case "translateZ": {
      const z = cssValueToCss(ir.z);
      return generateOk(`translateZ(${z})`);
    }

    case "translate3d": {
      const x = cssValueToCss(ir.x);
      const y = cssValueToCss(ir.y);
      const z = cssValueToCss(ir.z);
      return generateOk(`translate3d(${x}, ${y}, ${z})`);
    }

    case "rotate": {
      const angle = cssValueToCss(ir.angle);
      return generateOk(`rotate(${angle})`);
    }

    case "rotateX": {
      const angle = cssValueToCss(ir.angle);
      return generateOk(`rotateX(${angle})`);
    }

    case "rotateY": {
      const angle = cssValueToCss(ir.angle);
      return generateOk(`rotateY(${angle})`);
    }

    case "rotateZ": {
      const angle = cssValueToCss(ir.angle);
      return generateOk(`rotateZ(${angle})`);
    }

    case "rotate3d": {
      const angle = cssValueToCss(ir.angle);
      return generateOk(`rotate3d(${ir.x}, ${ir.y}, ${ir.z}, ${angle})`);
    }

    case "scale":
      return generateOk(`scale(${cssValueToCss(ir.x)}, ${cssValueToCss(ir.y)})`);

    case "scaleX":
      return generateOk(`scaleX(${cssValueToCss(ir.x)})`);

    case "scaleY":
      return generateOk(`scaleY(${cssValueToCss(ir.y)})`);

    case "scaleZ":
      return generateOk(`scaleZ(${cssValueToCss(ir.z)})`);

    case "scale3d":
      return generateOk(`scale3d(${cssValueToCss(ir.x)}, ${cssValueToCss(ir.y)}, ${cssValueToCss(ir.z)})`);

    case "skew": {
      const x = cssValueToCss(ir.x);
      const y = cssValueToCss(ir.y);
      return generateOk(`skew(${x}, ${y})`);
    }

    case "skewX": {
      const x = cssValueToCss(ir.x);
      return generateOk(`skewX(${x})`);
    }

    case "skewY": {
      const y = cssValueToCss(ir.y);
      return generateOk(`skewY(${y})`);
    }

    case "matrix":
      return generateOk(
        `matrix(${cssValueToCss(ir.a)}, ${cssValueToCss(ir.b)}, ${cssValueToCss(ir.c)}, ${cssValueToCss(ir.d)}, ${cssValueToCss(ir.e)}, ${cssValueToCss(ir.f)})`,
      );

    case "matrix3d":
      return generateOk(`matrix3d(${ir.values.map(cssValueToCss).join(", ")})`);

    case "perspective": {
      const length = cssValueToCss(ir.length);
      return generateOk(`perspective(${length})`);
    }

    default:
      return generateErr({ code: "unsupported-kind", severity: "error", message: "Unsupported transform function" });
  }
}

/**
 * Generate transform list CSS from IR
 */
export function generateList(ir: Type.TransformList): GenerateResult {
  const results = ir.map(generate);
  const failed = results.find((r) => !r.ok);
  if (failed) return failed;

  const values = results.map((r) => (r as { ok: true; value: string }).value);
  return generateOk(values.join(" "));
}
