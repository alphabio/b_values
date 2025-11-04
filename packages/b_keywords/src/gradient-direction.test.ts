import { describe, expect, it } from "vitest";
import { gradientCornerSchema, gradientSideSchema } from "./gradient-direction";

describe("gradientSideSchema", () => {
  it("accepts valid sides", () => {
    expect(gradientSideSchema.parse("top")).toBe("top");
    expect(gradientSideSchema.parse("right")).toBe("right");
    expect(gradientSideSchema.parse("bottom")).toBe("bottom");
    expect(gradientSideSchema.parse("left")).toBe("left");
  });

  it("rejects invalid sides", () => {
    expect(() => gradientSideSchema.parse("center")).toThrow();
    expect(() => gradientSideSchema.parse("")).toThrow();
    expect(() => gradientSideSchema.parse("top left")).toThrow();
  });
});

describe("gradientCornerSchema", () => {
  it("accepts valid corners", () => {
    expect(gradientCornerSchema.parse("top left")).toBe("top left");
    expect(gradientCornerSchema.parse("top right")).toBe("top right");
    expect(gradientCornerSchema.parse("bottom left")).toBe("bottom left");
    expect(gradientCornerSchema.parse("bottom right")).toBe("bottom right");
  });

  it("rejects invalid corners", () => {
    expect(() => gradientCornerSchema.parse("left top")).toThrow();
    expect(() => gradientCornerSchema.parse("center")).toThrow();
    expect(() => gradientCornerSchema.parse("")).toThrow();
  });
});
