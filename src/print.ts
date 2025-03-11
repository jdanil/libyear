import { partialRight } from "lodash-es";

import { metrics } from "./constants.ts";
import { clipFloat, printFloat } from "./numbers.ts";
import { style } from "./style.ts";
import type {
  Dependencies,
  Metric,
  Overrides,
  Threshold,
  Totals,
  ViolationsCollective,
  ViolationsIndividual,
} from "./types.ts";
import { getTotals, getViolations } from "./validate.ts";

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
        `${style(metric, "magenta")}: ${style(dependency, "cyan")} is ${style(`${printFloat(value)} ${getMetricUnit(metric, value)}`, "error")} behind; threshold is ${style(printFloat(threshold), "warning")}.`,
      );
    });
  });
};

const printCollective = (
  totals: Totals,
  violations: ViolationsCollective,
  threshold?: Threshold,
) => {
  const isBreach = (metric: Metric) => violations.has(metric);
  const logger = (metric: Metric) =>
    isBreach(metric) ? console.error : console.log;
  const message = (metric: Metric, value: number, limit?: number) => {
    const valueStyler = isBreach(metric)
      ? partialRight(style, "error")
      : partialRight(style, "success");
    const valueMessage = `${style(metric, "magenta")}: ${
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
    const limitMessage = `threshold is ${style(limit != null ? printFloat(limit) : String(limit), "warning")}`;

    return isBreach(metric)
      ? `${valueMessage}; ${limitMessage}.`
      : `${valueMessage}.`;
  };

  metrics.forEach((metric) => {
    logger(metric)(
      message(
        metric,
        totals.get(metric) ?? 0,
        threshold?.[`${metric}Collective`],
      ),
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
        drift: clipFloat(drift),
        pulse: clipFloat(pulse),
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
    console.log(style("# Individual", "bold"));
    printIndividual(violations.individual);
    console.log();
  }

  console.log(style("# Collective", "bold"));
  printCollective(totals, violations.collective, threshold);
  console.log();

  if (hasIndividualViolations || hasCollectiveViolations) {
    process.exit(1);
  }
};
