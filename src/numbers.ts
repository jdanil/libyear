export const clipFloat = (x: number): number =>
  Number.parseFloat(Number(x).toFixed(2));

export const printFloat = (x: number): string => clipFloat(x).toString();

export const safeParseInt = (x?: string): number | undefined =>
  x != null ? Number.parseInt(x) : undefined;
