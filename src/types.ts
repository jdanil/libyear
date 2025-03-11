export type PackageManager = "berry" | "npm" | "pnpm" | "yarn";

export type Metric =
  | "drift"
  | "pulse"
  | "releases"
  | "major"
  | "minor"
  | "patch";

export type Threshold = Record<
  `${Metric}${"Collective" | "Individual"}`,
  number | undefined
>;

export type Overrides = Record<
  string,
  Record<Metric, number> & {
    defer?: string;
  }
>;

export type Configuration = {
  overrides?: Overrides;
  threshold?: Record<
    Metric,
    {
      collective?: Pick<Threshold, `${Metric}Collective`>;
      individual?: Pick<Threshold, `${Metric}Individual`>;
    }
  >;
};

export type Args = {
  all?: boolean;
  config?: string;
  help?: boolean;
  json?: boolean;
  packageManager?: PackageManager;
  quiet?: boolean;
  sort?: Metric;
  thresholdDriftCollective?: string;
  thresholdDriftIndividual?: string;
  thresholdPulseCollective?: string;
  thresholdPulseIndividual?: string;
  thresholdReleasesCollective?: string;
  thresholdReleasesIndividual?: string;
  thresholdMajorCollective?: string;
  thresholdMajorIndividual?: string;
  thresholdMinorCollective?: string;
  thresholdMinorIndividual?: string;
  thresholdPatchCollective?: string;
  thresholdPatchIndividual?: string;
};

export type Dependency = Record<Metric, number> & {
  dependency: string;
  available: string;
};

export type Dependencies = Dependency[];

export type Totals = Map<Metric, number>;

export type ViolationsCollective = Map<Metric, number>;

export type ViolationsIndividual = Map<
  Metric,
  Map<string, { threshold: number; value: number }>
>;

export type Violations = {
  collective: ViolationsCollective;
  individual: ViolationsIndividual;
};
