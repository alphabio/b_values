// b_path:: packages/b_types/src/color-stop.test.ts
import { describe, expect, it } from "vitest";
import { angularColorHintSchema, colorStopListSchema, colorStopSchema } from "./color-stop";

describe("colorStopSchema", () => {
  it("validates color only", () => {
    const result = colorStopSchema.parse({
      color: { kind: "named", name: "red" },
    });
    expect(result).toEqual({
      color: { kind: "named", name: "red" },
    });
  });

  it("validates color with single percentage position", () => {
    const result = colorStopSchema.parse({
      color: { kind: "named", name: "blue" },
      position: { value: 50, unit: "%" },
    });
    expect(result).toEqual({
      color: { kind: "named", name: "blue" },
      position: { value: 50, unit: "%" },
    });
  });

  it("validates color with single length position", () => {
    const result = colorStopSchema.parse({
      color: { kind: "hex", value: "#FF0000" },
      position: { value: 10, unit: "px" },
    });
    expect(result).toEqual({
      color: { kind: "hex", value: "#FF0000" },
      position: { value: 10, unit: "px" },
    });
  });

  it("validates color with single angle position", () => {
    const result = colorStopSchema.parse({
      color: { kind: "named", name: "green" },
      position: { value: 45, unit: "deg" },
    });
    expect(result).toEqual({
      color: { kind: "named", name: "green" },
      position: { value: 45, unit: "deg" },
    });
  });

  it("validates color with dual positions", () => {
    const result = colorStopSchema.parse({
      color: { kind: "named", name: "red" },
      position: [
        { value: 10, unit: "%" },
        { value: 30, unit: "%" },
      ],
    });
    expect(result).toEqual({
      color: { kind: "named", name: "red" },
      position: [
        { value: 10, unit: "%" },
        { value: 30, unit: "%" },
      ],
    });
  });

  it("validates color with dual angle positions", () => {
    const result = colorStopSchema.parse({
      color: { kind: "named", name: "blue" },
      position: [
        { value: 0, unit: "deg" },
        { value: 90, unit: "deg" },
      ],
    });
    expect(result).toEqual({
      color: { kind: "named", name: "blue" },
      position: [
        { value: 0, unit: "deg" },
        { value: 90, unit: "deg" },
      ],
    });
  });

  it("rejects missing color", () => {
    expect(() => colorStopSchema.parse({ position: { value: 50, unit: "%" } })).toThrow();
  });
});

describe("angularColorHintSchema", () => {
  it("validates angle hint", () => {
    const result = angularColorHintSchema.parse({ value: 45, unit: "deg" });
    expect(result).toEqual({ value: 45, unit: "deg" });
  });

  it("validates percentage hint", () => {
    const result = angularColorHintSchema.parse({ value: 50, unit: "%" });
    expect(result).toEqual({ value: 50, unit: "%" });
  });

  it("validates zero without unit", () => {
    const result = angularColorHintSchema.parse({ value: 0 });
    expect(result).toEqual({ value: 0 });
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

  it("validates color stops with dual positions", () => {
    const result = colorStopListSchema.parse([
      {
        color: { kind: "named", name: "red" },
        position: [
          { value: 0, unit: "%" },
          { value: 25, unit: "%" },
        ],
      },
      { color: { kind: "named", name: "blue" } },
    ]);
    expect(result).toHaveLength(2);
  });

  it("rejects single color stop", () => {
    expect(() => colorStopListSchema.parse([{ color: { kind: "named", name: "red" } }])).toThrow();
  });

  it("rejects empty array", () => {
    expect(() => colorStopListSchema.parse([])).toThrow();
  });
});
