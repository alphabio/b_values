// b_path:: packages/b_parsers/src/math/calc.test.ts
import { describe, expect, it } from "vitest";
import { extractFunctionFromValue } from "@b/utils";
import { parseCalcFunction } from "./calc";

describe("parseCalcFunction", () => {
  it("parses simple calc with addition", () => {
    const func = extractFunctionFromValue("calc(100px + 20px)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe("calc");
    expect(result.value.value.kind).toBe("calc-operation");
    if (result.value.value.kind === "calc-operation") {
      expect(result.value.value.operator).toBe("+");
    }
  });

  it("parses calc with subtraction", () => {
    const func = extractFunctionFromValue("calc(100% - 20px)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe("calc");
    expect(result.value.value.kind).toBe("calc-operation");
  });

  it("parses calc with multiplication", () => {
    const func = extractFunctionFromValue("calc(10px * 2)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value.kind).toBe("calc-operation");
    if (result.value.value.kind === "calc-operation") {
      expect(result.value.value.operator).toBe("*");
    }
  });

  it("parses calc with division", () => {
    const func = extractFunctionFromValue("calc(100px / 2)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value.kind).toBe("calc-operation");
    if (result.value.value.kind === "calc-operation") {
      expect(result.value.value.operator).toBe("/");
    }
  });

  it("parses calc with var()", () => {
    const func = extractFunctionFromValue("calc(var(--width) - 20px)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value.kind).toBe("calc-operation");
    if (result.value.value.kind === "calc-operation") {
      // var() is properly parsed by parseCssValueNode
      expect(result.value.value.left.kind).toBe("variable");
    }
  });

  it("parses nested calc operations (same precedence - left-to-right)", () => {
    const func = extractFunctionFromValue("calc(10px + 20px - 5px)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Same precedence operators associate left-to-right: ((10px + 20px) - 5px)
    expect(result.value.value.kind).toBe("calc-operation");
    if (result.value.value.kind === "calc-operation") {
      expect(result.value.value.operator).toBe("-");
      expect(result.value.value.left.kind).toBe("calc-operation");
      if (result.value.value.left.kind === "calc-operation") {
        expect(result.value.value.left.operator).toBe("+");
      }
    }
  });

  it("parses calc with single value", () => {
    const func = extractFunctionFromValue("calc(100px)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.value.kind).toBe("literal");
    if (result.value.value.kind === "literal") {
      expect(result.value.value.value).toBe(100);
      expect(result.value.value.unit).toBe("px");
    }
  });

  it("fails on empty calc()", () => {
    const func = extractFunctionFromValue("calc()");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(false);
  });

  it("fails when function name is not calc", () => {
    const func = extractFunctionFromValue("notcalc(10px + 20px)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid-syntax");
  });

  it("handles malformed calc with operator at end", () => {
    const func = extractFunctionFromValue("calc(10px +)");
    const result = parseCalcFunction(func);

    // Should fail gracefully
    expect(result.ok).toBe(false);
  });

  describe("operator precedence (Shunting-yard algorithm)", () => {
    it("respects multiplication before addition: calc(10px + 2px * 5)", () => {
      const func = extractFunctionFromValue("calc(10px + 2px * 5)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Should be: 10px + (2px * 5), not (10px + 2px) * 5
      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");

      if (root.kind === "calc-operation") {
        // Root should be addition
        expect(root.operator).toBe("+");

        // Left should be literal 10px
        expect(root.left.kind).toBe("literal");
        if (root.left.kind === "literal") {
          expect(root.left.value).toBe(10);
          expect(root.left.unit).toBe("px");
        }

        // Right should be multiplication (2px * 5)
        expect(root.right.kind).toBe("calc-operation");
        if (root.right.kind === "calc-operation") {
          expect(root.right.operator).toBe("*");

          if (root.right.left.kind === "literal") {
            expect(root.right.left.value).toBe(2);
            expect(root.right.left.unit).toBe("px");
          }

          if (root.right.right.kind === "literal") {
            expect(root.right.right.value).toBe(5);
            expect(root.right.right.unit).toBeUndefined();
          }
        }
      }
    });

    it("respects division before subtraction: calc(20px - 10px / 2)", () => {
      const func = extractFunctionFromValue("calc(20px - 10px / 2)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Should be: 20px - (10px / 2), not (20px - 10px) / 2
      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");

      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("-");
        expect(root.right.kind).toBe("calc-operation");
        if (root.right.kind === "calc-operation") {
          expect(root.right.operator).toBe("/");
        }
      }
    });

    it("handles multiple multiplications and additions: calc(2 * 3 + 4 * 5)", () => {
      const func = extractFunctionFromValue("calc(2 * 3 + 4 * 5)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Should be: (2 * 3) + (4 * 5)
      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");

      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("+");
        expect(root.left.kind).toBe("calc-operation");
        expect(root.right.kind).toBe("calc-operation");

        if (root.left.kind === "calc-operation") {
          expect(root.left.operator).toBe("*");
        }
        if (root.right.kind === "calc-operation") {
          expect(root.right.operator).toBe("*");
        }
      }
    });

    it("handles mixed precedence with same-level grouping: calc(10 + 20 * 3 - 5)", () => {
      const func = extractFunctionFromValue("calc(10 + 20 * 3 - 5)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Should be: ((10 + (20 * 3)) - 5)
      // Root: subtraction
      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");

      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("-");
        // Left side should be addition
        expect(root.left.kind).toBe("calc-operation");
        if (root.left.kind === "calc-operation") {
          expect(root.left.operator).toBe("+");
          // Right side of addition should be multiplication
          expect(root.left.right.kind).toBe("calc-operation");
          if (root.left.right.kind === "calc-operation") {
            expect(root.left.right.operator).toBe("*");
          }
        }
      }
    });

    it("handles consecutive multiplications: calc(2 * 3 * 4)", () => {
      const func = extractFunctionFromValue("calc(2 * 3 * 4)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Should be left-associative: ((2 * 3) * 4)
      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");

      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("*");
        expect(root.left.kind).toBe("calc-operation");
        if (root.left.kind === "calc-operation") {
          expect(root.left.operator).toBe("*");
        }
      }
    });

    it("handles consecutive divisions: calc(100 / 2 / 5)", () => {
      const func = extractFunctionFromValue("calc(100 / 2 / 5)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Should be left-associative: ((100 / 2) / 5)
      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");

      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("/");
        expect(root.left.kind).toBe("calc-operation");
        if (root.left.kind === "calc-operation") {
          expect(root.left.operator).toBe("/");
        }
      }
    });

    it("handles complex expression with all operators: calc(10 + 2 * 5 - 8 / 4)", () => {
      const func = extractFunctionFromValue("calc(10 + 2 * 5 - 8 / 4)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Should be: ((10 + (2 * 5)) - (8 / 4))
      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");

      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("-");

        // Left side: (10 + (2 * 5))
        expect(root.left.kind).toBe("calc-operation");
        if (root.left.kind === "calc-operation") {
          expect(root.left.operator).toBe("+");
          expect(root.left.right.kind).toBe("calc-operation");
          if (root.left.right.kind === "calc-operation") {
            expect(root.left.right.operator).toBe("*");
          }
        }

        // Right side: (8 / 4)
        expect(root.right.kind).toBe("calc-operation");
        if (root.right.kind === "calc-operation") {
          expect(root.right.operator).toBe("/");
        }
      }
    });
  });

  describe("error handling", () => {
    it("detects missing operands: calc(10px + + 5px)", () => {
      const func = extractFunctionFromValue("calc(10px + + 5px)");
      const result = parseCalcFunction(func);

      // css-tree might parse this differently, but we should handle it gracefully
      expect(result.ok).toBe(false);
    });

    it("detects missing right operand: calc(10px *)", () => {
      const func = extractFunctionFromValue("calc(10px *)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.message.includes("missing operands"))).toBe(true);
    });

    it("detects too many operands: calc(10 20 30)", () => {
      const func = extractFunctionFromValue("calc(10 20 30)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.message.includes("too many values"))).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles whitespace correctly", () => {
      const func = extractFunctionFromValue("calc(  10px  +  20px  *  2  )");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // Should correctly parse as: 10px + (20px * 2)
      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");
      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("+");
        expect(root.right.kind).toBe("calc-operation");
      }
    });

    it("handles unitless numbers in multiplication", () => {
      const func = extractFunctionFromValue("calc(10px * 2.5)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");
      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("*");
        if (root.right.kind === "literal") {
          expect(root.right.value).toBe(2.5);
          expect(root.right.unit).toBeUndefined();
        }
      }
    });

    it("handles percentage values", () => {
      const func = extractFunctionFromValue("calc(100% - 50px)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");
      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("-");
        if (root.left.kind === "literal") {
          expect(root.left.value).toBe(100);
          expect(root.left.unit).toBe("%");
        }
      }
    });

    it("handles negative numbers", () => {
      const func = extractFunctionFromValue("calc(-10px + 20px)");
      const result = parseCalcFunction(func);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const root = result.value.value;
      expect(root.kind).toBe("calc-operation");
      if (root.kind === "calc-operation") {
        expect(root.operator).toBe("+");
        if (root.left.kind === "literal") {
          expect(root.left.value).toBe(-10);
          expect(root.left.unit).toBe("px");
        }
      }
    });
  });
});
