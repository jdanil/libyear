import { merge } from "lodash-es";
import { default as semver } from "semver";

import { execute } from "./execute.js";
import type { PackageManager } from "./types.js";

const { valid } = semver;

type DependencyData = {
  required?: { version?: string } | string;
  version?: string;
  resolved?: string;
  dependencies?: ParsedDependency;
  devDependencies?: ParsedDependency;
};

type ParsedDependency = Record<
  string,
  DependencyData
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
  });

const transformDependency = ([dependency, data]: [string, DependencyData]): [string, string] => {
  return [
    dependency,
    data.version ??
              (
                (data.required as { version?: string })?.version ||
                (data.required as string)
              ).replace(/[<=>^~]+/u, ""),
  ];
}

const isLocalDependency = (data: DependencyData) => data.resolved?.startsWith('file:');

export const getDependencies = async (
  packageManager: PackageManager,
  flags?: { all?: boolean },
): Promise<Map<string, string>> => {
  const cmd =
    (
      {
        berry: `yarn info ${flags?.all ? "--all" : ""} --json`,
        pnpm: `pnpm ${flags?.all ? "recursive" : ""} list --depth=0 --json`,
      } as Record<PackageManager, string>
    )[packageManager] ?? "npm ls --depth=0 --json --silent";

  const json = await getParsedDependencies(packageManager, cmd);

  const dependencies = Object.entries({
    ...json.dependencies,
    ...json.devDependencies,
  });

  // Keep track of which dependencies are linked locally, ie: monorepos
  const localDeps = new Map(dependencies.filter(([_, data]) => isLocalDependency(data)));

  return new Map(dependencies
    .flatMap(([dependency, data]) => {
      if (isLocalDependency(data)) {
          // This is a local package, recursively add its dependencies instead, but only up to 1 level deep
          return Object.entries({ ...data.dependencies, ...data.devDependencies })
            .map(transformDependency)
            .filter(([depName]) => !localDeps.has(depName));
      }
      return [transformDependency([dependency, data])];
    })
    .filter(([_, version]) => valid(version)));
};

