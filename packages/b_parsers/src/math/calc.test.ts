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

  it("parses nested calc operations (left-to-right)", () => {
    const func = extractFunctionFromValue("calc(10px + 20px - 5px)");
    const result = parseCalcFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Our simplified implementation builds left-to-right
    // So this becomes: ((10px + 20px) - 5px)
    expect(result.value.value.kind).toBe("calc-operation");
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
});
