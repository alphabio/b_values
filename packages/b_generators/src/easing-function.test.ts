// b_path:: packages/b_generators/src/easing-function.test.ts
import { describe, expect, it } from "vitest";
import { generate } from "./easing-function";

describe("EasingFunction generator", () => {
  describe("keywords", () => {
    it("should generate ease", () => {
      const result = generate({ kind: "keyword", value: "ease" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("ease");
      }
    });

    it("should generate linear", () => {
      const result = generate({ kind: "keyword", value: "linear" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("linear");
      }
    });

    it("should generate step-start", () => {
      const result = generate({ kind: "keyword", value: "step-start" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("step-start");
      }
    });
  });

  describe("cubic-bezier", () => {
    it("should generate cubic-bezier", () => {
      const result = generate({
        kind: "cubic-bezier",
        x1: 0.42,
        y1: 0,
        x2: 0.58,
        y2: 1,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("cubic-bezier(0.42, 0, 0.58, 1)");
      }
    });
  });

  describe("steps", () => {
    it("should generate steps with count only", () => {
      const result = generate({
        kind: "steps",
        count: 4,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("steps(4)");
      }
    });

    it("should generate steps with position", () => {
      const result = generate({
        kind: "steps",
        count: 10,
        position: "jump-end",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("steps(10, jump-end)");
      }
    });
  });
});
