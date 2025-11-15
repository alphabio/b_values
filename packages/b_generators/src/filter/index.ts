// b_path:: packages/b_generators/src/filter/index.ts

import { generateErr, generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";
import * as Length from "../length";
import * as Angle from "../angle";
import * as Color from "../color";

/**
 * Generate filter function CSS from IR
 */
export function generate(ir: Type.FilterFunction): GenerateResult {
  switch (ir.kind) {
    case "blur": {
      if (!ir.length) return generateOk("blur()");
      const length = Length.generate(ir.length);
      if (!length.ok) return length;
      return generateOk(`blur(${length.value})`);
    }

    case "brightness": {
      if (ir.value === undefined) return generateOk("brightness()");
      if (typeof ir.value === "number") {
        return generateOk(`brightness(${ir.value})`);
      }
      return generateOk(`brightness(${ir.value.value}${ir.value.unit})`);
    }

    case "contrast": {
      if (ir.value === undefined) return generateOk("contrast()");
      if (typeof ir.value === "number") {
        return generateOk(`contrast(${ir.value})`);
      }
      return generateOk(`contrast(${ir.value.value}${ir.value.unit})`);
    }

    case "grayscale": {
      if (ir.value === undefined) return generateOk("grayscale()");
      if (typeof ir.value === "number") {
        return generateOk(`grayscale(${ir.value})`);
      }
      return generateOk(`grayscale(${ir.value.value}${ir.value.unit})`);
    }

    case "hue-rotate": {
      if (!ir.angle) return generateOk("hue-rotate()");
      const angle = Angle.generate(ir.angle);
      if (!angle.ok) return angle;
      return generateOk(`hue-rotate(${angle.value})`);
    }

    case "invert": {
      if (ir.value === undefined) return generateOk("invert()");
      if (typeof ir.value === "number") {
        return generateOk(`invert(${ir.value})`);
      }
      return generateOk(`invert(${ir.value.value}${ir.value.unit})`);
    }

    case "opacity": {
      if (ir.value === undefined) return generateOk("opacity()");
      if (typeof ir.value === "number") {
        return generateOk(`opacity(${ir.value})`);
      }
      return generateOk(`opacity(${ir.value.value}${ir.value.unit})`);
    }

    case "saturate": {
      if (ir.value === undefined) return generateOk("saturate()");
      if (typeof ir.value === "number") {
        return generateOk(`saturate(${ir.value})`);
      }
      return generateOk(`saturate(${ir.value.value}${ir.value.unit})`);
    }

    case "sepia": {
      if (ir.value === undefined) return generateOk("sepia()");
      if (typeof ir.value === "number") {
        return generateOk(`sepia(${ir.value})`);
      }
      return generateOk(`sepia(${ir.value.value}${ir.value.unit})`);
    }

    case "drop-shadow": {
      const parts: string[] = [];

      // Color can come first
      if (ir.color) {
        const color = Color.generate(ir.color);
        if (!color.ok) return color;
        parts.push(color.value);
      }

      const x = Length.generate(ir.offsetX);
      const y = Length.generate(ir.offsetY);
      if (!x.ok) return x;
      if (!y.ok) return y;
      parts.push(x.value, y.value);

      if (ir.blurRadius) {
        const blur = Length.generate(ir.blurRadius);
        if (!blur.ok) return blur;
        parts.push(blur.value);
      }

      return generateOk(`drop-shadow(${parts.join(" ")})`);
    }

    default:
      return generateErr({ code: "unsupported-kind", severity: "error", message: "Unsupported filter function" });
  }
}

/**
 * Generate filter list CSS from IR
 */
export function generateList(ir: Type.FilterList): GenerateResult {
  const results = ir.map(generate);
  const failed = results.find((r) => !r.ok);
  if (failed) return failed;

  const values = results.map((r) => (r as { ok: true; value: string }).value);
  return generateOk(values.join(" "));
}
