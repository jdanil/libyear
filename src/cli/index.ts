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
  const {
    all,
    dev,
    help,
    json,
    packageManager,
    preReleases,
    quiet,
    sort,
    include,
    exclude,
    ...rest
  } = getArgs();

  if (help) {
    console.log(
      [
        "─── Usage ".padEnd(Math.min(process.stdout.columns, 100), "─"),
        "$ libyear <options>",
        "─── Options ".padEnd(Math.min(process.stdout.columns, 100), "─"),
        "--all                            Include dependencies from the whole project.",
        "--config                         Path to a libyear configuration file.",
        "--dev                            Include dev dependencies.",
        "--help, -h                       Show help.",
        "--json                           Outputs the report to the console as valid JSON.",
        '--package-manager                Accepts "berry", "npm", "pnpm", "yarn"',
        "--pre-releases                   Include pre-releases in latest versions.",
        "--quiet, -q                      Exclude up-to-date dependencies from results.",
        "--sort                           Column to sort individual results by.",
        "--include                        Include only dependencies matching regex pattern(s).",
        "--exclude                        Exclude dependencies matching regex pattern(s).",
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
    const configuration = await getConfiguration(rest);

    // Merge CLI filtering with config filtering (CLI takes precedence)
    const mergedInclude = include?.length
      ? include
      : configuration.filtering?.include;
    const mergedExclude = exclude?.length
      ? exclude
      : configuration.filtering?.exclude;

    const report = await libyear(
      getParsedPackageManager(
        packageManager ?? (await getInferredPackageManager()),
      ),
      {
        all,
        dev,
        preReleases,
        quiet,
        sort,
        include: mergedInclude,
        exclude: mergedExclude,
      },
    );

    if (json) {
      console.log(JSON.stringify(report));
    } else {
      const { overrides, limit } = configuration;
      const processedLimit = {
        driftCollective: validateLimit(limit?.drift?.collective),
        driftIndividual: validateLimit(limit?.drift?.individual),
        pulseCollective: validateLimit(limit?.pulse?.collective),
        pulseIndividual: validateLimit(limit?.pulse?.individual),
        releasesCollective: validateLimit(limit?.releases?.collective),
        releasesIndividual: validateLimit(limit?.releases?.individual),
        majorCollective: validateLimit(limit?.major?.collective),
        majorIndividual: validateLimit(limit?.major?.individual),
        minorCollective: validateLimit(limit?.minor?.collective),
        minorIndividual: validateLimit(limit?.minor?.individual),
        patchCollective: validateLimit(limit?.patch?.collective),
        patchIndividual: validateLimit(limit?.patch?.individual),
      };

      print(report, processedLimit, overrides);
    }
  } catch (error) {
    if (json) {
      console.log(JSON.stringify(error));
    } else {
      console.error((error as Error).message);
    }
  }
};
