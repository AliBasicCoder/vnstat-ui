// @ts-ignore
import merge from "merge";
import axios from "axios";
import { getConfig, getThemeData, Types, obj } from "vnstat-ui-deps";

function repeat(callback: (i: number) => any, times: number) {
  for (let i = 0; i < times; i++) {
    callback(i);
  }
}

function querySelector<T extends Element>(query: string) {
  const el = document.querySelector<T>(query);
  if (!el) throw new Error("could not find element " + query);
  return el;
}

const showMsg = (msg: string, color?: string) => {
  const msgDiv = querySelector<HTMLDivElement>("div.msg");
  const textDiv = msgDiv.querySelector("div.msg-text");
  const hideBtn = msgDiv.querySelector("button");
  if (color) msgDiv.style.backgroundColor = color;
  msgDiv.classList.add("show");
  if (!textDiv || !hideBtn) return;
  textDiv.innerHTML = msg;
  hideBtn.onclick = () => msgDiv.classList.remove("show");
};

declare global {
  interface Window {
    toggle: Function;
    inputKeyup: Function;
    selectChange: Function;
    delParent: Function;
    modifications: obj<any>;
    save: Function;
    remove: Function;
    add: Function;
    errors: any[];
  }
}

window.modifications = {};

window.remove = (el: HTMLButtonElement) => {
  const parent = el.parentElement;
  if (!parent) return;
  const input = parent.querySelector("input");
  if (!input) return;
  window.modifications[input.dataset.key?.slice(1) || ""] = null;
  el.parentElement?.remove();
};

window.add = (el: HTMLButtonElement) => {
  const parent = el.parentElement;
  if (!parent) return;
  const optionDiv = document.createElement("div");
  const input = document.createElement("input");
  optionDiv.classList.add("option");
  input.style.float = "left";
  optionDiv.appendChild(input);
  parent.insertBefore(optionDiv, el);
  input.onkeyup = (e) => {
    if (e.code !== "Enter") return;
    const key = input.value;
    const textNode = document.createTextNode(key);
    optionDiv.appendChild(textNode);
    input.remove();
    const newInput = document.createElement("input");
    const delBtn = document.createElement("button");
    delBtn.classList.add("del-btn");
    delBtn.onclick = () => window.remove(delBtn);
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    newInput.dataset.key = el.dataset.key?.slice(0, -1) + `.${key}`;
    newInput.onkeyup = () => window.inputKeyup(newInput);
    optionDiv.appendChild(delBtn);
    optionDiv.appendChild(newInput);
    newInput.focus();
  };
  input.focus();
};

window.save = async () => {
  if (Object.keys(window.modifications).length === 0) {
    showMsg("No Changes Made");
    return;
  }
  try {
    await axios.post("/api/change_config", window.modifications);
    window.modifications = {};
    showMsg("Saved");
  } catch (error) {
    showMsg(error, "red");
  }
};

window.toggle = (btn: HTMLButtonElement) => {
  // @ts-ignore
  const el: HTMLDivElement = btn.parentElement.parentElement.querySelector(
    ".object-content"
  );
  el.style.display = el.style.display === "none" ? "block" : "none";
};

function getSelTheme() {
  return (
    window.modifications["client.theme"] ||
    window?.__cache?.config?.config?.client?.theme
  );
}

function key(dataKey?: string) {
  if (!dataKey) return "";
  let str = dataKey.slice(1);
  if (str.indexOf("themeConfig") !== -1) {
    str = str.replace("themeConfig", `themesConfig.${getSelTheme()}`);
  }
  return str;
}

window.inputKeyup = (el: HTMLInputElement) => {
  window.modifications[key(el.dataset.key)] =
    el.type === "number" ? Number(el.value) : el.value;
};

window.selectChange = (el: HTMLSelectElement) => {
  const k = key(el.dataset.key);
  window.modifications[k] =
    el.dataset.isbool === "true" ? eval(el.value) : el.value;
  if (k === "client.theme") {
    const center = querySelector("#center");
    repeat(() => center.removeChild(center.children[0]), 2);
    main();
  }
};

const objectDiv = (
  objectHeader: string,
  objectContent: string,
  width: string = "100%"
) => `
<div class="object" style="width: ${width};">
  <div class="object-header">
    <h3>${objectHeader}</h3>
    <button onclick="toggle(this)"><i class="fas fa-sort-down"></i></button>
  </div>
  <div class="object-content">
    ${objectContent}
  </div>
</div>
`;

