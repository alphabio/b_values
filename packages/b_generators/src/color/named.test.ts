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

  it("should validate against color keyword schema", () => {
    // @ts-expect-error testing invalid color name
    const color: NamedColor = { kind: "named", name: "notacolor" };
    const result = Named.generate(color);
    expect(result.ok).toBe(false);
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
