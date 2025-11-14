// b_path:: packages/b_generators/src/transform/index.ts

import { generateErr, generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";
import * as Length from "../length";
import * as Angle from "../angle";

/**
 * Generate transform function CSS from IR
 */
export function generate(ir: Type.TransformFunction): GenerateResult {
  switch (ir.kind) {
    case "translate": {
      const x = Length.generateLengthPercentage(ir.x);
      const y = Length.generateLengthPercentage(ir.y);
      if (!x.ok) return x;
      if (!y.ok) return y;
      return generateOk(`translate(${x.value}, ${y.value})`);
    }

    case "translateX": {
      const x = Length.generateLengthPercentage(ir.x);
      if (!x.ok) return x;
      return generateOk(`translateX(${x.value})`);
    }

    case "translateY": {
      const y = Length.generateLengthPercentage(ir.y);
      if (!y.ok) return y;
      return generateOk(`translateY(${y.value})`);
    }

    case "translateZ": {
      const z = Length.generateLengthPercentage(ir.z);
      if (!z.ok) return z;
      return generateOk(`translateZ(${z.value})`);
    }

    case "translate3d": {
      const x = Length.generateLengthPercentage(ir.x);
      const y = Length.generateLengthPercentage(ir.y);
      const z = Length.generateLengthPercentage(ir.z);
      if (!x.ok) return x;
      if (!y.ok) return y;
      if (!z.ok) return z;
      return generateOk(`translate3d(${x.value}, ${y.value}, ${z.value})`);
    }

    case "rotate": {
      const angle = Angle.generate(ir.angle);
      if (!angle.ok) return angle;
      return generateOk(`rotate(${angle.value})`);
    }

    case "rotateX": {
      const angle = Angle.generate(ir.angle);
      if (!angle.ok) return angle;
      return generateOk(`rotateX(${angle.value})`);
    }

    case "rotateY": {
      const angle = Angle.generate(ir.angle);
      if (!angle.ok) return angle;
      return generateOk(`rotateY(${angle.value})`);
    }

    case "rotateZ": {
      const angle = Angle.generate(ir.angle);
      if (!angle.ok) return angle;
      return generateOk(`rotateZ(${angle.value})`);
    }

    case "rotate3d": {
      const angle = Angle.generate(ir.angle);
      if (!angle.ok) return angle;
      return generateOk(`rotate3d(${ir.x}, ${ir.y}, ${ir.z}, ${angle.value})`);
    }

    case "scale":
      return generateOk(`scale(${ir.x}, ${ir.y})`);

    case "scaleX":
      return generateOk(`scaleX(${ir.x})`);

    case "scaleY":
      return generateOk(`scaleY(${ir.y})`);

    case "scaleZ":
      return generateOk(`scaleZ(${ir.z})`);

    case "scale3d":
      return generateOk(`scale3d(${ir.x}, ${ir.y}, ${ir.z})`);

    case "skew": {
      const x = Angle.generate(ir.x);
      const y = Angle.generate(ir.y);
      if (!x.ok) return x;
      if (!y.ok) return y;
      return generateOk(`skew(${x.value}, ${y.value})`);
    }

    case "skewX": {
      const x = Angle.generate(ir.x);
      if (!x.ok) return x;
      return generateOk(`skewX(${x.value})`);
    }

    case "skewY": {
      const y = Angle.generate(ir.y);
      if (!y.ok) return y;
      return generateOk(`skewY(${y.value})`);
    }

    case "matrix":
      return generateOk(`matrix(${ir.a}, ${ir.b}, ${ir.c}, ${ir.d}, ${ir.e}, ${ir.f})`);

    case "matrix3d":
      return generateOk(`matrix3d(${ir.values.join(", ")})`);

    case "perspective": {
      const length = Length.generate(ir.length);
      if (!length.ok) return length;
      return generateOk(`perspective(${length.value})`);
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
