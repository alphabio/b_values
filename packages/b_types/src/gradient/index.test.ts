// b_path:: packages/b_types/src/gradient/index.test.ts
import { describe, expect, it } from "vitest";
import { gradientSchema } from "./index";

describe("gradientSchema", () => {
  it("validates linear gradient", () => {
    const result = gradientSchema.parse({
      kind: "linear",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.kind).toBe("linear");
  });

  it("validates radial gradient", () => {
    const result = gradientSchema.parse({
      kind: "radial",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.kind).toBe("radial");
  });

  it("validates conic gradient", () => {
    const result = gradientSchema.parse({
      kind: "conic",
      colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
      repeating: false,
    });
    expect(result.kind).toBe("conic");
  });

  it("rejects invalid gradient kind", () => {
    expect(() =>
      gradientSchema.parse({
        kind: "invalid",
        colorStops: [{ color: { kind: "named", name: "red" } }, { color: { kind: "named", name: "blue" } }],
        repeating: false,
      }),
    ).toThrow();
  });
});
