// b_path:: packages/b_declarations/src/utils/split.test.ts
import { describe, expect, it } from "vitest";
import { splitByComma } from "./split";

describe("splitByComma", () => {
  it("should split simple comma-separated values", () => {
    const result = splitByComma("value1, value2, value3");
    expect(result).toEqual(["value1", "value2", "value3"]);
  });

  it("should respect nested functions", () => {
    const result = splitByComma("url(a.png), linear-gradient(red, blue)");
    expect(result).toEqual(["url(a.png)", "linear-gradient(red, blue)"]);
  });

  it("should handle deeply nested functions", () => {
    const result = splitByComma("calc(100% - 10px), rgb(255, 0, 0)");
    expect(result).toEqual(["calc(100% - 10px)", "rgb(255, 0, 0)"]);
  });

  it("should trim whitespace", () => {
    const result = splitByComma("  value1  ,  value2  ");
    expect(result).toEqual(["value1", "value2"]);
  });

  it("should handle single value", () => {
    const result = splitByComma("single-value");
    expect(result).toEqual(["single-value"]);
  });

  it("should handle empty string", () => {
    const result = splitByComma("");
    expect(result).toEqual([]);
  });

  it("should handle complex gradient", () => {
    const result = splitByComma("linear-gradient(to right, red, blue), radial-gradient(circle, yellow, green)");
    expect(result).toEqual(["linear-gradient(to right, red, blue)", "radial-gradient(circle, yellow, green)"]);
  });
});
