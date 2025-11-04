// b_path:: packages/b_values/src/color/roundtrip.test.ts
import { describe, expect, it } from "vitest";
import { Color as ColorGenerators } from "@b/generators";
import {
  parseRgbFunction,
  parseHslFunction,
  parseHwbFunction,
  parseLabFunction,
  parseLchFunction,
  parseOklabFunction,
  parseOklchFunction,
} from "@b/utils";
import { colorFunctionFromDeclaration } from "@b/utils";

/**
 * Round-trip test: CSS → Parse → IR → Generate → CSS
 * Validates bidirectional transformation
 */
describe("Color Round-trip Tests", () => {
  describe("RGB", () => {
    it("should round-trip opaque RGB", () => {
      const input = "rgb(255 0 0)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseRgbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Rgb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip RGB with alpha", () => {
      const input = "rgb(255 0 0 / 0.5)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseRgbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Rgb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip RGB with percentages", () => {
      const input = "rgb(100% 50% 0%)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseRgbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Rgb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should normalize legacy comma syntax to modern", () => {
      const input = "rgb(255, 0, 0)";
      const expected = "rgb(255 0 0)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseRgbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Rgb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(expected);
    });

    it("should round-trip RGB with none keyword", () => {
      const input = "rgb(none 0 0)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseRgbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Rgb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });
  });

  describe("HSL", () => {
    it("should round-trip opaque HSL", () => {
      const input = "hsl(120 100 50)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHslFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hsl.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip HSL with alpha", () => {
      const input = "hsl(120 100 50 / 0.5)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHslFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hsl.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip HSL with deg unit", () => {
      const input = "hsl(120deg 100% 50%)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHslFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hsl.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should normalize legacy comma syntax to modern", () => {
      const input = "hsl(120, 100%, 50%)";
      const expected = "hsl(120 100% 50%)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHslFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hsl.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(expected);
    });

    it("should round-trip HSL with none keyword", () => {
      const input = "hsl(none 100% 50%)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHslFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hsl.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });
  });

  describe("HWB", () => {
    it("should round-trip opaque HWB", () => {
      const input = "hwb(120 20% 30%)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHwbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hwb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip HWB with alpha", () => {
      const input = "hwb(120 20% 30% / 0.5)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHwbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hwb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip HWB with turn unit", () => {
      const input = "hwb(0.5turn 20% 30%)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHwbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hwb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip HWB with none keyword", () => {
      const input = "hwb(120 none 30%)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHwbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hwb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });
  });

  describe("LAB", () => {
    it("should round-trip opaque LAB", () => {
      const input = "lab(50 20 30)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip LAB with alpha", () => {
      const input = "lab(50 20 30 / 0.5)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip LAB with percentage lightness", () => {
      const input = "lab(50% 20 30)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip LAB with none keyword", () => {
      const input = "lab(50 none 30)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });
  });

  describe("LCH", () => {
    it("should round-trip opaque LCH", () => {
      const input = "lch(50 20 180)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip LCH with alpha", () => {
      const input = "lch(50 20 180 / 0.5)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip LCH with rad unit", () => {
      const input = "lch(50% 20 3.14159rad)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip LCH with none keyword", () => {
      const input = "lch(50 20 none)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });
  });

  describe("OKLab", () => {
    it("should round-trip opaque OKLab", () => {
      const input = "oklab(0.5 0.1 0.2)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip OKLab with alpha", () => {
      const input = "oklab(0.5 0.1 0.2 / 0.5)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip OKLab with percentage", () => {
      const input = "oklab(50% 0.1 0.2)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip OKLab with none keyword", () => {
      const input = "oklab(0.5 none 0.2)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });
  });

  describe("OKLCH", () => {
    it("should round-trip opaque OKLCH", () => {
      const input = "oklch(0.5 0.2 180)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip OKLCH with alpha", () => {
      const input = "oklch(0.5 0.2 180 / 0.5)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip OKLCH with grad unit", () => {
      const input = "oklch(50% 0.2 200grad)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip OKLCH with none keyword", () => {
      const input = "oklch(0.5 0.2 none)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });
  });

  describe("Edge Cases", () => {
    it("should round-trip RGB with fully opaque alpha", () => {
      const input = "rgb(255 0 0 / 1)";
      const expected = "rgb(255 0 0 / 1)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseRgbFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Rgb.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(expected);
    });

    it("should round-trip HSL with zero alpha", () => {
      const input = "hsl(120 100% 50% / 0)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseHslFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Hsl.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip LAB with all none keywords", () => {
      const input = "lab(none none none)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseLabFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Lab.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });

    it("should round-trip OKLCH with mixed units and keywords", () => {
      const input = "oklch(50% none 180deg)";
      const func = colorFunctionFromDeclaration(input);
      const parsed = parseOklchFunction(func);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = ColorGenerators.Oklch.generate(parsed.value);
      expect(generated.ok).toBe(true);
      if (!generated.ok) return;

      expect(generated.value).toBe(input);
    });
  });
});
