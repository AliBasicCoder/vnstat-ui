const { Dir, File } = require("fs-pro");
const homedir = require("os").homedir();

const vnstatDir = new Dir(homedir, "vnstat-ui");
const configFile = new File(homedir, "vnstat-ui/vnstat-ui-data.json");
if (vnstatDir.exits()) process.exit();
configFile.write(new File(__dirname, "config.json").json());
vnstatDir.create();
vnstatDir.createDir("themes");
