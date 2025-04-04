import { parseArgs } from "node:util";

import { camelCase } from "lodash-es";

import type { Args } from "../types.ts";

export const getArgs = (): Args => {
  const args = process.argv.slice(2);

  const { values } = parseArgs({
    args,
    options: {
      all: {
        type: "boolean",
      },
      config: {
        type: "string",
      },
      help: {
        short: "h",
        type: "boolean",
      },
      json: {
        type: "boolean",
      },
      "limit-drift-collective": {
        short: "D",
        type: "string",
      },
      "limit-drift-individual": {
        short: "d",
        type: "string",
      },
      "limit-pulse-collective": {
        short: "P",
        type: "string",
      },
      "limit-pulse-individual": {
        short: "p",
        type: "string",
      },
      "limit-releases-collective": {
        short: "R",
        type: "string",
      },
      "limit-releases-individual": {
        short: "r",
        type: "string",
      },
      "limit-major-collective": {
        short: "X",
        type: "string",
      },
      "limit-major-individual": {
        short: "x",
        type: "string",
      },
      "limit-minor-collective": {
        short: "Y",
        type: "string",
      },
      "limit-minor-individual": {
        short: "y",
        type: "string",
      },
      "limit-patch-collective": {
        short: "Z",
        type: "string",
      },
      "limit-patch-individual": {
        short: "z",
        type: "string",
      },
      "package-manager": {
        type: "string",
      },
      quiet: {
        short: "q",
        type: "boolean",
      },
      sort: {
        type: "string",
      },
    },
  });

  return Object.fromEntries<boolean | string>(
    Object.entries(values).map(([key, value]) => [camelCase(key), value]),
  );
};
