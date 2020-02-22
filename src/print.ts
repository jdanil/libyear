import { printFloat } from "./numbers";

type Dependencies = Array<{
  dependency: string;
  drift: number;
  pulse: number;
  releases: number;
  status: string;
  available: string;
}>;

type Threshold = {
  driftCollective?: number;
  driftIndividual?: number;
  pulseCollective?: number;
  pulseIndividual?: number;
  releasesCollective?: number;
  releasesIndividual?: number;
};

const isBreach = (value: number, limit?: number) =>
  limit != null && value > limit;

const printIndividual = (dependencies: Dependencies, threshold?: Threshold) => {
  dependencies.forEach(({ dependency, drift, pulse, releases }) => {
    if (isBreach(drift, threshold?.driftIndividual)) {
      console.error(
        `drift: ${dependency} is ${printFloat(
          drift,
        )} libyears behind; threshold is ${printFloat(
          threshold?.driftIndividual,
        )}.`,
      );
    }
    if (isBreach(pulse, threshold?.pulseIndividual)) {
      console.error(
        `pulse: ${dependency} is ${printFloat(
          pulse,
        )} libyears behind; threshold is ${printFloat(
          threshold?.pulseIndividual,
        )}.`,
      );
    }
    if (isBreach(releases, threshold?.releasesIndividual)) {
      console.error(
        `releases: ${dependency} is ${printFloat(
          releases,
        )} releases behind; threshold is ${printFloat(
          threshold?.releasesIndividual,
        )}.`,
      );
    }
  });
};

const printCollective = (
  totalDrift: number,
  totalPulse: number,
  totalReleases: number,
  threshold?: Threshold,
) => {
  const logger = (value: number, limit?: number) =>
    isBreach(value, limit) ? console.error : console.log;
  const message = (
    type: "drift" | "pulse" | "releases",
    value: number,
    limit?: number,
  ) => {
    const valueMessage = `${type}: ${
      {
        drift: "package is",
        pulse: "dependencies are",
        releases: "dependencies are",
      }[type]
    } ${printFloat(value)} ${
      { drift: "libyears", pulse: "libyears", releases: "releases" }[type]
    } behind`;
    const limitMessage = `threshold is ${printFloat(limit)}`;
    return isBreach(value, limit)
      ? `${valueMessage}; ${limitMessage}.`
      : `${valueMessage}.`;
  };

  logger(
    totalDrift,
    threshold?.driftCollective,
  )(message("drift", totalDrift, threshold?.driftCollective));
  logger(
    totalPulse,
    threshold?.pulseCollective,
  )(message("pulse", totalPulse, threshold?.pulseCollective));
  logger(
    totalReleases,
    threshold?.releasesCollective,
  )(message("releases", totalReleases, threshold?.releasesCollective));
};

export const print = (dependencies: Dependencies, threshold?: Threshold) => {
  console.table(
    dependencies.map(
      ({ dependency, drift, pulse, releases, status, available }) => ({
        dependency,
        drift: printFloat(drift),
        pulse: printFloat(pulse),
        releases,
        status,
        available,
      }),
    ),
  );
  console.log();

  const totalDrift = dependencies.reduce(
    (acc, { drift }) => (isNaN(drift) ? acc : acc + drift),
    0,
  );
  const totalPulse = dependencies.reduce(
    (acc, { pulse }) => (isNaN(pulse) ? acc : acc + pulse),
    0,
  );
  const totalReleases = dependencies.reduce(
    (acc, { releases }) => (isNaN(releases) ? acc : acc + releases),
    0,
  );

  const breaches = {
    driftCollective: isBreach(totalDrift, threshold?.driftCollective),
    driftIndividual: dependencies.some(({ drift }) =>
      isBreach(drift, threshold?.driftIndividual),
    ),
    pulseCollective: isBreach(totalPulse, threshold?.pulseCollective),
    pulseIndividual: dependencies.some(({ pulse }) =>
      isBreach(pulse, threshold?.pulseIndividual),
    ),
    releasesCollective: isBreach(totalReleases, threshold?.releasesCollective),
    releasesIndividual: dependencies.some(({ releases }) =>
      isBreach(releases, threshold?.releasesIndividual),
    ),
  };

  if (
    breaches.driftIndividual ||
    breaches.pulseIndividual ||
    breaches.releasesIndividual
  ) {
    console.log("# Individual");
    printIndividual(dependencies, threshold);
    console.log();
  }

  console.log("# Collective");
  printCollective(totalDrift, totalPulse, totalReleases, threshold);
  console.log();

  if (Object.values(breaches).includes(true)) {
    process.exit(1);
  }
};
