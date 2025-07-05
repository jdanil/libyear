import {
  getInferredPackageManager,
  getParsedPackageManager,
} from "../fetch/package-manager.ts";
import { libyear } from "../libyear.ts";
import { getArgs } from "./args.ts";
import { getConfiguration } from "./configuration.ts";
import { print } from "./print.ts";

const validateLimit = (limit: unknown): number | undefined =>
  Number.isNaN(Number(limit)) ? undefined : Number(limit);

export const cli = async (): Promise<void> => {
  const args = getArgs();

  const { all, help, json, packageManager, preReleases, quiet, sort, ...rest } =
    args;

  if (help) {
    console.log(
      [
        "─── Usage ".padEnd(80, "─"),
        "$ libyear <options>",
        "─── Options ".padEnd(80, "─"),
        "--all                            Include dependencies from the whole project.",
        "--config                         Path to a libyear configuration file.",
        "--help, -h                       Show help.",
        "--json                           Outputs the report to the console as valid JSON.",
        '--package-manager                Accepts "berry", "npm", "pnpm", "yarn"',
        "--pre-releases                   Include pre-releases in latest versions.",
        "--quiet, -q                      Exclude up-to-date dependencies from results.",
        "--sort                           Column to sort individual results by.",
        "--limit-drift-collective, -D     Drift limit to warn on for all dependencies.",
        "--limit-drift-individual, -d     Drift limit to warn on for individual dependencies.",
        "--limit-pulse-collective, -P     Pulse limit to warn on for all dependencies.",
        "--limit-pulse-individual, -p     Pulse limit to warn on for individual dependencies.",
        "--limit-releases-collective, -R  Releases limit to warn on for all dependencies.",
        "--limit-releases-individual, -r  Releases limit to warn on for individual dependencies.",
        "--limit-major-collective, -X     Major releases limit to warn on for all dependencies.",
        "--limit-major-individual, -x     Major releases limit to warn on for individual dependencies.",
        "--limit-minor-collective, -Y     Minor releases limit to warn on for all dependencies.",
        "--limit-minor-individual, -y     Minor releases limit to warn on for individual dependencies.",
        "--limit-patch-collective, -Z     Patch releases limit to warn on for all dependencies.",
        "--limit-patch-individual, -z     Patch releases limit to warn on for individual dependencies.",
      ].join("\n"),
    );

    return;
  }

  // run libyear
  try {
    const report = await libyear(
      getParsedPackageManager(
        packageManager ?? (await getInferredPackageManager()),
      ),
      { all, preReleases, quiet, sort },
    );

    if (json) {
      console.log(JSON.stringify(report));
    } else {
      const { overrides, limit } = await getConfiguration(rest).then(
        ({
          overrides,
          limit: { drift, pulse, releases, major, minor, patch } = {},
        }) => ({
          overrides,
          limit: {
            driftCollective: validateLimit(drift?.collective),
            driftIndividual: validateLimit(drift?.individual),
            pulseCollective: validateLimit(pulse?.collective),
            pulseIndividual: validateLimit(pulse?.individual),
            releasesCollective: validateLimit(releases?.collective),
            releasesIndividual: validateLimit(releases?.individual),
            majorCollective: validateLimit(major?.collective),
            majorIndividual: validateLimit(major?.individual),
            minorCollective: validateLimit(minor?.collective),
            minorIndividual: validateLimit(minor?.individual),
            patchCollective: validateLimit(patch?.collective),
            patchIndividual: validateLimit(patch?.individual),
          },
        }),
      );

      print(report, limit, overrides);
    }
  } catch (error) {
    if (json) {
      console.log(JSON.stringify(error));
    } else {
      console.error((error as Error).message);
    }
  }
};
