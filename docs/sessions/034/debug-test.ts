import { describe, it, expect } from "vitest";
import * as Linear from "../../../packages/b_parsers/src/gradient/linear";

describe("Debug RGB parsing", () => {
  it("shows error for rgb colors", () => {
    const css = "linear-gradient(rgb(255, 0, 0), rgb(0, 0, 255))";
    const result = Linear.parse(css);

    console.log("Result:", JSON.stringify(result, null, 2));
    
    if (!result.ok) {
      console.log("Error message:", result.error.message);
      console.log("Error details:", result.error.details);
    }
  });
});
