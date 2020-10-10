import * as fromEntries from "fromentries";

import { metrics } from "./constants";
import type {
  Dependencies,
  Metric,
  Overrides,
  Threshold,
  Totals,
  Violations,
  ViolationsCollective,
  ViolationsIndividual,
} from "./types";

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

const getMatchingPattern = (dependency: string, overrides: Overrides) =>
  Object.keys(overrides).find((pattern) => RegExp(pattern).test(dependency));

export const getTotals = (dependencies: Dependencies): Totals =>
  dependencies.reduce(
    (acc, cur) =>
      metrics.reduce(
        (previous, metric) => ({
          ...previous,
          [metric]: isNaN(cur[metric])
            ? acc[metric]
            : acc[metric] + cur[metric],
        }),
        {},
      ),
    fromEntries(metrics.map((metric) => [metric, 0])),
  );

const getCollectiveViolations = (
  totals: Totals,
  threshold?: Threshold,
): ViolationsCollective => {
  const violations = new Map<Metric, number>();

  metrics.forEach((metric) => {
    const value = totals[metric];
    const limit = threshold?.[`${metric}Collective`] as number;
    if (isBreach(value, limit)) {
      violations.set(metric, value);
    }
  });

  return violations;
};

const getIndividualViolations = (
  dependencies: Dependencies,
  threshold?: Threshold,
  overrides?: Overrides,
): ViolationsIndividual => {
  const violations = fromEntries(metrics.map((metric) => [metric, new Map()]));

  dependencies.forEach(({ dependency, ...rest }) => {
    metrics.forEach((metric) => {
      const value = rest[metric];
      const limit =
        overrides?.[getMatchingPattern(dependency, overrides)]?.[metric] ??
        (threshold?.[`${metric}Individual`] as number);
      if (isBreach(value, limit, dependency, overrides)) {
        violations[metric].set(dependency, { threshold: limit, value });
      }
    });
  });

  return violations;
};

export const getViolations = (
  dependencies: Dependencies,
  totals: Totals,
  threshold?: Threshold,
  overrides?: Overrides,
): Violations => ({
  collective: getCollectiveViolations(totals, threshold),
  individual: getIndividualViolations(dependencies, threshold, overrides),
});
