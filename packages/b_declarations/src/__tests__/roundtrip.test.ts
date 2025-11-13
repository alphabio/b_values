// b_path:: packages/b_declarations/src/__tests__/roundtrip.test.ts
import { describe, it, expect } from "vitest";
import { parseDeclaration } from "../parser";
import { generateDeclaration } from "../generator";
import "../properties";

describe("Box Model Round-trip Tests", () => {
  describe("padding-top", () => {
    it("10px → parse → generate → 10px", () => {
      const css = "padding-top: 10px";
      const parsed = parseDeclaration(css);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = generateDeclaration(parsed.value as any);
      expect(generated.ok).toBe(true);
      expect(generated.value).toBe("padding-top: 10px");
    });

    it("2rem → parse → generate → 2rem", () => {
      const css = "padding-top: 2rem";
      const parsed = parseDeclaration(css);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = generateDeclaration(parsed.value as any);
      expect(generated.ok).toBe(true);
      expect(generated.value).toBe("padding-top: 2rem");
    });
  });

  describe("margin-top", () => {
    it("auto → parse → generate → auto", () => {
      const css = "margin-top: auto";
      const parsed = parseDeclaration(css);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = generateDeclaration(parsed.value as any);
      expect(generated.ok).toBe(true);
      expect(generated.value).toBe("margin-top: auto");
    });

    it("10px → parse → generate → 10px", () => {
      const css = "margin-top: 10px";
      const parsed = parseDeclaration(css);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = generateDeclaration(parsed.value as any);
      expect(generated.ok).toBe(true);
      expect(generated.value).toBe("margin-top: 10px");
    });
  });

  describe("border-top-width", () => {
    it("thin → parse → generate → thin", () => {
      const css = "border-top-width: thin";
      const parsed = parseDeclaration(css);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = generateDeclaration(parsed.value as any);
      expect(generated.ok).toBe(true);
      expect(generated.value).toBe("border-top-width: thin");
    });

    it("2px → parse → generate → 2px", () => {
      const css = "border-top-width: 2px";
      const parsed = parseDeclaration(css);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = generateDeclaration(parsed.value as any);
      expect(generated.ok).toBe(true);
      expect(generated.value).toBe("border-top-width: 2px");
    });
  });

  describe("border-top-left-radius", () => {
    it("5px (circular) → parse → generate → 5px", () => {
      const css = "border-top-left-radius: 5px";
      const parsed = parseDeclaration(css);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = generateDeclaration(parsed.value as any);
      expect(generated.ok).toBe(true);
      expect(generated.value).toBe("border-top-left-radius: 5px");
    });

    it("10px 20px (elliptical) → parse → generate → 10px 20px", () => {
      const css = "border-top-left-radius: 10px 20px";
      const parsed = parseDeclaration(css);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const generated = generateDeclaration(parsed.value as any);
      expect(generated.ok).toBe(true);
      expect(generated.value).toBe("border-top-left-radius: 10px 20px");
    });
  });
});
