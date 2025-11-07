// b_path:: packages/b_declarations/src/properties/background-clip/parser.ts
import { parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import type { BackgroundClipIR, BoxValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundClip = createMultiValueParser<BoxValue, BackgroundClipIR>({
  preParse(value: string): ParseResult<BackgroundClipIR> | null {
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

  itemParser(valueNode: csstree.Value): ParseResult<BoxValue> {
    return Parsers.Background.parseBackgroundClipValue(valueNode);
  },

  aggregator(layers: BoxValue[]): BackgroundClipIR {
    return { kind: "layers", layers };
  },
});
