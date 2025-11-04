// b_path:: packages/b_types/src/color-stop.test.ts
import { describe, expect, it } from "vitest";
import { colorStopListSchema, colorStopSchema } from "./color-stop";

describe("colorStopSchema", () => {
  it("validates color only", () => {
    const result = colorStopSchema.parse({
      color: { kind: "named", name: "red" },
    });
    expect(result).toEqual({
      color: { kind: "named", name: "red" },
    });
  });

  it("validates color with percentage position", () => {
    const result = colorStopSchema.parse({
      color: { kind: "named", name: "blue" },
      position: { value: 50, unit: "%" },
    });
    expect(result).toEqual({
      color: { kind: "named", name: "blue" },
      position: { value: 50, unit: "%" },
    });
  });

  it("validates color with length position", () => {
    const result = colorStopSchema.parse({
      color: { kind: "hex", value: "#FF0000" },
      position: { value: 10, unit: "px" },
    });
    expect(result).toEqual({
      color: { kind: "hex", value: "#FF0000" },
      position: { value: 10, unit: "px" },
    });
  });

  it("validates color with angle position", () => {
    const result = colorStopSchema.parse({
      color: { kind: "named", name: "green" },
      position: { value: 45, unit: "deg" },
    });
    expect(result).toEqual({
      color: { kind: "named", name: "green" },
      position: { value: 45, unit: "deg" },
    });
  });

  it("rejects missing color", () => {
    expect(() => colorStopSchema.parse({ position: { value: 50, unit: "%" } })).toThrow();
  });
});

describe("colorStopListSchema", () => {
  it("validates two color stops", () => {
    const result = colorStopListSchema.parse([
      { color: { kind: "named", name: "red" } },
      { color: { kind: "named", name: "blue" } },
    ]);
    expect(result).toHaveLength(2);
  });

  it("validates multiple color stops with positions", () => {
    const result = colorStopListSchema.parse([
      { color: { kind: "named", name: "red" } },
      { color: { kind: "named", name: "yellow" }, position: { value: 50, unit: "%" } },
      { color: { kind: "named", name: "blue" } },
    ]);
    expect(result).toHaveLength(3);
  });

  it("rejects single color stop", () => {
    expect(() => colorStopListSchema.parse([{ color: { kind: "named", name: "red" } }])).toThrow();
  });

  it("rejects empty array", () => {
    expect(() => colorStopListSchema.parse([])).toThrow();
  });
});
