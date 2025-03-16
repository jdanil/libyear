import {
  getInferredPackageManager,
  getParsedPackageManager,
} from "../fetch/package-manager.ts";
import { libyear } from "../libyear.ts";
import { getArgs } from "./args.ts";
import { getConfiguration } from "./configuration.ts";
import { print } from "./print.ts";

const validateThreshold = (threshold: unknown): number | undefined =>
  Number.isNaN(Number(threshold)) ? undefined : Number(threshold);

export const cli = async (): Promise<void> => {
  const args = getArgs();

  const { all, help, json, packageManager, quiet, sort, ...rest } = args;

  if (help) {
    console.log(
      [
        "--all                                Include dependencies from the whole project.",
        "--config                             Path to a libyear configuration file.",
        "--help, -h                           Show help.",
        "--json                               Outputs the report to the console as valid JSON.",
        '--package-manager                    Accepts "berry", "npm", "pnpm", "yarn"',
        "--quiet, -q                          Exclude up-to-date dependencies from results.",
        "--sort                               Column to sort individual results by.",
        "--threshold-drift-collective, -D     Drift threshold to warn on for all dependencies.",
        "--threshold-drift-individual, -d     Drift threshold to warn on for individual dependencies.",
        "--threshold-pulse-collective, -P     Pulse threshold to warn on for all dependencies.",
        "--threshold-pulse-individual, -p     Pulse threshold to warn on for individual dependencies.",
        "--threshold-releases-collective, -R  Releases threshold to warn on for all dependencies.",
        "--threshold-releases-individual, -r  Releases threshold to warn on for individual dependencies.",
        "--threshold-major-collective         Major releases threshold to warn on for all dependencies.",
        "--threshold-major-individual         Major releases threshold to warn on for individual dependencies.",
        "--threshold-minor-collective         Minor releases threshold to warn on for all dependencies.",
        "--threshold-minor-individual         Minor releases threshold to warn on for individual dependencies.",
        "--threshold-patch-collective         Patch releases threshold to warn on for all dependencies.",
        "--threshold-patch-individual         Patch releases threshold to warn on for individual dependencies.",
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
      { all, quiet, sort },
    );

    if (json) {
      console.log(JSON.stringify(report));
    } else {
      const { overrides, threshold } = await getConfiguration(rest).then(
        ({
          overrides,
          threshold: { drift, pulse, releases, major, minor, patch } = {},
        }) => ({
          overrides,
          threshold: {
            driftCollective: validateThreshold(drift?.collective),
            driftIndividual: validateThreshold(drift?.individual),
            pulseCollective: validateThreshold(pulse?.collective),
            pulseIndividual: validateThreshold(pulse?.individual),
            releasesCollective: validateThreshold(releases?.collective),
            releasesIndividual: validateThreshold(releases?.individual),
            majorCollective: validateThreshold(major?.collective),
            majorIndividual: validateThreshold(major?.individual),
            minorCollective: validateThreshold(minor?.collective),
            minorIndividual: validateThreshold(minor?.individual),
            patchCollective: validateThreshold(patch?.collective),
            patchIndividual: validateThreshold(patch?.individual),
          },
        }),
      );

      print(report, threshold, overrides);
    }
  } catch (error) {
    if (json) {
      console.log(JSON.stringify(error));
    } else {
      console.error((error as Error).message);
    }
  }
};
