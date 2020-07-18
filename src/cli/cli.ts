import program = require("commander");
import { execSync as exec } from "child_process";
import extract from "extract-zip";
import fetch from "node-fetch";
import { File, Dir } from "fs-pro";
import symlink from "symlink-dir";
import { join } from "path";
import { unlinkSync, lstatSync } from "fs";
import { configFile, themes as themesDir, log } from "./shared";
import { server } from "./server";
import { FullConfig } from "vnstat-ui-deps";

const start = Date.now();

const DoneLog = () => log(`Done in {green ${Date.now() - start + "ms"}`);

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
    server.debug = debug;
    const { port } = configFile.json<FullConfig<any>>().config.server;
    const portIndex = findArgsInd("--port");
    const realPort =
      portIndex !== -1 ? Number(program.args[portIndex + 1]) : port;
    const portStr = realPort === 80 ? "" : `:${realPort}`;

    server.listen(realPort, () =>
      log(`server started at {green http://localhost${portStr}/}`)
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
      const nameDev = `${name}-dev`;
      console.log(`Installing Dev Theme ${name} as ${nameDev}`);
      await symlink(dataFile.directory, join(themesDir.path, nameDev));
      const config = configFile.json<FullConfig<any>>();
      config.themes[nameDev] = {
        type: "dev",
        name: nameDev,
        version: "*",
      };
      config.config.client.themesConfig[nameDev] = {};
      configFile.write(config);
      return;
    }
    if (theme.startsWith("npm:")) {
      log("installing theme via {red npm}...");
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
      log(`{green Downloading} theme ${repo} from {bgWhite.black github}`);
      const repoZipUrl = `https://codeload.github.com/${owner}/${repo}/zip/master`;
      const zipFile = new File(themesDir.path, repo);
      zipFile.write(await (await fetch(repoZipUrl)).buffer());
      await extract(zipFile.path, { dir: join(themesDir.path) });
      zipFile.delete();
      new Dir(themesDir.path, `${repo}-master`).rename(repo);
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
      log(`{red Error} Theme not installed`);
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
