import { omit, partial } from "lodash-es";

import { METRICS } from "../constants.ts";
import type {
  Dependencies,
  Limit,
  Metric,
  Overrides,
  Totals,
  Violations,
  ViolationsCollective,
  ViolationsIndividual,
} from "../types.ts";
import { getTotals, getViolations } from "../validate.ts";
import { clipFloat, printFloat } from "./style/number.ts";
import { styleTable } from "./style/table.ts";
import { styleText } from "./style/text.ts";

const getMetricFormat = ({
  dependency,
  metric,
  violations,
}: {
  dependency?: string;
  metric: Metric;
  violations: Violations;
}): Parameters<typeof styleText>[0] | undefined => {
  const isBreach =
    dependency != null
      ? violations.individual[metric]?.[dependency]
      : violations.collective[metric];
  return isBreach ? "red" : undefined;
};

const getFormattedMetrics = ({
  dependency,
  metrics,
  violations,
}: {
  dependency?: string;
  metrics: Record<Metric, number>;
  violations: Violations;
}) =>
  Object.fromEntries(
    Object.entries(metrics).map(([key, value]) => [
      key,
      {
        format: getMetricFormat({
          dependency,
          metric: key as Metric,
          violations,
        }),
        value: clipFloat(value),
      },
    ]),
  );

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
    Object.entries(dependencies).forEach(([dependency, { limit, value }]) => {
      console.error(
        `${styleText("magenta", metric)}: ${styleText("cyan", dependency)} is ${styleText("red", `${printFloat(value)} ${getMetricUnit(metric as Metric, value)}`)} behind; limit is ${styleText("yellow", printFloat(limit))}.`,
      );
    });
  });
};

const printCollective = (
  totals: Totals,
  violations: ViolationsCollective,
  limit?: Limit,
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
    const limitMessage = `limit is ${styleText("yellow", limit != null ? printFloat(limit) : String(limit))}`;

    return isBreach(metric)
      ? `${valueMessage}; ${limitMessage}.`
      : `${valueMessage}.`;
  };

  METRICS.forEach((metric) => {
    logger(metric)(
      message(metric, totals[metric] ?? 0, limit?.[`${metric}Collective`]),
    );
  });
};

const printDeprecations = (deprecations: Record<string, string>) => {
  Object.entries(deprecations).forEach(([dependency, deprecation]) => {
    console.warn(`${styleText("yellow", dependency)}: ${deprecation}`);
  });
};

export const print = (
  dependencies: Dependencies,
  limit?: Limit,
  overrides?: Overrides,
): void => {
  const totals = getTotals(dependencies);
  const violations = getViolations(dependencies, totals, limit, overrides);

  console.log(
    styleTable([
      ...dependencies.map(({ dependency, available, ...rest }) => ({
        dependency: {
          href: `https://npm.im/${dependency}`,
          value: dependency,
        },
        ...getFormattedMetrics({
          dependency,
          metrics: omit(rest, "deprecated"),
          violations,
        }),
        available: available ?? "—",
      })),
      {
        dependency: "total",
        ...getFormattedMetrics({
          metrics: totals,
          violations,
        }),
        available: "—",
      },
    ]),
  );

  const hasIndividualViolations =
    Object.values(violations.individual).reduce(
      (acc, cur) => acc + Object.keys(cur).length,
      0,
    ) > 0;
  const hasCollectiveViolations = Object.keys(violations.collective).length > 0;

  const deprecations = dependencies.reduce(
    (accumulator, { dependency, deprecated }) =>
      deprecated ? { ...accumulator, [dependency]: deprecated } : accumulator,
    {},
  );
  const hasDeprecations = Object.keys(deprecations).length > 0;

  if (hasIndividualViolations) {
    console.log(`\n${styleText("bold", "# Individual")}`);
    printIndividual(violations.individual);
  }

  if (hasCollectiveViolations) {
    console.log(`\n${styleText("bold", "# Collective")}`);
    printCollective(totals, violations.collective, limit);
  }

  if (hasDeprecations) {
    console.log(`\n${styleText("bold", "# Deprecations")}`);
    printDeprecations(deprecations);
  }

  if (hasIndividualViolations || hasCollectiveViolations) {
    process.exit(1);
  }
};
