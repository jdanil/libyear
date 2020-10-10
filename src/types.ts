export type PackageManager = "berry" | "npm" | "pnpm" | "yarn";

export type Metric =
  | "drift"
  | "pulse"
  | "releases"
  | "major"
  | "minor"
  | "patch";

export type Threshold = Record<`${Metric}${"Collective" | "Individual"}`, number>;

export type Overrides = Record<
  string,
  Record<Metric, number> & {
    defer?: string;
  }
>;

export type Configuration = {
  overrides?: Overrides;
  threshold?: Record<Metric, {
    collective?: Pick<Threshold, `${Metric}Collective`>;
    individual?: Pick<Threshold, `${Metric}Individual`>;
  }>;
};

export type Dependencies = Array<
  Record<Metric, number> & {
    dependency: string;
    available: string;
  }
>;

export type Totals = Record<Metric, number>;

export type ViolationsCollective = Map<Metric, number>;

export type ViolationsIndividual = Record<
  Metric,
  Map<string, { threshold: number; value: number }>
>;

export type Violations = {
  collective: ViolationsCollective;
  individual: ViolationsIndividual;
};
