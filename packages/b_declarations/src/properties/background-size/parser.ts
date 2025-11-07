// b_path:: packages/b_declarations/src/properties/background-size/parser.ts

import { parseErr, parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundSize } from "./types";
import type { SizeLayer } from "@b/types";

export const parseBackgroundSize = createMultiValueParser<SizeLayer, BackgroundSize>({
  preParse(value: string): ParseResult<BackgroundSize> | null {
    if (isCSSWideKeyword(value)) {
      const result = parseCSSWideKeyword(value);
      if (result.ok) return parseOk({ kind: "keyword", value: result.value });
      return parseErr(result.issues[0]);
    }
    return null;
  },

  itemParser(valueNode: csstree.Value): ParseResult<SizeLayer> {
    return Parsers.Background.parseBackgroundSizeValue(valueNode);
  },

  aggregator(layers: SizeLayer[]): BackgroundSize {
    return { kind: "layers", layers };
  },
});
