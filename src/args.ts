import { parseArgs } from "node:util";

import { camelCase } from "lodash-es";

import { type Args } from "./types.ts";

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
        type: "string",
      },
      "threshold-major-individual": {
        type: "string",
      },
      "threshold-minor-collective": {
        type: "string",
      },
      "threshold-minor-individual": {
        type: "string",
      },
      "threshold-patch-collective": {
        type: "string",
      },
      "threshold-patch-individual": {
        type: "string",
      },
    },
  });

  return Object.fromEntries<boolean | string>(
    Object.entries(values).map(([key, value]) => [camelCase(key), value]),
  );
};
