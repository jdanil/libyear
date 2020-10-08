import * as chalk from "chalk";

import { printFloat } from "./numbers";
import type { Overrides, Threshold } from "./types";

type Dependencies = Array<{
  dependency: string;
  drift: number;
  pulse: number;
  releases: number;
  status: string;
  available: string;
}>;

type Metric = "drift" | "pulse" | "releases";

const ntext = (text: string, plural: string, count: number) =>
  Math.abs(count) === 1 ? text : plural;

const getMetricUnit = (metric: Metric, count: number) => {
  switch (metric) {
    case "releases":
      return ntext("release", "releases", count);
    case "drift":
    case "pulse":
    default:
      return ntext("libyear", "libyears", count);
  }
};

const getMatchingPattern = (dependency: string, overrides: Overrides) =>
  Object.keys(overrides).find((pattern) => RegExp(pattern).test(dependency));

const isExcused = (dependency: string, overrides: Overrides) =>
  Object.entries(overrides).some(
    ([pattern, { defer }]) =>
      RegExp(pattern).test(dependency) && Date.now() < Date.parse(defer),
  );

const isBreach = (
  value: number,
  limit?: number,
  dependency?: string,
  overrides?: Overrides,
) => limit != null && value > limit && !isExcused(dependency, overrides ?? {});

const printIndividual = (
  dependencies: Dependencies,
  threshold?: Threshold,
  overrides?: Overrides,
) => {
  const printHelper = (
    metric: Metric,
    dependency: string,
    value: number,
    limit: number,
  ) => {
    const threshold =
      overrides?.[getMatchingPattern(dependency, overrides)]?.[metric] ?? limit;
    if (isBreach(value, threshold, dependency, overrides)) {
      console.error(
        `${chalk.magenta(metric)}: ${chalk.cyan(dependency)} is ${chalk.red(
          `${printFloat(value)} ${getMetricUnit(metric, value)}`,
        )} behind; threshold is ${chalk.yellow(printFloat(threshold))}.`,
      );
    }
  };
  dependencies.forEach(({ dependency, drift, pulse, releases }) => {
    printHelper("drift", dependency, drift, threshold?.driftIndividual);
    printHelper("pulse", dependency, pulse, threshold?.pulseIndividual);
    printHelper(
      "releases",
      dependency,
      releases,
      threshold?.releasesIndividual,
    );
  });
};

const printCollective = (
  totalDrift: number,
  totalPulse: number,
  totalReleases: number,
  threshold?: Threshold,
) => {
  const logger = (value: number, limit?: number) =>
    isBreach(value, limit) ? console.error : console.log;
  const message = (metric: Metric, value: number, limit: number) => {
    const valueStyler = isBreach(value, limit) ? chalk.red : chalk.greenBright;
    const valueMessage = `${chalk.magenta(metric)}: ${
      {
        drift: "package is",
        pulse: "dependencies are",
        releases: "dependencies are",
      }[metric]
    } ${valueStyler(
      `${printFloat(value)} ${getMetricUnit(metric, value)}`,
    )} behind`;
    const limitMessage = `threshold is ${chalk.yellow(printFloat(limit))}`;
    return isBreach(value, limit)
      ? `${valueMessage}; ${limitMessage}.`
      : `${valueMessage}.`;
  };

  logger(
    totalDrift,
    threshold?.driftCollective,
  )(message("drift", totalDrift, threshold?.driftCollective));
  logger(
    totalPulse,
    threshold?.pulseCollective,
  )(message("pulse", totalPulse, threshold?.pulseCollective));
  logger(
    totalReleases,
    threshold?.releasesCollective,
  )(message("releases", totalReleases, threshold?.releasesCollective));
};

export const print = (
  dependencies: Dependencies,
  threshold?: Threshold,
  overrides?: Overrides,
): void => {
  console.table(
    dependencies.map(
      ({ dependency, drift, pulse, releases, status, available }) => ({
        dependency,
        drift: printFloat(drift),
        pulse: printFloat(pulse),
        releases,
        status,
        available,
      }),
    ),
  );
  console.log();

  const totalDrift = dependencies.reduce(
    (acc, { drift }) => (isNaN(drift) ? acc : acc + drift),
    0,
  );
  const totalPulse = dependencies.reduce(
    (acc, { pulse }) => (isNaN(pulse) ? acc : acc + pulse),
    0,
  );
  const totalReleases = dependencies.reduce(
    (acc, { releases }) => (isNaN(releases) ? acc : acc + releases),
    0,
  );

  const breaches = {
    driftCollective: isBreach(totalDrift, threshold?.driftCollective),
    driftIndividual: dependencies.some(({ dependency, drift }) =>
      isBreach(
        drift,
        overrides?.[getMatchingPattern(dependency, overrides)]?.drift ??
          threshold?.driftIndividual,
        dependency,
        overrides,
      ),
    ),
    pulseCollective: isBreach(totalPulse, threshold?.pulseCollective),
    pulseIndividual: dependencies.some(({ dependency, pulse }) =>
      isBreach(
        pulse,
        overrides?.[getMatchingPattern(dependency, overrides)]?.pulse ??
          threshold?.pulseIndividual,
        dependency,
        overrides,
      ),
    ),
    releasesCollective: isBreach(totalReleases, threshold?.releasesCollective),
    releasesIndividual: dependencies.some(({ dependency, releases }) =>
      isBreach(
        releases,
        overrides?.[getMatchingPattern(dependency, overrides)]?.releases ??
          threshold?.releasesIndividual,
        dependency,
        overrides,
      ),
    ),
  };

  if (
    breaches.driftIndividual ||
    breaches.pulseIndividual ||
    breaches.releasesIndividual
  ) {
    console.log(chalk.bold("# Individual"));
    printIndividual(dependencies, threshold, overrides);
    console.log();
  }

  console.log(chalk.bold("# Collective"));
  printCollective(totalDrift, totalPulse, totalReleases, threshold);
  console.log();

  if (Object.values(breaches).includes(true)) {
    process.exit(1);
  }
};
