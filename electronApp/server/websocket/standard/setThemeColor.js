const { app } = require("electron")
const paramsValid = require("@/core/base/ParamsValid")
const { updateStore } = require("@/electronApp/store");

module.exports = async (payload) => {
    const { themeColor } = payload;
    if (themeColor) {
        paramsValid.validRGB(themeColor, 'themeColor');
    }
    await updateStore('themeColor', themeColor || null);
    app._win.webContents.send("setThemeColorSuccess");
    return true
};
