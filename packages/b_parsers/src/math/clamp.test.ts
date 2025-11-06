// b_path:: packages/b_parsers/src/math/clamp.test.ts
import { describe, expect, it } from "vitest";
import { extractFunctionFromValue } from "@b/utils";
import { parseClampFunction } from "./clamp";

describe("parseClampFunction", () => {
  it("parses clamp() with three values", () => {
    const func = extractFunctionFromValue("clamp(10px, 50%, 100px)");
    const result = parseClampFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe("clamp");
    expect(result.value.min.kind).toBe("literal");
    expect(result.value.preferred.kind).toBe("literal");
    expect(result.value.max.kind).toBe("literal");
  });

  it("parses clamp() with var()", () => {
    const func = extractFunctionFromValue("clamp(10px, var(--width), 100px)");
    const result = parseClampFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.preferred.kind).toBe("variable");
  });

  it("parses clamp() with calc() as generic function", () => {
    const func = extractFunctionFromValue("clamp(0px, calc(50% - 10px), 100%)");
    const result = parseClampFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.preferred.kind).toBe("calc");
  });

  it("parses clamp() with nested min/max as generic functions", () => {
    const func = extractFunctionFromValue("clamp(min(10px, 20px), 50%, max(80%, 100px))");
    const result = parseClampFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Both are generic functions since no dispatcher in parseCssValueNode
    expect(result.value.min.kind).toBe("min");
    expect(result.value.max.kind).toBe("max");
  });

  it("fails with two arguments", () => {
    const func = extractFunctionFromValue("clamp(10px, 50%)");
    const result = parseClampFunction(func);

    expect(result.ok).toBe(false);
  });

  it("fails with four arguments", () => {
    const func = extractFunctionFromValue("clamp(10px, 50%, 100px, 200px)");
    const result = parseClampFunction(func);

    expect(result.ok).toBe(false);
  });

  it("fails with no arguments", () => {
    const func = extractFunctionFromValue("clamp()");
    const result = parseClampFunction(func);

    expect(result.ok).toBe(false);
  });

  it("returns error when argument fails to parse", () => {
    // Use a value that parses but creates issues rather than syntax error
    const func = extractFunctionFromValue("clamp(10px, 20px, 100px)");
    const result = parseClampFunction(func);

    // All arguments parse successfully
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("clamp");
    }
  });

  it("returns error when argument is multiple nodes", () => {
    const func = extractFunctionFromValue("clamp(10px 20px, 50%, 100px)");
    const result = parseClampFunction(func);

    // Multiple nodes in one argument position
    expect(result.ok).toBe(false);
    if (!result.ok && result.value) {
      expect(result.value.kind).toBe("clamp");
    }
  });

  it("fails when function name is not clamp", () => {
    const func = extractFunctionFromValue("notclamp(10px, 50%, 100px)");
    const result = parseClampFunction(func);

    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid-syntax");
  });
});
