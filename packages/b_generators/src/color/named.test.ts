// b_path:: packages/b_generators/src/color/named.test.ts
import { describe, expect, it } from "vitest";
import type { NamedColor } from "@b/types";
import * as Named from "./named";

describe("named color generator", () => {
  it("should generate lowercase color name", () => {
    const color: NamedColor = { kind: "named", name: "red" };
    const result = Named.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("red");
    }
  });

  it("should generate multi-word color name", () => {
    const color: NamedColor = { kind: "named", name: "cornflowerblue" };
    const result = Named.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("cornflowerblue");
    }
  });

  it("should generate invalid color name with warning", () => {
    // @ts-expect-error testing invalid color name
    const color: NamedColor = { kind: "named", name: "notacolor" };
    const result = Named.generate(color);

    // We CAN represent this (ok: true), but with a warning
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toBe("notacolor");
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({
      code: "invalid-value",
      severity: "warning",
      message: expect.stringContaining("Unknown named color"),
      suggestion: expect.any(String),
    });
  });

  it("should generate rebeccapurple", () => {
    const color: NamedColor = { kind: "named", name: "rebeccapurple" };
    const result = Named.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rebeccapurple");
    }
  });
});
