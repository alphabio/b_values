// b_path:: packages/b_utils/src/string/levenshtein.test.ts

import { describe, expect, it } from "vitest";
import { findClosestMatch, levenshteinDistance } from "./levenshtein";

describe("levenshteinDistance", () => {
  it("should calculate distance correctly", () => {
    expect(levenshteinDistance("kitten", "sitting")).toBe(3);
    expect(levenshteinDistance("hello", "hello")).toBe(0);
    expect(levenshteinDistance("", "test")).toBe(4);
    expect(levenshteinDistance("test", "")).toBe(4);
  });

  it("should handle single character differences", () => {
    expect(levenshteinDistance("a", "b")).toBe(1);
    expect(levenshteinDistance("ab", "a")).toBe(1);
    expect(levenshteinDistance("a", "ab")).toBe(1);
  });

  it("should be case sensitive", () => {
    expect(levenshteinDistance("Hello", "hello")).toBe(1);
    expect(levenshteinDistance("HELLO", "hello")).toBe(5);
  });
});

describe("findClosestMatch", () => {
  const validColors = ["red", "blue", "green", "orange", "purple"];

  it("should find close match for typo", () => {
    expect(findClosestMatch("gren", validColors)).toBe("green");
    expect(findClosestMatch("ornge", validColors)).toBe("orange");
    expect(findClosestMatch("bleu", validColors)).toBe("blue");
    expect(findClosestMatch("purpl", validColors)).toBe("purple");
  });

  it("should return undefined for distant strings", () => {
    expect(findClosestMatch("qwerty", validColors)).toBeUndefined();
    expect(findClosestMatch("xyza", validColors)).toBeUndefined();
  });

  it("should handle case insensitivity", () => {
    expect(findClosestMatch("GREN", validColors)).toBe("green");
    expect(findClosestMatch("BLue", validColors)).toBe("blue");
  });

  it("should return exact match with distance 0", () => {
    expect(findClosestMatch("red", validColors)).toBe("red");
    expect(findClosestMatch("blue", validColors)).toBe("blue");
  });

  it("should respect maxDistance parameter", () => {
    expect(findClosestMatch("rd", validColors, 1)).toBe("red");
    expect(findClosestMatch("rd", validColors, 0)).toBeUndefined();
  });

  it("should return first match when multiple options have same distance", () => {
    const options = ["abc", "abd", "abe"];
    const result = findClosestMatch("abz", options);
    expect(options).toContain(result);
  });
});
