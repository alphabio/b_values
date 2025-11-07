// b_path:: packages/b_declarations/src/properties/background-repeat/parser.ts
import { parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import type { BackgroundRepeatIR, RepeatStyle } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundRepeat = createMultiValueParser<RepeatStyle, BackgroundRepeatIR>({
  preParse(value: string): ParseResult<BackgroundRepeatIR> | null {
    if (isCSSWideKeyword(value)) {
      const result = parseCSSWideKeyword(value);
      if (result.ok) {
        return parseOk({
          kind: "keyword",
          value: result.value,
        });
      }
    }
    return null;
  },

  itemParser(valueNode: csstree.Value): ParseResult<RepeatStyle> {
    return Parsers.Background.parseBackgroundRepeatValue(valueNode);
  },

  aggregator(layers: RepeatStyle[]): BackgroundRepeatIR {
    return { kind: "layers", layers };
  },
});
