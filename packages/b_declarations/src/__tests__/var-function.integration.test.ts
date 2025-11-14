// b_path:: packages/b_declarations/src/__tests__/var-function.integration.test.ts

import { describe, expect, it } from "vitest";
import { parseDeclaration } from "..";
import { parseDeclarationList } from "../declaration-list-parser";

describe("var() function - integration", () => {
  describe("simple var() references", () => {
    it("should parse var() in background-size", () => {
      const result = parseDeclaration("background-size: var(--size)");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        property: "background-size",
        ir: {
          kind: "list",
          values: [
            {
              kind: "variable",
              name: "--size",
            },
          ],
        },
      });
    });

    it("should parse var() in background-clip", () => {
      const result = parseDeclaration("background-clip: var(--clip)");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        property: "background-clip",
        ir: {
          kind: "list",
          values: [
            {
              kind: "variable",
              name: "--clip",
            },
          ],
        },
      });
    });

    it("should parse var() in background-repeat", () => {
      const result = parseDeclaration("background-repeat: var(--repeat)");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        property: "background-repeat",
        ir: {
          kind: "list",
          values: [
            {
              kind: "variable",
              name: "--repeat",
            },
          ],
        },
      });
    });
  });

  describe("var() with fallbacks", () => {
    it("should parse var() with literal fallback", () => {
      const result = parseDeclaration("background-size: var(--special-size, 50%)");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        property: "background-size",
        ir: {
          kind: "list",
          values: [
            {
              kind: "variable",
              name: "--special-size",
              fallback: {
                kind: "literal",
                value: 50,
                unit: "%",
              },
            },
          ],
        },
      });
    });

    it("should parse var() with keyword fallback", () => {
      const result = parseDeclaration("background-clip: var(--clip-type, border-box)");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        property: "background-clip",
        ir: {
          kind: "list",
          values: [
            {
              kind: "variable",
              name: "--clip-type",
              fallback: {
                kind: "keyword",
                value: "border-box",
              },
            },
          ],
        },
      });
    });

    it("should parse nested var() fallbacks", () => {
      const result = parseDeclaration("background-repeat: var(--bg-repeat-val, var(--fallback-repeat, repeat))");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        property: "background-repeat",
        ir: {
          kind: "list",
          values: [
            {
              kind: "variable",
              name: "--bg-repeat-val",
              fallback: {
                kind: "variable",
                name: "--fallback-repeat",
                fallback: {
                  kind: "keyword",
                  value: "repeat",
                },
              },
            },
          ],
        },
      });
    });
  });

  describe("var() in multi-value contexts", () => {
    it("should parse var() mixed with other values in background-image", () => {
      const result = parseDeclaration('background-image: var(--gradient-overlay), url("pattern.svg"), none');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        property: "background-image",
        ir: {
          kind: "list",
          values: [
            {
              kind: "variable",
              name: "--gradient-overlay",
            },
            {
              kind: "url",
              url: "pattern.svg",
            },
            {
              kind: "none",
            },
          ],
        },
      });
    });
  });

  describe("var() in declaration lists", () => {
    it("should parse multiple declarations with var() and custom properties", () => {
      const result = parseDeclarationList(`
        --brand-color: #0066cc;
        --default-size: 100px;
        --bg-repeat-val: no-repeat;

        background-size: var(--special-size, 50%);
        background-clip: var(--clip-type, border-box);
        background-repeat: var(--bg-repeat-val, var(--fallback-repeat, repeat));
      `);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toHaveLength(6);

      // Custom properties
      expect(result.value[0]).toEqual({
        property: "--brand-color",
        ir: {
          kind: "raw",
          value: "#0066cc",
        },
      });

      expect(result.value[1]).toEqual({
        property: "--default-size",
        ir: {
          kind: "raw",
          value: "100px",
        },
      });

      expect(result.value[2]).toEqual({
        property: "--bg-repeat-val",
        ir: {
          kind: "raw",
          value: "no-repeat",
        },
      });

      // Properties with var()
      expect(result.value[3].property).toBe("background-size");
      expect(result.value[3].ir).toMatchObject({
        kind: "list",
        values: [
          {
            kind: "variable",
            name: "--special-size",
          },
        ],
      });

      expect(result.value[4].property).toBe("background-clip");
      expect(result.value[4].ir).toMatchObject({
        kind: "list",
        values: [
          {
            kind: "variable",
            name: "--clip-type",
          },
        ],
      });

      expect(result.value[5].property).toBe("background-repeat");
      expect(result.value[5].ir).toMatchObject({
        kind: "list",
        values: [
          {
            kind: "variable",
            name: "--bg-repeat-val",
          },
        ],
      });
    });
  });
});
