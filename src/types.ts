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
