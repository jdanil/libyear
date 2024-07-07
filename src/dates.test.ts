import { describe, expect, it } from "@jest/globals";
import { add, sub } from "date-fns";

import { calculateDrift, calculatePulse } from "./dates.js";

const EPOCH = "1970-01-01T00:00:00.000Z";

describe("dates", () => {
  describe("calculateDrift", () => {
    it.each([
      ["same time", EPOCH, EPOCH, 0],
      ["a day", EPOCH, add(EPOCH, { days: 1 }).toISOString(), 0],
      ["a week", EPOCH, add(EPOCH, { weeks: 1 }).toISOString(), 0.02],
      ["a month", EPOCH, add(EPOCH, { months: 1 }).toISOString(), 0.08],
      ["a year", EPOCH, add(EPOCH, { years: 1 }).toISOString(), 1],
      ["a decade", EPOCH, add(EPOCH, { years: 10 }).toISOString(), 10],
    ])("calculates %s", (_title, current, latest, expected) => {
      expect(calculateDrift(current, latest)).toBeCloseTo(expected, 2);
    });
  });

  describe("calculatePulse", () => {
    it.each([
      ["same time", new Date().toISOString(), 0],
      ["a day", sub(new Date(), { days: 1 }).toISOString(), 0],
      ["a week", sub(new Date(), { weeks: 1 }).toISOString(), 0.02],
      ["a month", sub(new Date(), { months: 1 }).toISOString(), 0.08],
      ["a year", sub(new Date(), { years: 1 }).toISOString(), 1],
      ["a decade", sub(new Date(), { years: 10 }).toISOString(), 10],
    ])("calculates %s", (_title, latest, expected) => {
      expect(calculatePulse(latest)).toBeCloseTo(expected, 2);
    });
  });
});
