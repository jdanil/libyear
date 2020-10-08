export type PackageManager = "berry" | "npm" | "pnpm" | "yarn";

export type Threshold = {
  driftCollective?: number;
  driftIndividual?: number;
  pulseCollective?: number;
  pulseIndividual?: number;
  releasesCollective?: number;
  releasesIndividual?: number;
};

export type Overrides = {
  [key: string]: {
    defer?: string;
    drift?: number;
    pulse?: number;
    releases?: number;
  };
};

export type Configuration = {
  overrides?: Overrides;
  threshold?: {
    drift?: {
      collective?: Pick<Threshold, "driftCollective">;
      individual?: Pick<Threshold, "driftIndividual">;
    };
    pulse?: {
      collective?: Pick<Threshold, "pulseCollective">;
      individual?: Pick<Threshold, "pulseIndividual">;
    };
    releases?: {
      collective?: Pick<Threshold, "releasesCollective">;
      individual?: Pick<Threshold, "releasesIndividual">;
    };
  };
};
