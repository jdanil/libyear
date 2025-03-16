import * as assert from "node:assert";
import { describe, it } from "node:test";

import { clipFloat, printFloat, safeParseInt } from "./number.ts";

await describe("number", async () => {
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
        assert.equal(clipFloat(input), expected);
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
        assert.equal(printFloat(input), expected);
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
        assert.equal(safeParseInt(input), expected);
      });
    }
  });
});
