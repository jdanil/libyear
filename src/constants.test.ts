import { describe, it } from "node:test";

import { expect } from "expect";

import { PACKAGE_NAME_REGEXP } from "./constants.ts";

await describe("constants", async () => {
  await describe("PACKAGE_NAME_REGEXP", async () => {
    for (const [input, expected] of [
      ["package", true],
      ["packag3", true],
      ["9ackage", true],
      ["9431493", true],
      ["pack-age", true],
      ["pack.age", true],
      ["pack_age", true],
      ["p", true],
      ["@scope/package", true],
      ["@sco-pe/package", true],
      ["@sco.pe/package", true],
      ["@sco_pe/package", true],
      ["@scope/pack.age", true],
      ["@scope/p", true],
      ["@s/package", true],
      ["", false],
      [" ", false],
      ["PACKAGE", false],
      [" package", false],
      ["package ", false],
      ["p@ck@ge", false],
      [".package", false],
      ["_package", false],
      ["package!", false],
      ["package*", false],
      ["package~", false],
      ['"package"', false],
      ["'package'", false],
      ["(package)", false],
      ["@scope", false],
      ["@scope/", false],
      ["scope/package", false],
      ["scope:package", false],
      ["@scope package", false],
      ["@scope\\package", false],
      ["@scope/pack/age", false],
      ["@-scope/package", false],
      ["@.scope/package", false],
      ["@_scope/package", false],
    ] as const) {
      await it(`matches "${input}" as ${expected}`, () => {
        expect(new RegExp(`^${PACKAGE_NAME_REGEXP.source}$`).test(input)).toBe(
          expected,
        );
      });
    }
  });
});
