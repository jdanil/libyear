// TODO [2021-04-01]: replace with `Object.fromEntries()` after dropping node@10.
import * as fromEntries from "fromentries";

import { execute } from "./execute";
import type { PackageManager } from "./types";

const getParsedDependencies = async (
  packageManager: PackageManager,
  cmd: string,
): Promise<any> => {
  const json = JSON.parse(await execute(cmd));

  switch (packageManager) {
    case "pnpm":
      return json[0];
    case "berry":
    case "npm":
    case "yarn":
    default:
      return json;
  }
};

export const getDependencies = async (
  packageManager: PackageManager,
): Promise<{ [key: string]: string }> => {
  const cmd =
    {
      pnpm: "pnpm recursive list --depth=0 --json",
    }[packageManager] ?? "npm ls --depth=0 --json --silent";

  const json = await getParsedDependencies(packageManager, cmd);

  return fromEntries(
    Object.entries({
      ...json.dependencies,
      ...json.devDependencies,
    }).map(
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
