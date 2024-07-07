import { differenceInDays, parseISO } from "date-fns";
import { daysInYear } from "date-fns/constants";

/**
 * Time since last version update.
 * Measure of dependency drift.
 */
export const calculateDrift = (
  currentVersion: string,
  latestVersion: string,
): number =>
  differenceInDays(parseISO(latestVersion), parseISO(currentVersion)) /
  daysInYear;

/**
 * Time since latest version release.
 * Pulse check of dependency activity and maintenance.
 */
export const calculatePulse = (latestVersion: string): number =>
  differenceInDays(new Date(), parseISO(latestVersion)) / daysInYear;
