// TODO [2021-04-01]: replace with `Object.fromEntries()` after dropping node@10.
import * as fromEntries from "fromentries";

import { execute } from "./execute";
import type { PackageManager } from "./types";

export const getDependencies = async (
  packageManager: PackageManager,
): Promise<{ [key: string]: string }> => {
  const cmd = {
    berry: "npm ls --depth=0 --json --silent",
    npm: "npm ls --depth=0 --json --silent",
    pnpm: "pnpm recursive list --depth=0 --json",
    yarn: "npm ls --depth=0 --json --silent",
  }[packageManager];

  return fromEntries(
    Object.entries(
      JSON.parse(await execute(cmd)).dependencies,
    ).map(
      ([dependency, data]: [
        string,
        { version?: string; required?: { version?: string } | string },
      ]) => [
        dependency,
        data.version ??
          (
            (data.required as { version?: string })?.version ||
            (data.required as string)
          ).replace(/[<=>^~]/u, ""),
      ],
    ),
  );
};
