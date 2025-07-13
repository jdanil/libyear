import { merge } from "lodash-es";
import { valid } from "semver";

import type { PackageManager } from "../types.ts";
import { execute } from "./execute.ts";

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
): Promise<ParsedDependencies> =>
  execute(cmd).then((stdout) => {
    switch (packageManager) {
      case "pnpm":
        return merge(
          ...(JSON.parse(stdout) as [
            ParsedDependencies,
            ...ParsedDependencies[],
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
                [dependency.value
                  .split(/@(npm|patch|workspace):/)
                  .at(0) as string]: {
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
  });

export const getDependencies = async (
  packageManager: PackageManager,
  flags?: { all?: boolean; dev?: boolean },
): Promise<Record<string, string>> => {
  const cmd =
    (
      {
        berry: `yarn info ${flags?.all ? "--all" : ""} --json`,
        pnpm: `pnpm list ${flags?.all ? "--recursive" : ""} --json`,
      } as Record<PackageManager, string>
    )[packageManager] ??
    `npm ls --depth=0 --json ${flags?.dev ? "" : "--omit=dev"} --silent ${flags?.all ? "--workspaces" : ""}`;

  return getParsedDependencies(packageManager, cmd).then((json) =>
    Object.fromEntries(
      Object.entries({
        ...json.dependencies,
        ...(flags?.dev ? json.devDependencies : {}),
      })
        .map(([dependency, data]) => [
          dependency,
          data.version ??
            (
              (data.required as { version?: string })?.version ||
              (data.required as string)
            )?.replace(/[<=>^~]+/u, ""),
        ])
        .filter(([, version]) => valid(version)) as [[string, string]],
    ),
  );
};
