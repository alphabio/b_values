// b_path:: packages/b_declarations/src/properties/background-attachment/parser.ts
import { parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { isCSSWideKeyword, parseCSSWideKeyword, createMultiValueParser } from "../../utils";
import type { BackgroundAttachmentIR, AttachmentValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundAttachment = createMultiValueParser<AttachmentValue, BackgroundAttachmentIR>({
  preParse(value: string): ParseResult<BackgroundAttachmentIR> | null {
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

  itemParser(valueNode: csstree.Value): ParseResult<AttachmentValue> {
    return Parsers.Background.parseBackgroundAttachmentValue(valueNode);
  },

  aggregator(layers: AttachmentValue[]): BackgroundAttachmentIR {
    return { kind: "layers", layers };
  },
});
