// b_path:: packages/b_declarations/src/utilities/position/parser.ts

import type { ParseResult, Position2D } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundPositionIR } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundPosition = createMultiValueParser<Position2D, BackgroundPositionIR>({
  propertyName: "background-position",

  itemParser(valueNode: csstree.Value): ParseResult<Position2D> {
    const nodes = Array.from(valueNode.children);
    const result = Parsers.Position.parsePosition2D(nodes, 0);
    if (result.ok) {
      return {
        ok: true,
        property: "background-position",
        value: result.value.position,
        issues: result.issues,
      };
    }
    return result as ParseResult<Position2D>;
  },

  aggregator(values: Position2D[]): BackgroundPositionIR {
    return { kind: "list", values };
  },
});
