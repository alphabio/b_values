// b_path:: packages/b_declarations/src/properties/background-repeat/parser.ts
import type { ParseResult, RepeatStyle } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundRepeatIR } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundRepeat = createMultiValueParser<RepeatStyle, BackgroundRepeatIR>({
  itemParser(valueNode: csstree.Value): ParseResult<RepeatStyle> {
    return Parsers.Background.parseBackgroundRepeatValue(valueNode);
  },

  aggregator(layers: RepeatStyle[]): BackgroundRepeatIR {
    return { kind: "layers", layers };
  },
});
