import { styleText as nodeStyleText } from "node:util";

// TODO[engine:node@>=20.12.0]: drop chalk
import {
  default as chalk,
  type BackgroundColorName,
  type ForegroundColorName,
  type ModifierName,
} from "chalk";

export const styleText = (
  format: BackgroundColorName | ForegroundColorName | ModifierName,
  text: string,
): string => {
  if (nodeStyleText != null) {
    switch (format) {
      case "overline":
        return nodeStyleText("overlined", text);
      default:
        return nodeStyleText(format, text);
    }
  } else {
    return chalk[format](text);
  }
};
