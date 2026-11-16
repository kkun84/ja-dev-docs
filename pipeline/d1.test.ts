import { expect, it } from "vitest";
import { literal } from "./d1.ts";

it("SQLのリテラルにするとき、引用符をエスケープする", () => {
  expect(literal("a'b")).toBe("'a''b'");
  expect(literal(3)).toBe("3");
  expect(literal(undefined)).toBe("NULL");
});
