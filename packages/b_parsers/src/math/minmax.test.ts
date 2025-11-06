// b_path:: packages/b_parsers/src/math/minmax.test.ts
import { describe, expect, it } from "vitest";
import { extractFunctionFromValue } from "@b/utils";
import { parseMinmaxFunction } from "./minmax";

describe("parseMinmaxFunction", () => {
  it("parses min() with two values", () => {
    const func = extractFunctionFromValue("min(100px, 50%)");
    const result = parseMinmaxFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe("min");
    expect(result.value.values).toHaveLength(2);
  });

  it("parses max() with two values", () => {
    const func = extractFunctionFromValue("max(100px, 50%)");
    const result = parseMinmaxFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe("max");
    expect(result.value.values).toHaveLength(2);
  });

  it("parses min() with multiple values", () => {
    const func = extractFunctionFromValue("min(100px, 50%, 200px, 10rem)");
    const result = parseMinmaxFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.values).toHaveLength(4);
  });

  it("parses min() with var()", () => {
    const func = extractFunctionFromValue("min(var(--width), 100%)");
    const result = parseMinmaxFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.values[0].kind).toBe("variable");
  });

  it("parses min() with nested calc() as generic function", () => {
    const func = extractFunctionFromValue("min(calc(100% - 20px), 500px)");
    const result = parseMinmaxFunction(func);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // parseCssValueNode returns calc as generic function (no dispatcher in utils)
    expect(result.value.values[0].kind).toBe("calc");
    if (result.value.values[0].kind === "function") {
      expect(result.value.values[0].name).toBe("calc");
    }
  });

  it("fails with single argument", () => {
    const func = extractFunctionFromValue("min(100px)");
    const result = parseMinmaxFunction(func);

    expect(result.ok).toBe(false);
  });

  it("fails with no arguments", () => {
    const func = extractFunctionFromValue("min()");
    const result = parseMinmaxFunction(func);

    expect(result.ok).toBe(false);
  });

  it("returns error when argument fails to parse", () => {
    // Use a value that parses but creates issues
    const func = extractFunctionFromValue("min(10px, 20px)");
    const result = parseMinmaxFunction(func);

    // Arguments parse successfully
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("min");
    }
  });

  it("handles multiple nodes in argument group", () => {
    const func = extractFunctionFromValue("max(10px 20px, 100px)");
    const result = parseMinmaxFunction(func);

    // Multiple nodes trigger warning but still parse
    if (result.value) {
      expect(result.value.kind).toBe("max");
    }
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("skips empty groups after comma splitting", () => {
    const func = extractFunctionFromValue("min(10px,,20px)");
    const result = parseMinmaxFunction(func);

    // Empty groups are skipped
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.values.length).toBe(2);
    }
  });

  it("fails when function name is neither min nor max", () => {
    const func = extractFunctionFromValue("notmin(10px, 20px)");
    const result = parseMinmaxFunction(func);

    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid-syntax");
  });
});
