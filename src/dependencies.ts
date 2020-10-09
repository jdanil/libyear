// TODO [2021-04-01]: replace with `Object.fromEntries()` after dropping node@10.
import * as fromEntries from "fromentries";
import { merge } from "lodash";

import { execute } from "./execute";
import type { PackageManager } from "./types";

type ParsedDependency = Record<
  string,
  { required?: { version?: string } | string; version?: string }
>;
type ParsedDependencies = Record<
  "dependencies" | "devDependencies",
  ParsedDependency
>;

const getParsedDependencies = async (
  packageManager: PackageManager,
  cmd: string,
): Promise<ParsedDependencies> => {
  const stdout = await execute(cmd);

  switch (packageManager) {
    case "pnpm":
      return merge(
        ...(JSON.parse(stdout) as [
          ParsedDependencies,
          ...ParsedDependencies[]
        ]),
      ) as ParsedDependencies;
    case "berry":
      return {
        dependencies: merge(
          ...(stdout
            .split("\n")
            .map(
              (dependency) =>
                JSON.parse(dependency) as {
                  value: string;
                  children: {
                    Version: string;
                  };
                },
            )
            .filter((dependency) => !/@workspace:/.test(dependency.value))
            .map((dependency) => ({
              [dependency.value.split(/@(npm|patch|workspace):/)[0]]: {
                version: dependency.children.Version,
              },
            })) as [ParsedDependency, ...ParsedDependency[]]),
        ) as ParsedDependency,
        devDependencies: {},
      };
    case "npm":
    case "yarn":
    default:
      return JSON.parse(stdout) as ParsedDependencies;
  }
};

export const getDependencies = async (
  packageManager: PackageManager,
  flags?: { all?: boolean },
): Promise<Record<string, string>> => {
  const cmd =
    ({
      berry: `yarn info ${flags?.all ? "--all" : ""} --json`,
      pnpm: `pnpm ${flags?.all ? "recursive" : ""} list --depth=0 --json`,
    } as Record<PackageManager, string>)[packageManager] ??
    "npm ls --depth=0 --json --silent";

  const json = await getParsedDependencies(packageManager, cmd);

  return fromEntries(
    Object.entries({
      ...json.dependencies,
      ...json.devDependencies,
    }).map(([dependency, data]) => [
      dependency,
      data.version ??
        (
          (data.required as { version?: string })?.version ||
          (data.required as string)
        ).replace(/[<=>^~]/u, ""),
    ]),
  );
};
