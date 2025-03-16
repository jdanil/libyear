import { describe, it } from "node:test";

import { add, sub } from "date-fns";
import { expect } from "expect";

import { calculateDrift, calculatePulse } from "./date.ts";

const EPOCH = "1970-01-01T00:00:00.000Z";

await describe("date", async () => {
  await describe("calculateDrift", async () => {
    for (const [title, current, latest, expected] of [
      ["same time", EPOCH, EPOCH, 0],
      ["a day", EPOCH, add(EPOCH, { days: 1 }).toISOString(), 0],
      ["a week", EPOCH, add(EPOCH, { weeks: 1 }).toISOString(), 0.02],
      ["a month", EPOCH, add(EPOCH, { months: 1 }).toISOString(), 0.08],
      ["a year", EPOCH, add(EPOCH, { years: 1 }).toISOString(), 1],
      ["a decade", EPOCH, add(EPOCH, { years: 10 }).toISOString(), 10],
    ] as const) {
      await it(`calculates ${title}`, () => {
        expect(calculateDrift(current, latest)).toBeCloseTo(expected, 2);
      });
    }
  });

  await describe("calculateDrift", async () => {
    for (const [title, latest, expected] of [
      ["same time", new Date().toISOString(), 0],
      ["a day", sub(new Date(), { days: 1 }).toISOString(), 0],
      ["a week", sub(new Date(), { weeks: 1 }).toISOString(), 0.02],
      ["a month", sub(new Date(), { months: 1 }).toISOString(), 0.08],
      ["a year", sub(new Date(), { years: 1 }).toISOString(), 1],
      ["a decade", sub(new Date(), { years: 10 }).toISOString(), 10],
    ] as const) {
      await it(`calculates ${title}`, () => {
        expect(calculatePulse(latest)).toBeCloseTo(expected, 2);
      });
    }
  });
});
