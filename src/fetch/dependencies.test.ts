import * as assert from "node:assert";
import { readFile } from "node:fs/promises";
import { before, describe, it, mock } from "node:test";
import { fileURLToPath } from "node:url";

import type { PackageManager } from "../types.ts";

const getFixture = async (
  packageManager: PackageManager,
  modifier: "default" | "sans-version",
) =>
  readFile(
    fileURLToPath(
      import.meta.resolve(
        `../../test/fixtures/dependencies/${packageManager}_${modifier}.txt`,
      ),
    ),
    { encoding: "utf8" },
  );

await describe("dependencies", async () => {
  const execute = mock.fn();

  let getDependencies: (
    packageManager: PackageManager,
    flags?: { all?: boolean; dev?: boolean },
  ) => Promise<Record<string, string>>;

  before(async () => {
    mock.module("./execute.ts", {
      namedExports: {
        execute,
      },
    });

    ({ getDependencies } = await import("./dependencies.ts"));
  });

  await describe("getDependencies", async () => {
    for (const packageManager of ["berry", "npm", "pnpm", "yarn"] as const) {
      await it(`returns dependencies for ${packageManager}`, async () => {
        execute.mock.mockImplementationOnce(
          () => getFixture(packageManager, "default") as unknown as undefined,
        );

        assert.deepEqual(await getDependencies(packageManager), {
          "package-a": "1.0.0",
          "package-b": "2.1.0",
          "package-c": "3.2.1",
        });
      });
    }

    for (const packageManager of ["berry", "npm", "pnpm", "yarn"] as const) {
      await it(`returns filtered dependencies for ${packageManager} w/o versions`, async () => {
        execute.mock.mockImplementationOnce(
          () =>
            getFixture(packageManager, "sans-version") as unknown as undefined,
        );

        assert.deepEqual(await getDependencies(packageManager), {
          "package-a": "1.0.0",
        });
      });
    }
  });
});
