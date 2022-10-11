import {expect, it} from '@jest/globals';
import { getReleaseTime } from "../release-time";

it("returns expected data for @types/debounce", () => {
  const result = getReleaseTime('npm', '@types/debounce')

  expect(result).toBe(true);
})
