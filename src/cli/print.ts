import { partial } from "lodash-es";

import { METRICS } from "../constants.ts";
import type {
  Dependencies,
  Metric,
  Overrides,
  Threshold,
  Totals,
  ViolationsCollective,
  ViolationsIndividual,
} from "../types.ts";
import { getTotals, getViolations } from "../validate.ts";
import { clipFloat, printFloat } from "./style/number.ts";
import { styleTable } from "./style/table.ts";
import { styleText } from "./style/text.ts";

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
  Object.entries(violations).forEach(([metric, dependencies]) => {
    Object.entries(dependencies).forEach(
      ([dependency, { threshold, value }]) => {
        console.error(
          `${styleText("magenta", metric)}: ${styleText("cyan", dependency)} is ${styleText("red", `${printFloat(value)} ${getMetricUnit(metric as Metric, value)}`)} behind; threshold is ${styleText("yellow", printFloat(threshold))}.`,
        );
      },
    );
  });
};

const printCollective = (
  totals: Totals,
  violations: ViolationsCollective,
  threshold?: Threshold,
) => {
  const isBreach = (metric: Metric) => Object.hasOwn(violations, metric);
  const logger = (metric: Metric) =>
    isBreach(metric) ? console.error : console.log;
  const message = (metric: Metric, value: number, limit?: number) => {
    const valueStyler = isBreach(metric)
      ? partial(styleText, "red")
      : partial(styleText, "green");
    const valueMessage = `${styleText("magenta", metric)}: ${
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
    const limitMessage = `threshold is ${styleText("yellow", limit != null ? printFloat(limit) : String(limit))}`;

    return isBreach(metric)
      ? `${valueMessage}; ${limitMessage}.`
      : `${valueMessage}.`;
  };

  METRICS.forEach((metric) => {
    logger(metric)(
      message(metric, totals[metric] ?? 0, threshold?.[`${metric}Collective`]),
    );
  });
};

export const print = (
  dependencies: Dependencies,
  threshold?: Threshold,
  overrides?: Overrides,
): void => {
  const totals = getTotals(dependencies);

  console.log(
    styleTable(
      [
        ...dependencies,
        {
          dependency: "total",
          ...totals,
          available: null,
        },
      ].map(
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
          available: available ?? "—",
        }),
      ),
    ),
  );

  const violations = getViolations(dependencies, totals, threshold, overrides);
  const hasIndividualViolations =
    Object.values(violations.individual).reduce(
      (acc, cur) => acc + Object.keys(cur).length,
      0,
    ) > 0;
  const hasCollectiveViolations = Object.keys(violations.collective).length > 0;

  if (hasIndividualViolations) {
    console.log(`\n${styleText("bold", "# Individual")}`);
    printIndividual(violations.individual);
  }

  if (hasCollectiveViolations) {
    console.log(`\n${styleText("bold", "# Collective")}`);
    printCollective(totals, violations.collective, threshold);
  }

  if (hasIndividualViolations || hasCollectiveViolations) {
    process.exit(1);
  }
};
