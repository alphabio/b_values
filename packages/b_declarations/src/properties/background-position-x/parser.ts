// b_path:: packages/b_declarations/src/properties/background-position-x/parser.ts

import type { ParseResult, CssValue } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundPositionXIR } from "./types";

export const parseBackgroundPositionX = createMultiValueParser<CssValue, BackgroundPositionXIR>({
  propertyName: "background-position-x",

  itemParser(valueNode: csstree.Value): ParseResult<CssValue> {
    const firstNode = valueNode.children.first;
    if (!firstNode) {
      return {
        ok: false,
        property: "background-position-x",
        value: undefined,
        issues: [{ code: "missing-value", severity: "error", message: "Empty value" }],
      };
    }
    return Parsers.Utils.parseNodeToCssValue(firstNode);
  },

  aggregator(values: CssValue[]): BackgroundPositionXIR {
    return { kind: "list", values };
  },
});
