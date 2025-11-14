// b_path:: packages/b_keywords/src/easing.test.ts
import { describe, expect, it } from "vitest";
import { easingKeywordSchema, stepsPositionSchema } from "./easing";

describe("easingKeywordSchema", () => {
  it("validates linear", () => {
    expect(easingKeywordSchema.parse("linear")).toBe("linear");
  });

  it("validates ease variants", () => {
    expect(easingKeywordSchema.parse("ease")).toBe("ease");
    expect(easingKeywordSchema.parse("ease-in")).toBe("ease-in");
    expect(easingKeywordSchema.parse("ease-out")).toBe("ease-out");
    expect(easingKeywordSchema.parse("ease-in-out")).toBe("ease-in-out");
  });

  it("validates step keywords", () => {
    expect(easingKeywordSchema.parse("step-start")).toBe("step-start");
    expect(easingKeywordSchema.parse("step-end")).toBe("step-end");
  });

  it("rejects invalid keywords", () => {
    expect(() => easingKeywordSchema.parse("invalid")).toThrow();
    expect(() => easingKeywordSchema.parse("cubic-bezier")).toThrow();
  });
});

describe("stepsPositionSchema", () => {
  it("validates jump positions", () => {
    expect(stepsPositionSchema.parse("jump-start")).toBe("jump-start");
    expect(stepsPositionSchema.parse("jump-end")).toBe("jump-end");
    expect(stepsPositionSchema.parse("jump-none")).toBe("jump-none");
    expect(stepsPositionSchema.parse("jump-both")).toBe("jump-both");
  });

  it("validates legacy positions", () => {
    expect(stepsPositionSchema.parse("start")).toBe("start");
    expect(stepsPositionSchema.parse("end")).toBe("end");
  });

  it("rejects invalid positions", () => {
    expect(() => stepsPositionSchema.parse("middle")).toThrow();
  });
});
