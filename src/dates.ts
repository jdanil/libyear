import { differenceInDays, parseISO } from "date-fns";

const DAYS_PER_YEAR = 365.25;

/**
 * Time since last version update.
 * Measure of dependency drift.
 */
export const calculateDrift = (
  currentVersion: string,
  latestVersion: string,
): number =>
  differenceInDays(parseISO(latestVersion), parseISO(currentVersion)) /
  DAYS_PER_YEAR;

/**
 * Time since latest version release.
 * Pulse check of dependency activity and maintenance.
 */
export const calculatePulse = (latestVersion: string): number =>
  differenceInDays(Date.now(), parseISO(latestVersion)) / DAYS_PER_YEAR;
