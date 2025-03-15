import { Console, log } from "node:console";
import { Transform } from "node:stream";

import terminalLink from "terminal-link";

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
 * and add hyperlinks.
 */
export const table = (data: unknown) => {
  logger.table(data);

  const table = (transform.read() as Buffer)?.toString() ?? "";

  log(
    table
      .split(/[\r\n]+/)
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
        if (index > 1) {
          const dependency = row.match(/│\s*([@\w\d/-]+)\s*│/i)?.at(1);
          if (dependency != null) {
            row = row.replace(
              dependency,
              terminalLink(dependency, `https://npm.im/${dependency}`),
            );
          }
        }

        return `${accumulator}${row}\n`;
      }, "")
      .trim(),
  );
};
