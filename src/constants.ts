import type { Metric } from "./types.ts";

export const PACKAGE_NAME_REGEXP = /(@[a-z\d][a-z\d-._]*\/)?[a-z\d][a-z\d-._]*/;

export const METRICS: Metric[] = [
  "drift",
  "pulse",
  "releases",
  "major",
  "minor",
  "patch",
];
