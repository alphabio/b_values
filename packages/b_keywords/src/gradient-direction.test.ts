// b_path:: packages/b_keywords/src/gradient-direction.test.ts
import { describe, expect, it } from "vitest";
import { gradientCorner, gradientSide } from "./gradient-direction";

describe("gradientSide", () => {
  it("accepts valid sides", () => {
    expect(gradientSide.parse("top")).toBe("top");
    expect(gradientSide.parse("right")).toBe("right");
    expect(gradientSide.parse("bottom")).toBe("bottom");
    expect(gradientSide.parse("left")).toBe("left");
  });

  it("rejects invalid sides", () => {
    expect(() => gradientSide.parse("center")).toThrow();
    expect(() => gradientSide.parse("")).toThrow();
    expect(() => gradientSide.parse("top left")).toThrow();
  });
});

describe("gradientCorner", () => {
  it("accepts valid corners", () => {
    expect(gradientCorner.parse("top left")).toBe("top left");
    expect(gradientCorner.parse("top right")).toBe("top right");
    expect(gradientCorner.parse("bottom left")).toBe("bottom left");
    expect(gradientCorner.parse("bottom right")).toBe("bottom right");
  });

  it("rejects invalid corners", () => {
    expect(() => gradientCorner.parse("left top")).toThrow();
    expect(() => gradientCorner.parse("center")).toThrow();
    expect(() => gradientCorner.parse("")).toThrow();
  });
});
