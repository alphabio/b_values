// b_path:: packages/b_declarations/src/properties/background-repeat/parser.ts
import type { ParseResult, RepeatStyle, CssValue } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundRepeatIR, RepeatStyleValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundRepeat = createMultiValueParser<RepeatStyleValue, BackgroundRepeatIR>({
  propertyName: "background-repeat",

  itemParser(valueNode: csstree.Value): ParseResult<RepeatStyle | CssValue> {
    return Parsers.Background.parseBackgroundRepeatValue(valueNode);
  },

  aggregator(layers: RepeatStyleValue[]): BackgroundRepeatIR {
    return { kind: "list", values: layers };
  },
});
