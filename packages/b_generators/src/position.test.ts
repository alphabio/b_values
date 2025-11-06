// b_path:: packages/b_generators/src/position.test.ts
import { describe, expect, it } from "vitest";
import { generate } from "./position";

describe("Position generator", () => {
  it("should generate position with keywords", () => {
    const result = generate({
      horizontal: { kind: "keyword", value: "center" },
      vertical: { kind: "keyword", value: "top" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("center top");
    }
  });

  it("should generate position with percentages", () => {
    const result = generate({
      horizontal: { kind: "literal", value: 50, unit: "%" },
      vertical: { kind: "literal", value: 25, unit: "%" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("50% 25%");
    }
  });

  it("should generate position with lengths", () => {
    const result = generate({
      horizontal: { kind: "literal", value: 10, unit: "px" },
      vertical: { kind: "literal", value: 20, unit: "px" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("10px 20px");
    }
  });

  it("should generate position with mixed values", () => {
    const result = generate({
      horizontal: { kind: "keyword", value: "left" },
      vertical: { kind: "literal", value: 10, unit: "px" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("left 10px");
    }
  });

  it("should generate center center", () => {
    const result = generate({
      horizontal: { kind: "keyword", value: "center" },
      vertical: { kind: "keyword", value: "center" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("center center");
    }
  });

  it("should generate zero position", () => {
    const result = generate({
      horizontal: { kind: "literal", value: 0, unit: "px" },
      vertical: { kind: "literal", value: 0, unit: "px" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("0px 0px");
    }
  });
});
