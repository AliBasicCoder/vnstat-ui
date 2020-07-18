import chalk from "chalk";
import * as os from "os";
import { File, Dir } from "fs-pro";

/** logs with colors */
export function log(str: string) {
  console.log(chalk`${str}`);
}

// __dirname is the assets folder
const homedir: string = os.homedir();

export const configFile = new File(homedir, "vnstat-ui/vnstat-ui-data.json");

export const htmlFile = new File(__dirname, "index.html");

export const configureHtmlFile = new File(__dirname, "configure.html");

export const themes = new Dir(homedir, "vnstat-ui/themes");

export function method(str: string) {
  if (str === "GET") return chalk.green(str);
  else return chalk.red(str);
}

export function statusCode(code: number) {
  if ((code >= 100 && code < 200) || (code >= 300 && code <= 400)) {
    return chalk.yellow(code);
  }
  if (code >= 200 && code < 300) return chalk.green(code);
  if (code >= 400) return chalk.red(code);
}

export function dateToStr(date: Date) {
  const str = date.toLocaleString().replace(",", "");
  return chalk.red(str);
}
