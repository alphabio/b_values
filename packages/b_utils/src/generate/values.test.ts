// b_path:: packages/b_utils/src/generate/values.test.ts
import { describe, expect, it } from "vitest";
import * as Values from "./values";
import type { Angle, Length, LengthPercentage, Position2D } from "@b/types";

describe("values generators", () => {
  describe("lengthToCss", () => {
    it("should generate px length", () => {
      const length: Length = { value: 100, unit: "px" };
      expect(Values.lengthToCss(length)).toBe("100px");
    });

    it("should generate rem length", () => {
      const length: Length = { value: 2.5, unit: "rem" };
      expect(Values.lengthToCss(length)).toBe("2.5rem");
    });

    it("should generate vw length", () => {
      const length: Length = { value: 50, unit: "vw" };
      expect(Values.lengthToCss(length)).toBe("50vw");
    });

    it("should generate em length", () => {
      const length: Length = { value: 1.5, unit: "em" };
      expect(Values.lengthToCss(length)).toBe("1.5em");
    });
  });

  describe("lengthPercentageToCss", () => {
    it("should generate px length-percentage", () => {
      const lp: LengthPercentage = { value: 100, unit: "px" };
      expect(Values.lengthPercentageToCss(lp)).toBe("100px");
    });

    it("should generate percentage", () => {
      const lp: LengthPercentage = { value: 50, unit: "%" };
      expect(Values.lengthPercentageToCss(lp)).toBe("50%");
    });

    it("should generate rem length-percentage", () => {
      const lp: LengthPercentage = { value: 2, unit: "rem" };
      expect(Values.lengthPercentageToCss(lp)).toBe("2rem");
    });
  });

  describe("angleToCss", () => {
    it("should generate deg angle", () => {
      const angle: Angle = { value: 90, unit: "deg" };
      expect(Values.angleToCss(angle)).toBe("90deg");
    });

    it("should generate rad angle", () => {
      const angle: Angle = { value: 3.14, unit: "rad" };
      expect(Values.angleToCss(angle)).toBe("3.14rad");
    });

    it("should generate turn angle", () => {
      const angle: Angle = { value: 0.25, unit: "turn" };
      expect(Values.angleToCss(angle)).toBe("0.25turn");
    });

    it("should generate grad angle", () => {
      const angle: Angle = { value: 100, unit: "grad" };
      expect(Values.angleToCss(angle)).toBe("100grad");
    });
  });

  describe("numberToCss", () => {
    it("should generate integer number", () => {
      expect(Values.numberToCss(42)).toBe("42");
    });

    it("should generate decimal number", () => {
      expect(Values.numberToCss(3.14)).toBe("3.14");
    });

    it("should generate zero", () => {
      expect(Values.numberToCss(0)).toBe("0");
    });

    it("should generate negative number", () => {
      expect(Values.numberToCss(-5)).toBe("-5");
    });
  });

  describe("position2DToCss", () => {
    it("should generate center center", () => {
      const position: Position2D = {
        horizontal: { kind: "keyword", value: "center" },
        vertical: { kind: "keyword", value: "center" },
      };
      expect(Values.position2DToCss(position)).toBe("center center");
    });

    it("should generate left top", () => {
      const position: Position2D = {
        horizontal: { kind: "keyword", value: "left" },
        vertical: { kind: "keyword", value: "top" },
      };
      expect(Values.position2DToCss(position)).toBe("left top");
    });

    it("should generate percentage positions", () => {
      const position: Position2D = {
        horizontal: { kind: "literal", value: 25, unit: "%" },
        vertical: { kind: "literal", value: 75, unit: "%" },
      };
      expect(Values.position2DToCss(position)).toBe("25% 75%");
    });

    it("should generate mixed keyword and length", () => {
      const position: Position2D = {
        horizontal: { kind: "keyword", value: "left" },
        vertical: { kind: "literal", value: 50, unit: "px" },
      };
      expect(Values.position2DToCss(position)).toBe("left 50px");
    });

    it("should generate px positions", () => {
      const position: Position2D = {
        horizontal: { kind: "literal", value: 100, unit: "px" },
        vertical: { kind: "literal", value: 200, unit: "px" },
      };
      expect(Values.position2DToCss(position)).toBe("100px 200px");
    });
  });

  describe("joinCssValues", () => {
    it("should join with commas", () => {
      const values = ["red", "green", "blue"];
      expect(Values.joinCssValues(values)).toBe("red, green, blue");
    });

    it("should join single value", () => {
      const values = ["red"];
      expect(Values.joinCssValues(values)).toBe("red");
    });

    it("should join empty array", () => {
      const values: string[] = [];
      expect(Values.joinCssValues(values)).toBe("");
    });
  });

  describe("joinCssValuesWithSpaces", () => {
    it("should join with spaces", () => {
      const values = ["10px", "20px", "30px"];
      expect(Values.joinCssValuesWithSpaces(values)).toBe("10px 20px 30px");
    });

    it("should join single value", () => {
      const values = ["10px"];
      expect(Values.joinCssValuesWithSpaces(values)).toBe("10px");
    });

    it("should join empty array", () => {
      const values: string[] = [];
      expect(Values.joinCssValuesWithSpaces(values)).toBe("");
    });
  });
});
