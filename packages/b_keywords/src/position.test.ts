// b_path:: packages/b_keywords/src/position.test.ts
import { describe, expect, it } from "vitest";
import { positionHorizontalEdgeSchema, positionKeywordSchema, positionVerticalEdgeSchema } from "./position";

describe("positionKeywordSchema", () => {
  it("validates center", () => {
    expect(positionKeywordSchema.parse("center")).toBe("center");
  });

  it("validates horizontal keywords", () => {
    expect(positionKeywordSchema.parse("left")).toBe("left");
    expect(positionKeywordSchema.parse("right")).toBe("right");
  });

  it("validates vertical keywords", () => {
    expect(positionKeywordSchema.parse("top")).toBe("top");
    expect(positionKeywordSchema.parse("bottom")).toBe("bottom");
  });

  it("rejects invalid keywords", () => {
    expect(() => positionKeywordSchema.parse("middle")).toThrow();
    expect(() => positionKeywordSchema.parse("start")).toThrow();
    expect(() => positionKeywordSchema.parse("end")).toThrow();
  });
});

describe("positionHorizontalEdgeSchema", () => {
  it("validates left", () => {
    expect(positionHorizontalEdgeSchema.parse("left")).toBe("left");
  });

  it("validates right", () => {
    expect(positionHorizontalEdgeSchema.parse("right")).toBe("right");
  });

  it("rejects vertical keywords", () => {
    expect(() => positionHorizontalEdgeSchema.parse("top")).toThrow();
    expect(() => positionHorizontalEdgeSchema.parse("bottom")).toThrow();
  });

  it("rejects center", () => {
    expect(() => positionHorizontalEdgeSchema.parse("center")).toThrow();
  });
});

describe("positionVerticalEdgeSchema", () => {
  it("validates top", () => {
    expect(positionVerticalEdgeSchema.parse("top")).toBe("top");
  });

  it("validates bottom", () => {
    expect(positionVerticalEdgeSchema.parse("bottom")).toBe("bottom");
  });

  it("rejects horizontal keywords", () => {
    expect(() => positionVerticalEdgeSchema.parse("left")).toThrow();
    expect(() => positionVerticalEdgeSchema.parse("right")).toThrow();
  });

  it("rejects center", () => {
    expect(() => positionVerticalEdgeSchema.parse("center")).toThrow();
  });
});
