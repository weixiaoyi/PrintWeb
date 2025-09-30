const { app } = require("electron");
const paramsValid = require("@/core/base/ParamsValid");
const { updateStore } = require("@/electronApp/store");
const { updateTrayLang } = require("@/appSetting/createTray")

module.exports = async (req, res, next) => {
    try {
        const { lang } = req.body;
        paramsValid.validArrayEnums(lang, 'lang', ['cn', 'en']);
        updateStore('language', lang);
        app._lang = lang;
        updateTrayLang();
        return res.json({
            data: true,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
