/**
 * CSS Tree syntax parsing error
 */
export interface CssTreeSyntaxParseError {
  name: string;
  message: string;
  line?: number;
  column?: number;
  property?: string;
  offset?: number;
  length?: number;
}

/**
 * Custom warning for CSS property validation
 */
export interface BStyleWarning {
  /** CSS property that has the warning */
  property: string;
  /** Warning name/type */
  name: string;
  /** CSS syntax that caused the warning */
  syntax?: string;
  /** Formatted warning message for display */
  formattedWarning?: string;
}

/**
 * Result of CSS stylesheet validation
 */
export interface StylesheetValidation {
  /** Whether validation passed (no errors) */
  ok: boolean;
  /** Array of syntax parsing errors */
  errors: CssTreeSyntaxParseError[];
  /** Array of property validation warnings */
  warnings: BStyleWarning[];
}
