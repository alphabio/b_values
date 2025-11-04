import { describe, expect, it } from "vitest";
import { urlSchema } from "./url";

describe("urlSchema", () => {
  it("validates fragment identifier", () => {
    const result = urlSchema.parse({ kind: "url", value: "#clip-shape" });
    expect(result).toEqual({ kind: "url", value: "#clip-shape" });
  });

  it("validates file path", () => {
    const result = urlSchema.parse({ kind: "url", value: "shapes.svg#clip" });
    expect(result).toEqual({ kind: "url", value: "shapes.svg#clip" });
  });

  it("validates absolute URL", () => {
    const result = urlSchema.parse({ kind: "url", value: "https://example.com/image.png" });
    expect(result).toEqual({ kind: "url", value: "https://example.com/image.png" });
  });

  it("validates data URL", () => {
    const result = urlSchema.parse({ kind: "url", value: "data:image/svg+xml,<svg></svg>" });
    expect(result).toEqual({ kind: "url", value: "data:image/svg+xml,<svg></svg>" });
  });

  it("validates empty string", () => {
    const result = urlSchema.parse({ kind: "url", value: "" });
    expect(result).toEqual({ kind: "url", value: "" });
  });

  it("rejects wrong kind", () => {
    expect(() => urlSchema.parse({ kind: "link", value: "test.png" })).toThrow();
  });

  it("rejects missing kind", () => {
    expect(() => urlSchema.parse({ value: "test.png" })).toThrow();
  });

  it("rejects missing value", () => {
    expect(() => urlSchema.parse({ kind: "url" })).toThrow();
  });
});
