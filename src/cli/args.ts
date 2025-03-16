import { parseArgs } from "node:util";

import { camelCase } from "lodash-es";

import { type Args } from "../types.ts";

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
      "threshold-drift-collective": {
        short: "D",
        type: "string",
      },
      "threshold-drift-individual": {
        short: "d",
        type: "string",
      },
      "threshold-pulse-collective": {
        short: "P",
        type: "string",
      },
      "threshold-pulse-individual": {
        short: "p",
        type: "string",
      },
      "threshold-releases-collective": {
        short: "R",
        type: "string",
      },
      "threshold-releases-individual": {
        short: "r",
        type: "string",
      },
      "threshold-major-collective": {
        short: "X",
        type: "string",
      },
      "threshold-major-individual": {
        short: "x",
        type: "string",
      },
      "threshold-minor-collective": {
        short: "Y",
        type: "string",
      },
      "threshold-minor-individual": {
        short: "y",
        type: "string",
      },
      "threshold-patch-collective": {
        short: "Z",
        type: "string",
      },
      "threshold-patch-individual": {
        short: "z",
        type: "string",
      },
    },
  });

  return Object.fromEntries<boolean | string>(
    Object.entries(values).map(([key, value]) => [camelCase(key), value]),
  );
};
