import { default as chalk } from "chalk";

import { metrics } from "./constants.js";
import { printFloat } from "./numbers.js";
import type {
  Dependencies,
  Metric,
  Overrides,
  Threshold,
  Totals,
  ViolationsCollective,
  ViolationsIndividual,
} from "./types.js";
import { getTotals, getViolations } from "./validate.js";

const ntext = (text: string, plural: string, count: number) =>
  Math.abs(count) === 1 ? text : plural;

const getMetricUnit = (metric: Metric, count: number) => {
  switch (metric) {
    case "releases":
    case "major":
    case "minor":
    case "patch":
      return ntext("release", "releases", count);
    case "drift":
    case "pulse":
    default:
      return ntext("libyear", "libyears", count);
  }
};

const printIndividual = (violations: ViolationsIndividual) => {
  violations.forEach((dependencies, metric) => {
    dependencies.forEach(({ threshold, value }, dependency) => {
      console.error(
        `${chalk.magenta(metric)}: ${chalk.cyan(dependency)} is ${chalk.red(
          `${printFloat(value)} ${getMetricUnit(metric, value)}`,
        )} behind; threshold is ${chalk.yellow(printFloat(threshold))}.`,
      );
    });
  });
};

const printCollective = (
  totals: Totals,
  violations: ViolationsCollective,
  threshold: Threshold,
) => {
  const isBreach = (metric: Metric) => violations.has(metric);
  const logger = (metric: Metric) =>
    isBreach(metric) ? console.error : console.log;
  const message = (metric: Metric, value: number, limit: number) => {
    const valueStyler = isBreach(metric) ? chalk.red : chalk.greenBright;
    const valueMessage = `${chalk.magenta(metric)}: ${
      {
        drift: "package is",
        pulse: "dependencies are",
        releases: "dependencies are",
        major: "dependencies are",
        minor: "dependencies are",
        patch: "dependencies are",
      }[metric]
    } ${valueStyler(
      `${printFloat(value)} ${getMetricUnit(metric, value)}`,
    )} behind`;
    const limitMessage = `threshold is ${chalk.yellow(printFloat(limit))}`;
    return isBreach(metric)
      ? `${valueMessage}; ${limitMessage}.`
      : `${valueMessage}.`;
  };

  metrics.forEach((metric) => {
    logger(metric)(
      message(metric, totals.get(metric), threshold?.[`${metric}Collective`]),
    );
  });
};

export const print = (
  dependencies: Dependencies,
  threshold?: Threshold,
  overrides?: Overrides,
): void => {
  console.table(
    dependencies.map(
      ({
        dependency,
        drift,
        pulse,
        releases,
        major,
        minor,
        patch,
        available,
      }) => ({
        dependency,
        drift: printFloat(drift),
        pulse: printFloat(pulse),
        releases,
        major,
        minor,
        patch,
        available,
      }),
    ),
  );
  console.log();

  const totals = getTotals(dependencies);
  const violations = getViolations(dependencies, totals, threshold, overrides);
  const hasIndividualViolations =
    Array.from(violations.individual.values()).reduce(
      (acc, cur) => acc + cur.size,
      0,
    ) > 0;
  const hasCollectiveViolations = violations.collective.size > 0;

  if (hasIndividualViolations) {
    console.log(chalk.bold("# Individual"));
    printIndividual(violations.individual);
    console.log();
  }

  console.log(chalk.bold("# Collective"));
  printCollective(totals, violations.collective, threshold);
  console.log();

  if (hasIndividualViolations || hasCollectiveViolations) {
    process.exit(1);
  }
};
