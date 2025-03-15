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
 * to remove the index column
 * and strip quotes from strings.
 */
export const table = (data: unknown) => {
  logger.table(data);

  const table = (transform.read() as Buffer)?.toString() ?? "";

  log(
    table
      .split(/[\r\n]+/)
      .reduce(
        (accumulator, row) =>
          (accumulator += `${row
            .replace(/[^┬]*┬/, "┌")
            .replace(/^├─*┼/, "├")
            .replace(/│[^│]*/, "")
            .replace(/^└─*┴/, "└")
            .replace(/'/g, " ")}\n`),
        "",
      )
      .trim(),
  );
};

export { error, log };
