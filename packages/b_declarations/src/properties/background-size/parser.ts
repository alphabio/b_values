// b_path:: packages/b_declarations/src/properties/background-size/parser.ts

import type { ParseResult, BgSize } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundSize } from "./types";

export const parseBackgroundSize = createMultiValueParser<BgSize, BackgroundSize>({
  itemParser(valueNode: csstree.Value): ParseResult<BgSize> {
    return Parsers.Background.parseBackgroundSizeValue(valueNode);
  },

  aggregator(values: BgSize[]): BackgroundSize {
    return { kind: "list", values };
  },
});
