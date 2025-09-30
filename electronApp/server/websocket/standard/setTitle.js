const { app } = require("electron")
const paramsValid = require("@/core/base/ParamsValid")
const { updateStore } = require("@/electronApp/store");

module.exports = async (payload) => {
    const { title } = payload;
    if (title) {
        paramsValid.validString(title, 'title');
    }
    await updateStore('title', title || null);
    app._win.webContents.send("setTitleSuccess");
    return true
};
