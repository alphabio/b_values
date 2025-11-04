// b_path:: packages/b_types/src/color/named.test.ts
import { describe, expect, it } from "vitest";
import { namedColorSchema } from "./named";

describe("namedColorSchema", () => {
  it("validates basic named colors", () => {
    const result = namedColorSchema.safeParse({
      kind: "named",
      name: "red",
    });
    expect(result.success).toBe(true);
  });

  it("validates extended named colors", () => {
    const result = namedColorSchema.safeParse({
      kind: "named",
      name: "cornflowerblue",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid color names", () => {
    const result = namedColorSchema.safeParse({
      kind: "named",
      name: "notacolor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects uppercase color names", () => {
    const result = namedColorSchema.safeParse({
      kind: "named",
      name: "RED",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong kind", () => {
    const result = namedColorSchema.safeParse({
      kind: "hex",
      name: "red",
    });
    expect(result.success).toBe(false);
  });
});
