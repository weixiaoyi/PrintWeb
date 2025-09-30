const {app} = require("electron");

module.exports = async () => {
    if (app.port) {
        app._win.webContents.send("getInitPortSuccess", app.port);
    } else {
        app._win.webContents.send("getInitPortFail", app.port);
    }
};
