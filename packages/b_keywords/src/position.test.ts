// b_path:: packages/b_keywords/src/position.test.ts
import { describe, expect, it } from "vitest";
import { positionHorizontalEdge, positionKeyword, positionVerticalEdge } from "./position";

describe("positionKeyword", () => {
  it("validates center", () => {
    expect(positionKeyword.parse("center")).toBe("center");
  });

  it("validates horizontal keywords", () => {
    expect(positionKeyword.parse("left")).toBe("left");
    expect(positionKeyword.parse("right")).toBe("right");
  });

  it("validates vertical keywords", () => {
    expect(positionKeyword.parse("top")).toBe("top");
    expect(positionKeyword.parse("bottom")).toBe("bottom");
  });

  it("validates logical keywords", () => {
    expect(positionKeyword.parse("x-start")).toBe("x-start");
    expect(positionKeyword.parse("x-end")).toBe("x-end");
    expect(positionKeyword.parse("y-start")).toBe("y-start");
    expect(positionKeyword.parse("y-end")).toBe("y-end");
    expect(positionKeyword.parse("block-start")).toBe("block-start");
    expect(positionKeyword.parse("block-end")).toBe("block-end");
    expect(positionKeyword.parse("inline-start")).toBe("inline-start");
    expect(positionKeyword.parse("inline-end")).toBe("inline-end");
    expect(positionKeyword.parse("start")).toBe("start");
    expect(positionKeyword.parse("end")).toBe("end");
  });

  it("rejects invalid keywords", () => {
    expect(() => positionKeyword.parse("middle")).toThrow();
    expect(() => positionKeyword.parse("invalid")).toThrow();
  });
});

describe("positionHorizontalEdge", () => {
  it("validates left", () => {
    expect(positionHorizontalEdge.parse("left")).toBe("left");
  });

  it("validates right", () => {
    expect(positionHorizontalEdge.parse("right")).toBe("right");
  });

  it("validates logical horizontal keywords", () => {
    expect(positionHorizontalEdge.parse("x-start")).toBe("x-start");
    expect(positionHorizontalEdge.parse("x-end")).toBe("x-end");
  });

  it("rejects vertical keywords", () => {
    expect(() => positionHorizontalEdge.parse("top")).toThrow();
    expect(() => positionHorizontalEdge.parse("bottom")).toThrow();
  });

  it("rejects center", () => {
    expect(() => positionHorizontalEdge.parse("center")).toThrow();
  });
});

describe("positionVerticalEdge", () => {
  it("validates top", () => {
    expect(positionVerticalEdge.parse("top")).toBe("top");
  });

  it("validates bottom", () => {
    expect(positionVerticalEdge.parse("bottom")).toBe("bottom");
  });

  it("validates logical vertical keywords", () => {
    expect(positionVerticalEdge.parse("y-start")).toBe("y-start");
    expect(positionVerticalEdge.parse("y-end")).toBe("y-end");
  });

  it("rejects horizontal keywords", () => {
    expect(() => positionVerticalEdge.parse("left")).toThrow();
    expect(() => positionVerticalEdge.parse("right")).toThrow();
  });

  it("rejects center", () => {
    expect(() => positionVerticalEdge.parse("center")).toThrow();
  });
});
