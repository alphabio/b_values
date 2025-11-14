// b_path:: packages/b_types/src/easing-function.test.ts
import { describe, expect, it } from "vitest";
import { easingFunctionSchema } from "./easing-function";

describe("easingFunctionSchema", () => {
  describe("keyword", () => {
    it("validates ease keywords", () => {
      const result = easingFunctionSchema.parse({ kind: "keyword", value: "ease" });
      expect(result).toEqual({ kind: "keyword", value: "ease" });
    });

    it("validates linear", () => {
      const result = easingFunctionSchema.parse({ kind: "keyword", value: "linear" });
      expect(result).toEqual({ kind: "keyword", value: "linear" });
    });
  });

  describe("cubic-bezier", () => {
    it("validates cubic-bezier", () => {
      const result = easingFunctionSchema.parse({
        kind: "cubic-bezier",
        x1: 0.42,
        y1: 0,
        x2: 0.58,
        y2: 1,
      });
      expect(result).toEqual({
        kind: "cubic-bezier",
        x1: 0.42,
        y1: 0,
        x2: 0.58,
        y2: 1,
      });
    });

    it("rejects missing parameters", () => {
      expect(() =>
        easingFunctionSchema.parse({
          kind: "cubic-bezier",
          x1: 0.42,
          y1: 0,
          x2: 0.58,
        }),
      ).toThrow();
    });
  });

  describe("steps", () => {
    it("validates steps with count only", () => {
      const result = easingFunctionSchema.parse({
        kind: "steps",
        count: 4,
      });
      expect(result).toEqual({
        kind: "steps",
        count: 4,
      });
    });

    it("validates steps with position", () => {
      const result = easingFunctionSchema.parse({
        kind: "steps",
        count: 10,
        position: "jump-end",
      });
      expect(result).toEqual({
        kind: "steps",
        count: 10,
        position: "jump-end",
      });
    });

    it("rejects non-integer count", () => {
      expect(() =>
        easingFunctionSchema.parse({
          kind: "steps",
          count: 4.5,
        }),
      ).toThrow();
    });

    it("rejects zero count", () => {
      expect(() =>
        easingFunctionSchema.parse({
          kind: "steps",
          count: 0,
        }),
      ).toThrow();
    });

    it("rejects negative count", () => {
      expect(() =>
        easingFunctionSchema.parse({
          kind: "steps",
          count: -1,
        }),
      ).toThrow();
    });
  });
});
