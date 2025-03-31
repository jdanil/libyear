import { describe, it } from "node:test";

// TODO[engine:node@>=24]: drop @js-temporal/polyfill
import { Temporal } from "@js-temporal/polyfill";
import { expect } from "expect";

import { calculateDrift, calculatePulse } from "./date.ts";

const EPOCH = "1970-01-01T00:00:00.000Z";

await describe("date", async () => {
  const toISOString = (item: Temporal.PlainDateTime) => `${item.toString()}Z`;

  await describe("calculateDrift", async () => {
    const getDateTimeFuture = (
      durationLike: Temporal.DurationLike,
    ): Temporal.PlainDateTime =>
      Temporal.Instant.from(EPOCH)
        .toZonedDateTimeISO(EPOCH)
        .toPlainDateTime()
        .add(durationLike);

    for (const [title, current, latest, expected] of [
      ["same time", EPOCH, EPOCH, 0],
      ["a day", EPOCH, toISOString(getDateTimeFuture({ days: 1 })), 0],
      ["a week", EPOCH, toISOString(getDateTimeFuture({ weeks: 1 })), 0.02],
      ["a month", EPOCH, toISOString(getDateTimeFuture({ months: 1 })), 0.08],
      ["a year", EPOCH, toISOString(getDateTimeFuture({ years: 1 })), 1],
      ["a decade", EPOCH, toISOString(getDateTimeFuture({ years: 10 })), 10],
    ] as const) {
      await it(`calculates ${title}`, () => {
        expect(calculateDrift(current, latest)).toBeCloseTo(expected, 2);
      });
    }
  });

  await describe("calculatePulse", async () => {
    const getDateTimePast = (
      durationLike: Temporal.DurationLike,
    ): Temporal.PlainDateTime =>
      Temporal.Now.plainDateTimeISO().subtract(durationLike);

    for (const [title, latest, expected] of [
      ["same time", toISOString(Temporal.Now.plainDateTimeISO()), 0],
      ["a day", toISOString(getDateTimePast({ days: 1 })), 0],
      ["a week", toISOString(getDateTimePast({ weeks: 1 })), 0.02],
      ["a month", toISOString(getDateTimePast({ months: 1 })), 0.08],
      ["a year", toISOString(getDateTimePast({ years: 1 })), 1],
      ["a decade", toISOString(getDateTimePast({ years: 10 })), 10],
    ] as const) {
      await it(`calculates ${title}`, () => {
        expect(calculatePulse(latest)).toBeCloseTo(expected, 2);
      });
    }
  });
});
