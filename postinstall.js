const { Dir, File } = require("fs-pro");
const homedir = require("os").homedir();

const vnstatDir = new Dir(homedir, "vnstat-ui");
if (vnstatDir.exits()) process.exit();
const configFile = new File(homedir, "vnstat-ui/vnstat-ui-data.json");
vnstatDir.create();
vnstatDir.createDir("themes");
configFile.write(new File(__dirname, "config.json").json());
