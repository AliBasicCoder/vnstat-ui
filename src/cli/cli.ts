import program = require("commander");
import chalk from "chalk";
import { execSync as exec } from "child_process";
import extract from "extract-zip";
import fetch from "node-fetch";
import { File, Dir } from "fs-pro";
import symlink from "symlink-dir";
import { join } from "path";
import { unlinkSync, lstatSync } from "fs";
import { configFile, themes as themesDir } from "./extra";
import { server } from "./server";
import { FullConfig } from "vnstat-ui-deps";

const start = Date.now();

const DoneLog = () =>
  console.log(`Done in ${chalk.green(Date.now() - start + "ms")}`);

const findArgs = (...args: string[]): boolean => {
  for (let i = 0; i < args.length; i++) {
    const ind = program.args.indexOf(args[i]);
    if (ind !== -1) return true;
  }
  return false;
};

const findArgsInd = (...args: string[]): number => {
  for (let i = 0; i < args.length; i++) {
    const ind = program.args.indexOf(args[i]);
    if (ind !== -1) return ind;
  }
  return -1;
};

program
  .command("start")
  .option("-d, --debug", "show extra info")
  .option("--port <port>", "run on some port")
  .description("starts the server")
  .action(() => {
    const debug = findArgs("-d", "--debug");
    const app = server({ debug });
    const { port } = configFile.json<FullConfig<any>>().config.server;
    const portInd = findArgsInd("--port");
    const realPort = portInd !== -1 ? Number(program.args[portInd + 1]) : port;
    const portStr = realPort === 80 ? "" : `:${realPort}`;

    app.listen(realPort, () =>
      console.log(
        `server started at ${chalk.green("http://localhost" + portStr + "/")}`
      )
    );
  });

const themes = program.command("themes").description("work with themes");

themes
  .command("install <theme>")
  .option("-d, --dev", "install directory as a development version")
  .description("installs a command")
  .action(async (theme: string) => {
    process.on("exit", DoneLog);
    if (findArgs("-d", "--dev")) {
      const dataFile = new File(process.cwd(), theme, "data.json");
      const { name } = dataFile.json();
      console.log(`Installing Dev Theme ${name} as ${name}-dev`);
      const r = await symlink(
        dataFile.directory,
        join(themesDir.path, `${name}-dev`)
      );
      r.warn && console.log(chalk.yellow("WARN: " + r.warn));
      const config = configFile.json<FullConfig<any>>();
      config.themes[`${name}-dev`] = {
        type: "dev",
        name: `${name}-dev`,
        version: "*",
      };
      config.config.client.themesConfig[`${name}-dev`] = {};
      configFile.write(config);
      return;
    }
    if (theme.startsWith("npm:")) {
      console.log(`installing theme via ${chalk.red("npm")}...`);
      exec(`npm i -g ${theme}`);
      const npmGlobalBinPath = exec("npm root -g").toString().split("\n")[0];
      const themeName = theme.replace("npm:", "");
      const themePath = join(npmGlobalBinPath, themeName);
      await symlink(themePath, join(themesDir.path, themeName));
      const config = configFile.json<FullConfig<any>>();
      config.themes[themeName] = {
        type: "npm",
        name: themeName,
        version: "*",
      };
      config.config.client.themesConfig[themeName] = {};
      configFile.write(config);
    }
    if (theme.startsWith("github:")) {
      const themeName = theme.replace("github:", "");
      const ind = themeName.indexOf("/");
      const owner = themeName.slice(0, ind);
      const repo = themeName.slice(ind + 1);
      console.log(
        `${chalk.green("Downloading")} theme ${repo} from ${chalk.bgWhite.black(
          "github"
        )}`
      );
      const repoZipUrl = `https://codeload.github.com/${owner}/${repo}/zip/master`;
      const zipFile = new File(themesDir.path, repo);
      zipFile.write(await (await fetch(repoZipUrl)).buffer());
      await extract(zipFile.path, { dir: join(themesDir.path) });
      zipFile.delete();
      const extractedDir = new Dir(themesDir.path, `${repo}-master`);
      extractedDir.rename(repo);
      const config = configFile.json<FullConfig<any>>();
      config.themes[repo] = {
        type: "github",
        name: repo,
        // @ts-ignore
        owner,
        version: "*",
      };
      config.config.client.themesConfig[repo] = {};
      configFile.write(config);
    }
  });

themes
  .command("remove <theme>")
  .description("uninstalls a theme")
  .action((theme: string) => {
    const config = configFile.json<FullConfig<any>>();
    if (!config.themes[theme]) {
      console.log(`${chalk.red("Error")} Theme not installed`);
      return;
    }
    const themeDir = new Dir(themesDir.path, theme);
    if (lstatSync(themeDir.path).isSymbolicLink()) unlinkSync(themeDir.path);
    else themeDir.delete();
    delete config.themes[theme];
    delete config.config.client.themesConfig[theme];
    configFile.write(config);
  });

program.parse();