const selectElement = (ops: string[], key: string, isbool = false) => `
<select data-key="${key}" data-isbool="${isbool}" onchange="selectChange(this, event)">
  ${ops
    .map((op) => '<option value="' + op + '">' + op + "</option>")
    .join("  \n")}
</select>
`;

const actualSwap = (arr: any[], i: number, y: number) => {
  if (i <= 0) return;
  const temp = arr[i];
  arr[i] = arr[y];
  arr[y] = temp;
};

const swap = (arr: string[], str: string) => {
  actualSwap(arr, arr.indexOf(str), 0);
  return arr;
};

const optionDiv = (right: string, left: string, removable: boolean = false) =>
  `<div class="option">${right} ${
    removable
      ? '<button class="del-btn" onclick="remove(this)"><i class="fas fa-trash"></i></button>'
      : ""
  }${left}</div>`;

const inputElement = (type: string, value: string, key: string) =>
  `<input 
type="${type}" 
value="${value}" 
data-key="${key}" 
onkeyup="inputKeyup(this, event)"
onchange="inputKeyup(this, event)" />`;

function opToHtml(
  config: obj<any>,
  options: obj<Types>,
  topKey: string = "",
  width: number = 90
): string {
  let str = "";
  const toStr = (key: string) => `${topKey}.${key}`;
  const arr = Object.entries(options).sort((a, b) => {
    if (a[1].type === "object") return 1;
    if (b[1].type === "object") return -1;
    return 0;
  });
  for (const [key, option] of arr) {
    if (key === "__any") {
      for (const key2 in config) {
        const element = config[key2];
        if (option.type === "number")
          str += optionDiv(
            key2,
            inputElement("number", element, toStr(key2)),
            true
          );
        if (option.type === "string")
          str += optionDiv(
            key2,
            inputElement("string", element, toStr(key2)),
            true
          );
      }
      str += `<button class="add-btn" data-key="${toStr(
        ""
      )}" onclick="add(this)"><i class="fas fa-plus"></i></button>`;
      continue;
    }
    if (option.type === "object")
      str += objectDiv(
        key,
        opToHtml(config[key], option.attrs, toStr(key), width - 10),
        `${width - 10}%`
      );
    if (option.type === "boolean")
      str += optionDiv(
        key,
        selectElement(
          swap(["true", "false"], String(config[key])),
          toStr(key),
          true
        )
      );
    if (option.type === "number")
      str += optionDiv(key, inputElement("number", config[key], toStr(key)));
    if (option.type === "string") {
      if (option.oneOf)
        str += optionDiv(
          key,
          `${selectElement(swap(option.oneOf, config[key]), toStr(key))}`
        );
      else str += optionDiv(key, inputElement("text", config[key], toStr(key)));
    }
  }
  return str;
}

function configType(
  installedThemes: string[],
  themeConfig: obj<Types>
): obj<Types> {
  return {
    client: {
      type: "object",
      attrs: {
        theme: {
          type: "string",
          oneOf: installedThemes,
        },
        themeConfig: {
          type: "object",
          attrs: themeConfig,
        },
      },
    },
    server: {
      type: "object",
      attrs: {
        port: {
          type: "number",
        },
        vnstatBin: {
          type: "string",
        },
      },
    },
  };
}

async function main() {
  const config = await getConfig();
  const selTheme = config.config.client.theme;
  const center = querySelector("#center");
  const installedThemes = Object.keys(config.themes);
  const { options, defaultOptions } = await getThemeData(
    window.modifications["client.theme"] || selTheme
  );
  if (window.modifications["client.theme"]) {
    config.config.client.theme = window.modifications["client.theme"];
    config.config.client.themeConfig =
      config.config.client.themesConfig[config.config.client.theme];
  }

  const obj = merge.recursive(
    {
      client: {
        theme: "default",
        themeConfig: defaultOptions,
      },
      server: {
        port: 80,
        vnstatBin: "/usr/bin/vnstat",
      },
    },
    config.config
  );
  center.innerHTML =
    opToHtml(obj, configType(installedThemes, options), "", 110) +
    center.innerHTML;
}

main();

window.delParent = (el: HTMLButtonElement) => el.parentElement?.remove();

window.onunhandledrejection = (ev: any) => {
  window.errors = window.errors || [];
  document.body.innerHTML = `
    <div class="msg show red">
      <button onclick="delParent(this)">X</button>
      <h1>Oops An Error Happened</h1>
      <p>check the console for tech details (you could access errors via errors variable)</p>
    </div>
    <div id="center">
      <button id="save-btn" onclick="save()">save</button>
    </div>
  `;
  console.log(ev);
  window.errors.push(ev);
};
