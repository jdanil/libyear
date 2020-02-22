import * as chalk from "chalk";

import { printFloat } from "./numbers";

type Dependencies = Array<{
  dependency: string;
  drift: number;
  pulse: number;
  releases: number;
  status: string;
  available: string;
}>;

type Metric = "drift" | "pulse" | "releases";

type Threshold = {
  driftCollective?: number;
  driftIndividual?: number;
  pulseCollective?: number;
  pulseIndividual?: number;
  releasesCollective?: number;
  releasesIndividual?: number;
};

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

const isBreach = (value: number, limit?: number) =>
  limit != null && value > limit;

const printIndividual = (dependencies: Dependencies, threshold?: Threshold) => {
  const printHelper = (
    metric: Metric,
    dependency: string,
    value: number,
    limit: number,
  ) => {
    if (isBreach(value, limit)) {
      console.error(
        `${chalk.magenta(metric)}: ${chalk.cyan(dependency)} is ${chalk.red(
          `${printFloat(value)} ${getMetricUnit(metric, value)}`,
        )} behind; threshold is ${chalk.yellow(printFloat(limit))}.`,
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

export const print = (dependencies: Dependencies, threshold?: Threshold) => {
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
    driftIndividual: dependencies.some(({ drift }) =>
      isBreach(drift, threshold?.driftIndividual),
    ),
    pulseCollective: isBreach(totalPulse, threshold?.pulseCollective),
    pulseIndividual: dependencies.some(({ pulse }) =>
      isBreach(pulse, threshold?.pulseIndividual),
    ),
    releasesCollective: isBreach(totalReleases, threshold?.releasesCollective),
    releasesIndividual: dependencies.some(({ releases }) =>
      isBreach(releases, threshold?.releasesIndividual),
    ),
  };

  if (
    breaches.driftIndividual ||
    breaches.pulseIndividual ||
    breaches.releasesIndividual
  ) {
    console.log(chalk.bold("# Individual"));
    printIndividual(dependencies, threshold);
    console.log();
  }

  console.log(chalk.bold("# Collective"));
  printCollective(totalDrift, totalPulse, totalReleases, threshold);
  console.log();

  if (Object.values(breaches).includes(true)) {
    process.exit(1);
  }
};
