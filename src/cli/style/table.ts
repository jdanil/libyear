import { stripVTControlCharacters } from "node:util";

import terminalLink from "terminal-link";

import { styleText } from "./text.ts";

type Schema = Record<string, number>;

type Metadata = { format?: Parameters<typeof styleText>[0]; href?: string };

type Cell = unknown;

type Row = Record<string, Cell>;

type Table = Array<Row>;

const compact = process.stdout.columns < 110;
const cellSeparator = compact ? " " : " │ ";
const rowStart = compact ? "" : "│ ";
const rowEnd = compact ? "" : " │";

const styleCell = (cell: Cell, length: number): string => {
  const { format, href, value } =
    typeof cell === "object"
      ? (cell as { value: unknown } & Metadata)
      : { value: cell };

  let text = String(value);

  if (href) {
    text = terminalLink(text, href, { fallback: false });
  }

  const maxLength =
    length + (text.length - stripVTControlCharacters(text).length);

  switch (typeof value) {
    case "number":
      text = text.padStart(maxLength, " ");
      break;
    default:
      text = text.padEnd(maxLength, " ");
  }

  if (format) {
    text = styleText(format, text);
  }

  return text;
};

const styleRow = (cells: string[]) =>
  `${rowStart}${cells.join(cellSeparator)}${rowEnd}`;

const styleBodyRow = (data: Row, schema: Schema): string =>
  styleRow(
    Object.entries(data).map(([key, cell]) =>
      styleCell(cell, schema[key] ?? 0),
    ),
  );

const styleHeaderRow = (schema: Schema) =>
  styleRow(
    Object.entries(schema).map(([key, value]) => key.padEnd(value, " ")),
  );

const styleDivider = (type: "top" | "middle" | "bottom", schema: Schema) => {
  const spacer = "─";
  const [start, middle, end] = compact
    ? (["", "─", ""] as const)
    : {
        top: ["┌", "┬", "┐"] as const,
        middle: ["├", "┼", "┤"] as const,
        bottom: ["└", "┴", "┘"] as const,
      }[type];

  return `${start}${Object.values(schema)
    .map((length) => spacer.repeat(length + (cellSeparator.length - 1)))
    .join(middle)}${end}`;
};

export const styleTable = (data: Table): string => {
  const schema: Schema = {};

  data.forEach((row) => {
    Object.entries(row).forEach(([key, cell]) => {
      schema[key] = Math.max(
        schema[key] ?? 0,
        key.length,
        String((cell as { value: unknown })?.value ?? cell).length,
      );
    });
  });

  return [
    styleDivider("top", schema),
    styleHeaderRow(schema),
    styleDivider("middle", schema),
    ...data
      .map((row) => styleBodyRow(row, schema))
      .toSpliced(data.length - 1, 0, styleDivider("middle", schema)),
    styleDivider("bottom", schema),
  ].join("\n");
};
