import { describe, expect, it } from "@jest/globals";

import { clipFloat, printFloat, safeParseInt } from "./numbers.js";

describe("numbers", () => {
  describe("clipFloat", () => {
    it.each([
      [0.123, 0.12],
      [0.12, 0.12],
      [0.1, 0.1],
      [0, 0],
      [1, 1],
      [1.2, 1.2],
      [1.23, 1.23],
      [1.234, 1.23],
      [1.2345, 1.23],
    ])("clips %s", (input, expected) => {
      expect(clipFloat(input)).toBe(expected);
    });
  });

  describe("printFloat", () => {
    it.each([
      [0.123, "0.12"],
      [0.12, "0.12"],
      [0.1, "0.1"],
      [0, "0"],
      [1, "1"],
      [1.2, "1.2"],
      [1.23, "1.23"],
      [1.234, "1.23"],
      [1.2345, "1.23"],
    ])("clips %s", (input, expected) => {
      expect(printFloat(input)).toBe(expected);
    });
  });

  describe("safeParseInt", () => {
    it.each([
      [undefined, undefined],
      ["-1", -1],
      ["0", 0],
      ["1", 1],
    ])("parses %s", (input, expected) => {
      expect(safeParseInt(input)).toBe(expected);
    });
  });
});
