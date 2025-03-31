// TODO[engine:node@>=24]: drop @js-temporal/polyfill
import { Temporal } from "@js-temporal/polyfill";

const DAYS_IN_YEAR = 365.2425;

const parseISO = (item: string): Temporal.PlainDateTime =>
  Temporal.Instant.from(item).toZonedDateTimeISO(item).toPlainDateTime();

const differenceInDays = (
  laterDate: Temporal.PlainDateTime,
  earlierDate: Temporal.PlainDateTime,
): number => laterDate.since(earlierDate).days;

/**
 * Time since last version update.
 * Measure of dependency drift.
 */
export const calculateDrift = (
  currentVersion: string,
  latestVersion: string,
): number =>
  differenceInDays(parseISO(latestVersion), parseISO(currentVersion)) /
  DAYS_IN_YEAR;

/**
 * Time since latest version release.
 * Pulse check of dependency activity and maintenance.
 */
export const calculatePulse = (latestVersion: string): number =>
  differenceInDays(Temporal.Now.plainDateTimeISO(), parseISO(latestVersion)) /
  DAYS_IN_YEAR;
