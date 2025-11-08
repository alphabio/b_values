// b_path:: packages/b_declarations/src/properties/background-clip/parser.ts
import type * as csstree from "@eslint/css-tree";
import type { ParseResult, CssValue } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundClipIR } from "./types";

export const parseBackgroundClip = createMultiValueParser<CssValue, BackgroundClipIR>({
  itemParser(valueNode: csstree.Value): ParseResult<CssValue> {
    return Parsers.Background.parseBackgroundClipValue(valueNode);
  },

  aggregator(layers: CssValue[]): BackgroundClipIR {
    return { kind: "list", values: layers };
  },
});
