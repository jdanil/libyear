import { describe, it } from "node:test";

import { expect } from "expect";

import { clipFloat, printFloat, safeParseInt } from "./numbers.ts";

await describe("numbers", async () => {
  await describe("clipFloat", async () => {
    for (const [input, expected] of [
      [0.123, 0.12],
      [0.12, 0.12],
      [0.1, 0.1],
      [0, 0],
      [1, 1],
      [1.2, 1.2],
      [1.23, 1.23],
      [1.234, 1.23],
      [1.2345, 1.23],
    ] as const) {
      await it(`clips ${input}`, () => {
        expect(clipFloat(input)).toBe(expected);
      });
    }
  });

  await describe("printFloat", async () => {
    for (const [input, expected] of [
      [0.123, "0.12"],
      [0.12, "0.12"],
      [0.1, "0.1"],
      [0, "0"],
      [1, "1"],
      [1.2, "1.2"],
      [1.23, "1.23"],
      [1.234, "1.23"],
      [1.2345, "1.23"],
    ] as const) {
      await it(`prints ${input}`, () => {
        expect(printFloat(input)).toBe(expected);
      });
    }
  });

  await describe("safeParseInt", async () => {
    for (const [input, expected] of [
      [undefined, undefined],
      ["-1", -1],
      ["0", 0],
      ["1", 1],
    ] as const) {
      await it(`parses ${input}`, () => {
        expect(safeParseInt(input)).toBe(expected);
      });
    }
  });
});
