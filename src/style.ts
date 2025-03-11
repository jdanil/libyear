import { styleText } from "node:util";

// TODO[engine:node@>=20.12.0]: drop chalk
import { default as chalk } from "chalk";

export const style = (
  text: string,
  format:
    | "bold"
    | "cyan"
    | "error"
    | "info"
    | "magenta"
    | "success"
    | "warning",
): string => {
  if (styleText != null) {
    switch (format) {
      case "bold":
        return styleText("bold", text);
      case "cyan":
        return styleText("cyan", text);
      case "error":
        return styleText("red", text);
      case "info":
        return styleText("blue", text);
      case "magenta":
        return styleText("magenta", text);
      case "success":
        return styleText("green", text);
      case "warning":
        return styleText("yellow", text);
      default:
        return text;
    }
  } else {
    let styler;

    switch (format) {
      case "bold":
        styler = chalk.bold;
        break;
      case "cyan":
        styler = chalk.cyan;
        break;
      case "error":
        styler = chalk.red;
        break;
      case "info":
        styler = chalk.blue;
        break;
      case "magenta":
        styler = chalk.magenta;
        break;
      case "success":
        styler = chalk.green;
        break;
      case "warning":
        styler = chalk.yellow;
        break;
    }

    return styler(text);
  }
};
