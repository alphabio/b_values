// b_path:: packages/b_declarations/src/properties/background-attachment/parser.ts
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundAttachmentIR, AttachmentValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundAttachment = createMultiValueParser<AttachmentValue, BackgroundAttachmentIR>({
  propertyName: "background-attachment",

  itemParser(valueNode: csstree.Value): ParseResult<AttachmentValue> {
    return Parsers.Background.parseBackgroundAttachmentValue(valueNode);
  },

  aggregator(layers: AttachmentValue[]): BackgroundAttachmentIR {
    return { kind: "list", values: layers };
  },
});
