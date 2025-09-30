const { app, globalShortcut } = require("electron");

module.exports = () => {
    const win = app._win;
    globalShortcut.register("CommandOrControl+R", () => {
        win.webContents.reload();
    });
    globalShortcut.register("CommandOrControl+Shift+I", () => {
        win.webContents.openDevTools();
    });
};
