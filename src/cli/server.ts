import merge from "merge";
import unflatten from "unflatten";
import * as formatJson from "format-json";
import { flatten } from "flatten-anything";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import {
  configFile,
  htmlFile,
  configureHtmlFile,
  dateToStr,
  method,
  statusCode,
  themes,
} from "./shared";
import { execSync as exec } from "child_process";
import { FullConfig, obj } from "vnstat-ui-deps";
import { join } from "path";

// __dirname is the assets folder
const app = Object.assign(express(), { debug: false });

app.use(bodyParser.json());

app.use(compression());

app.use((req, res, next) => {
  const { statusCode: stc } = res;
  const { method: mth } = req;
  if (app.debug) {
    console.log(
      `[${dateToStr(new Date())}] ${method(mth)} ${statusCode(stc)} ${req.url}`
    );
  }
  next();
});

app.use("/assets", express.static(__dirname));

app.get("/api/config", (req, res) => {
  res.json(configFile.json<FullConfig<any>>());
});

app.get("/api/interfaces_list", (req, res) => {
  const { config } = configFile.json<FullConfig<any>>();
  res.json(
    exec(`${config.server.vnstatBin} --iflist`)
      .toString()
      .slice(22)
      .split(" ")
      .slice(0, -1)
  );
});

app.get("/api/data", (req, res) => {
  const { config } = configFile.json<FullConfig<any>>();
  res.json(JSON.parse(exec(`${config.server.vnstatBin} --json`).toString()));
});

app.get("/", (req, res) => {
  res.sendFile(htmlFile.path);
});

app.get("/configure", (req, res) => {
  res.sendFile(configureHtmlFile.path);
});

app.post("/api/change_config", (req, res) => {
  const { body } = req;
  const data = configFile.json<FullConfig<any>>();
  const configObj: obj<any> = flatten(data.config);
  const propNames = Object.getOwnPropertyNames(body);
  for (let i = 0; i < propNames.length; i++) {
    const propName = propNames[i];
    if (body[propName] === null) {
      delete configObj[propName];
      delete body[propName];
    }
  }
  // @ts-ignore
  data.config = merge.recursive(unflatten(configObj), unflatten(body));
  configFile.write(formatJson.plain(data));
  res.sendStatus(200);
});

app.use("/api/themes/:interfaceName/static", (req, res, next) => {
  if (req.method === "GET") {
    res.sendFile(join(themes.path, req.params.interfaceName, req.url));
  } else next();
});

export { app as server };
