import { test, describe } from "node:test";
import assert from "node:assert";
import { filterDependencies } from "./filter.ts";
import type { Dependency } from "./types.ts";

const mockDependencies: Dependency[] = [
  {
    dependency: "@types/node",
    drift: 0,
    pulse: 0.01,
    releases: 0,
    major: 0,
    minor: 0,
    patch: 0,
  },
  {
    dependency: "eslint",
    drift: 0,
    pulse: 0.02,
    releases: 0,
    major: 0,
    minor: 0,
    patch: 0,
  },
  {
    dependency: "typescript",
    drift: 0,
    pulse: 0,
    releases: 0,
    major: 0,
    minor: 0,
    patch: 0,
  },
  {
    dependency: "@types/lodash-es",
    drift: 0,
    pulse: 1.77,
    releases: 0,
    major: 0,
    minor: 0,
    patch: 0,
  },
];

describe("filterDependencies", () => {
  test("returns all dependencies when no filters are provided", () => {
    const result = filterDependencies(mockDependencies);
    assert.deepStrictEqual(result, mockDependencies);
  });

  test("filters by include pattern", () => {
    const result = filterDependencies(mockDependencies, ["^@types/"]);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0]!.dependency, "@types/node");
    assert.strictEqual(result[1]!.dependency, "@types/lodash-es");
  });

  test("filters by multiple include patterns", () => {
    const result = filterDependencies(mockDependencies, [
      "^@types/",
      "^eslint",
    ]);
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0]!.dependency, "@types/node");
    assert.strictEqual(result[1]!.dependency, "eslint");
    assert.strictEqual(result[2]!.dependency, "@types/lodash-es");
  });

  test("filters by exclude pattern", () => {
    const result = filterDependencies(mockDependencies, undefined, [
      "^@types/",
    ]);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0]!.dependency, "eslint");
    assert.strictEqual(result[1]!.dependency, "typescript");
  });

  test("filters by multiple exclude patterns", () => {
    const result = filterDependencies(mockDependencies, undefined, [
      "^@types/",
      "^eslint",
    ]);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]!.dependency, "typescript");
  });

  test("combines include and exclude patterns", () => {
    const result = filterDependencies(
      mockDependencies,
      ["^@types/"],
      ["^@types/node"],
    );
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]!.dependency, "@types/lodash-es");
  });

  test("handles exact match patterns", () => {
    const result = filterDependencies(mockDependencies, ["^typescript$"]);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]!.dependency, "typescript");
  });

  test("handles simple patterns", () => {
    const result = filterDependencies(mockDependencies, ["typescript"]);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]!.dependency, "typescript");
  });

  test("handles empty include array", () => {
    const result = filterDependencies(mockDependencies, [], ["^@types/"]);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0]!.dependency, "eslint");
    assert.strictEqual(result[1]!.dependency, "typescript");
  });

  test("handles empty exclude array", () => {
    const result = filterDependencies(mockDependencies, ["^@types/"], []);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0]!.dependency, "@types/node");
    assert.strictEqual(result[1]!.dependency, "@types/lodash-es");
  });
});
