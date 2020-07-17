import express, { Express, Request, Response } from "express";
import * as path from "path";
import chalk from "chalk";
import compression from "compression";
import * as os from "os";
import { File, Dir } from "fs-pro";

const homedir: string = os.homedir();

export const configFile = new File(homedir, "vnstat-ui/vnstat-ui-data.json");

// __dirname is the assets folder

export const htmlFile = new File(__dirname, "index.html");

export const configureHtmlFile = new File(__dirname, "configure.html");

export const themes = new Dir(homedir, "vnstat-ui/themes");

export const useCompression = (app: Express) =>
  app.use(compression({ filter: shouldCompress }));

type LoggerFunction = (app: Express) => void;

interface Logger extends LoggerFunction {
  enabled: boolean;
  enable: () => void;
}

export const logger: Logger = Object.assign(
  (app: Express) => {
    app.use((req, res, next) => {
      const { statusCode: stc } = res;
      const { method: mth } = req;
      if (logger.enabled) {
        console.log(
          `[${dateToStr(new Date())}] ${method(mth)} ${statusCode(stc)} ${
            req.url
          }`
        );
      }
      next();
    });
  },
  {
    enabled: false,
    enable() {
      logger.enabled = true;
    },
  }
);

function shouldCompress(req: Request, res: Response) {
  if (req.headers["x-no-compression"]) return false;
  return compression.filter(req, res);
}

function method(str: string) {
  if (str === "GET") return chalk.green(str);
  else return chalk.red(str);
}

function statusCode(code: number) {
  if ((code >= 100 && code < 200) || (code >= 300 && code <= 400)) {
    return chalk.yellow(code);
  }
  if (code >= 200 && code < 300) return chalk.green(code);
  if (code >= 400) return chalk.red(code);
}

function dateToStr(date: Date) {
  const str = date.toLocaleString().replace(",", "");
  return chalk.red(str);
}
