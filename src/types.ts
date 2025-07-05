export type PackageManager = "berry" | "npm" | "pnpm" | "yarn";

export type Metric =
  | "drift"
  | "pulse"
  | "releases"
  | "major"
  | "minor"
  | "patch";

export type Limit = Record<
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
  limit?: Record<
    Metric,
    {
      collective?: Pick<Limit, `${Metric}Collective`>;
      individual?: Pick<Limit, `${Metric}Individual`>;
    }
  >;
};

export type Args = {
  all?: boolean;
  config?: string;
  dev?: boolean;
  help?: boolean;
  json?: boolean;
  limitDriftCollective?: string;
  limitDriftIndividual?: string;
  limitPulseCollective?: string;
  limitPulseIndividual?: string;
  limitReleasesCollective?: string;
  limitReleasesIndividual?: string;
  limitMajorCollective?: string;
  limitMajorIndividual?: string;
  limitMinorCollective?: string;
  limitMinorIndividual?: string;
  limitPatchCollective?: string;
  limitPatchIndividual?: string;
  packageManager?: PackageManager;
  preReleases?: boolean;
  quiet?: boolean;
  sort?: Metric;
};

export type Dependency = Record<Metric, number> & {
  dependency: string;
  deprecated?: string;
  latest: string;
};

export type Dependencies = Dependency[];

export type Totals = Record<Metric, number>;

export type ViolationsCollective = Record<Metric, number>;

export type ViolationsIndividual = Record<
  Metric,
  Record<string, { limit: number; value: number }>
>;

export type Violations = {
  collective: ViolationsCollective;
  individual: ViolationsIndividual;
};
