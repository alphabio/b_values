// b_path:: packages/b_generators/src/length.test.ts
import { describe, expect, it } from "vitest";
import { generate, generateLengthPercentage } from "./length";

describe("Length generator", () => {
  describe("Absolute units", () => {
    it("should generate px length", () => {
      const result = generate({ value: 16, unit: "px" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("16px");
      }
    });

    it("should generate cm length", () => {
      const result = generate({ value: 2.54, unit: "cm" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("2.54cm");
      }
    });

    it("should generate in length", () => {
      const result = generate({ value: 1, unit: "in" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("1in");
      }
    });
  });

  describe("Font-relative units", () => {
    it("should generate em length", () => {
      const result = generate({ value: 1.5, unit: "em" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("1.5em");
      }
    });

    it("should generate rem length", () => {
      const result = generate({ value: 2, unit: "rem" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("2rem");
      }
    });

    it("should generate ch length", () => {
      const result = generate({ value: 20, unit: "ch" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("20ch");
      }
    });
  });

  describe("Viewport units", () => {
    it("should generate vw length", () => {
      const result = generate({ value: 50, unit: "vw" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("50vw");
      }
    });

    it("should generate vh length", () => {
      const result = generate({ value: 100, unit: "vh" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("100vh");
      }
    });

    it("should generate vmin length", () => {
      const result = generate({ value: 25, unit: "vmin" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("25vmin");
      }
    });
  });

  describe("Edge cases", () => {
    it("should generate zero length", () => {
      const result = generate({ value: 0, unit: "px" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("0px");
      }
    });

    it("should generate negative length", () => {
      const result = generate({ value: -10, unit: "px" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("-10px");
      }
    });

    it("should generate decimal length", () => {
      const result = generate({ value: 1.5, unit: "px" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("1.5px");
      }
    });
  });
});

describe("LengthPercentage generator", () => {
  it("should generate length", () => {
    const result = generateLengthPercentage({ value: 100, unit: "px" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("100px");
    }
  });

  it("should generate percentage", () => {
    const result = generateLengthPercentage({ value: 50, unit: "%" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("50%");
    }
  });

  it("should generate zero with units", () => {
    const result = generateLengthPercentage({ value: 0, unit: "px" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("0px");
    }
  });
});
