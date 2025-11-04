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

  it("validates logical keywords", () => {
    expect(positionKeywordSchema.parse("x-start")).toBe("x-start");
    expect(positionKeywordSchema.parse("x-end")).toBe("x-end");
    expect(positionKeywordSchema.parse("y-start")).toBe("y-start");
    expect(positionKeywordSchema.parse("y-end")).toBe("y-end");
    expect(positionKeywordSchema.parse("block-start")).toBe("block-start");
    expect(positionKeywordSchema.parse("block-end")).toBe("block-end");
    expect(positionKeywordSchema.parse("inline-start")).toBe("inline-start");
    expect(positionKeywordSchema.parse("inline-end")).toBe("inline-end");
    expect(positionKeywordSchema.parse("start")).toBe("start");
    expect(positionKeywordSchema.parse("end")).toBe("end");
  });

  it("rejects invalid keywords", () => {
    expect(() => positionKeywordSchema.parse("middle")).toThrow();
    expect(() => positionKeywordSchema.parse("invalid")).toThrow();
  });
});

describe("positionHorizontalEdgeSchema", () => {
  it("validates left", () => {
    expect(positionHorizontalEdgeSchema.parse("left")).toBe("left");
  });

  it("validates right", () => {
    expect(positionHorizontalEdgeSchema.parse("right")).toBe("right");
  });

  it("validates logical horizontal keywords", () => {
    expect(positionHorizontalEdgeSchema.parse("x-start")).toBe("x-start");
    expect(positionHorizontalEdgeSchema.parse("x-end")).toBe("x-end");
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

  it("validates logical vertical keywords", () => {
    expect(positionVerticalEdgeSchema.parse("y-start")).toBe("y-start");
    expect(positionVerticalEdgeSchema.parse("y-end")).toBe("y-end");
  });

  it("rejects horizontal keywords", () => {
    expect(() => positionVerticalEdgeSchema.parse("left")).toThrow();
    expect(() => positionVerticalEdgeSchema.parse("right")).toThrow();
  });

  it("rejects center", () => {
    expect(() => positionVerticalEdgeSchema.parse("center")).toThrow();
  });
});
