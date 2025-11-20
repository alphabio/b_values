// b_path:: packages/b_declarations/src/properties/background-position-y/parser.ts

import type { ParseResult, CssValue } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundPositionYIR } from "./types";

export const parseBackgroundPositionY = createMultiValueParser<CssValue, BackgroundPositionYIR>({
  propertyName: "background-position-y",

  itemParser(valueNode: csstree.Value): ParseResult<CssValue> {
    const firstNode = valueNode.children.first;
    if (!firstNode) {
      return {
        ok: false,
        property: "background-position-y",
        value: undefined,
        issues: [{ code: "missing-value", severity: "error", message: "Empty value" }],
      };
    }
    return Parsers.Utils.parseNodeToCssValue(firstNode);
  },

  aggregator(values: CssValue[]): BackgroundPositionYIR {
    return { kind: "list", values };
  },
});
