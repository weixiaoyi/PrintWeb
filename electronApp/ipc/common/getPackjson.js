const {app} = require("electron");
const json = require("../../../package.json");

module.exports = async () => {
    // package.json
    app._win.webContents.send("getPackJsonSuccess", json);
};
