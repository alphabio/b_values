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

  // 3-value syntax tests
  describe("edge+offset syntax", () => {
    it("should generate left 15% top", () => {
      const result = generate({
        horizontal: {
          edge: "left",
          offset: { kind: "literal", value: 15, unit: "%" },
        },
        vertical: { kind: "keyword", value: "top" },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("left 15% top");
      }
    });

    it("should generate center top 20px", () => {
      const result = generate({
        horizontal: { kind: "keyword", value: "center" },
        vertical: {
          edge: "top",
          offset: { kind: "literal", value: 20, unit: "px" },
        },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("center top 20px");
      }
    });

    // 4-value syntax tests
    it("should generate left 15% top 20px", () => {
      const result = generate({
        horizontal: {
          edge: "left",
          offset: { kind: "literal", value: 15, unit: "%" },
        },
        vertical: {
          edge: "top",
          offset: { kind: "literal", value: 20, unit: "px" },
        },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("left 15% top 20px");
      }
    });

    it("should generate right 10% bottom 30px", () => {
      const result = generate({
        horizontal: {
          edge: "right",
          offset: { kind: "literal", value: 10, unit: "%" },
        },
        vertical: {
          edge: "bottom",
          offset: { kind: "literal", value: 30, unit: "px" },
        },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("right 10% bottom 30px");
      }
    });

    it("should generate bottom 5px right 8%", () => {
      const result = generate({
        horizontal: {
          edge: "right",
          offset: { kind: "literal", value: 8, unit: "%" },
        },
        vertical: {
          edge: "bottom",
          offset: { kind: "literal", value: 5, unit: "px" },
        },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("right 8% bottom 5px");
      }
    });
  });
});
