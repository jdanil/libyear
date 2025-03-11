import { metrics } from "./constants.ts";
import type {
  Dependencies,
  Metric,
  Overrides,
  Threshold,
  Totals,
  Violations,
  ViolationsCollective,
  ViolationsIndividual,
} from "./types.ts";

const isExcused = (dependency: string, overrides: Overrides): boolean =>
  Object.entries(overrides).some(
    ([pattern, { defer }]) =>
      RegExp(pattern).test(dependency) &&
      defer != null &&
      Date.now() < Date.parse(defer),
  );

const isBreach = (
  value: number,
  limit?: number,
  dependency?: string,
  overrides?: Overrides,
) =>
  limit != null &&
  value > limit &&
  (dependency == null || !isExcused(dependency, overrides ?? {}));

const getMatchingPattern = (
  dependency: string,
  overrides: Overrides,
): string | undefined =>
  Object.keys(overrides).find((pattern) => RegExp(pattern).test(dependency));

export const getTotals = (dependencies: Dependencies): Totals => {
  const totals = new Map<Metric, number>();

  dependencies.forEach((dependency) => {
    metrics.forEach((metric) => {
      if (!Number.isNaN(dependency[metric])) {
        const acc = totals.has(metric) ? (totals.get(metric) ?? 0) : 0;
        const cur = dependency[metric];
        totals.set(metric, acc + cur);
      }
    });
  });

  return totals;
};

const getCollectiveViolations = (
  totals: Totals,
  threshold?: Threshold,
): ViolationsCollective => {
  const violations = new Map<Metric, number>();

  metrics.forEach((metric) => {
    const value = totals.get(metric);
    const limit = threshold?.[`${metric}Collective`];
    if (value != null && isBreach(value, limit)) {
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
  const violations = new Map<
    Metric,
    Map<string, { threshold: number; value: number }>
  >();

  dependencies.forEach(({ dependency, ...rest }) => {
    metrics.forEach((metric) => {
      const value = rest[metric];
      const limit =
        overrides?.[getMatchingPattern(dependency, overrides) ?? ""]?.[
          metric
        ] ?? threshold?.[`${metric}Individual`];
      if (limit != null && isBreach(value, limit, dependency, overrides)) {
        if (!violations.has(metric)) {
          violations.set(metric, new Map());
        }
        violations.get(metric)?.set(dependency, { threshold: limit, value });
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
