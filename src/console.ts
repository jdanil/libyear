import { Console, log } from "node:console";
import { Transform } from "node:stream";

import terminalLink from "terminal-link";

import { PACKAGE_NAME_REGEXP } from "./constants.ts";

const transform = new Transform({
  transform(chunk, _encoding, callback) {
    callback(null, chunk);
  },
});

const logger = new Console({ stdout: transform });

/**
 * Transforms the output of console.table()
 * to remove the index column,
 * strip quotes from strings,
 * add hyperlinks,
 * and add footer.
 */
export const table = (data: unknown) => {
  logger.table(data);

  const table = (transform.read() as Buffer)?.toString() ?? "";
  const rows = table.trim().split(/[\r\n]+/);

  log(
    rows
      .reduce((accumulator, row, index) => {
        // remove index column
        row = row
          .replace(/[^┬]*┬/, "┌")
          .replace(/^├─*┼/, "├")
          .replace(/│[^│]*/, "")
          .replace(/^└─*┴/, "└");

        // strip quotes from strings
        row = row.replace(/'/g, " ");

        // add hyperlink
        if (index > 1 && index < rows.length - 2) {
          const dependency = row
            .match(new RegExp(`│\\s*(${PACKAGE_NAME_REGEXP.source})\\s*│`))
            ?.at(1);
          if (dependency != null) {
            row = row.replace(
              dependency,
              terminalLink(dependency, `https://npm.im/${dependency}`),
            );
          }
        }

        // add footer
        if (index === rows.length - 2) {
          row = `${[...row.replace(/^│/, "├").replace(/│$/, "┤")]
            .map((character) => {
              switch (character) {
                case "│":
                  return "┼";
                case "├":
                case "┤":
                  return character;
                default:
                  return "─";
              }
            })
            .join("")}\n${row}`;
        }

        return `${accumulator}${row}\n`;
      }, "")
      .trim(),
  );
};
