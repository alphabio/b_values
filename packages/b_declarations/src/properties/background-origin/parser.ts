// b_path:: packages/b_declarations/src/properties/background-origin/parser.ts
import { parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import type { BackgroundOriginIR, OriginBoxValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundOrigin = createMultiValueParser<OriginBoxValue, BackgroundOriginIR>({
  preParse(value: string): ParseResult<BackgroundOriginIR> | null {
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

  itemParser(valueNode: csstree.Value): ParseResult<OriginBoxValue> {
    return Parsers.Background.parseBackgroundOriginValue(valueNode);
  },

  aggregator(layers: OriginBoxValue[]): BackgroundOriginIR {
    return { kind: "layers", layers };
  },
});
