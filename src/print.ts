import { printFloat } from "./numbers";

export const print = (
  dependencies: Array<{
    dependency: string;
    drift: number;
    pulse: number;
    status: string;
  }>,
  threshold?: {
    driftCollective?: number;
    driftIndividual?: number;
    pulseCollective?: number;
    pulseIndividual?: number;
  },
) => {
  console.table(
    dependencies.map(({ dependency, drift, pulse, status }) => ({
      dependency,
      drift: printFloat(drift),
      pulse: printFloat(pulse),
      status,
    })),
  );

  const totalDrift = dependencies.reduce((acc, { drift }) => acc + drift, 0);
  const totalPulse = dependencies.reduce((acc, { pulse }) => acc + pulse, 0);

  const isBreach = (value: number, limit?: number) =>
    limit != null && value > limit;
  const breaches = {
    driftCollective: isBreach(totalDrift, threshold?.driftCollective),
    pulseCollective: isBreach(totalPulse, threshold?.pulseCollective),
  };

  const logger = (value: number, limit?: number) =>
    isBreach(value, limit) ? console.error : console.log;
  const message = (type: "drift" | "pulse", value: number, limit?: number) => {
    const valueMessage = `${type}: ${
      { drift: "package is", pulse: "dependencies are" }[type]
    } ${printFloat(value)} libyears behind`;
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

  if (Object.values(breaches).includes(true)) {
    process.exit(1);
  }
};
