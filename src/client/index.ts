import { ThemeData, getConfig, getStatic } from "vnstat-ui-deps";

window.onload = async () => {
  const config = await (await getConfig<any>()).config.client;
  const themeData = await getStatic<ThemeData>(config.theme, "data.json");
  const html = await getStatic<string>(config.theme, themeData.htmlFile);

  document.body.innerHTML = html;

  themeData.cssFiles?.forEach((cssFile) => {
    const link = document.createElement("link");
    link.type = "text/css";
    link.href = cssFile.startsWith("http")
      ? cssFile
      : `/api/themes/${config.theme}/static/${cssFile}`;
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
  });

  themeData.jsFiles.forEach((jsFile) => {
    const script = document.createElement("script");
    script.src = jsFile.startsWith("http")
      ? jsFile
      : `/api/themes/${config.theme}/static/${jsFile}`;
    document.body.appendChild(script);
  });

  return;
};
