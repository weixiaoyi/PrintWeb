const { app } = require("electron")
const paramsValid = require("@/core/base/ParamsValid")
const { updateStore } = require("@/electronApp/store");

module.exports = async (payload) => {
    const { html } = payload;
    if (html) {
        paramsValid.validString(html, 'html');
    }
    await updateStore('contactUsTabInnerHtml', html || null);
    app._win.webContents.send("setContactUsTabInnerHtmlSuccess");
    return true
};
