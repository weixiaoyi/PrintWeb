const { app } = require("electron")
const paramsValid = require("@/core/base/ParamsValid")
const { updateStore } = require("@/electronApp/store");

module.exports = async (payload) => {
    const { tabsVisibility } = payload;
    if (tabsVisibility) {
        paramsValid.validArrayWithLength(tabsVisibility, 'tabsVisibility');
        paramsValid.validArrayObject(tabsVisibility, 'tabsVisibility');
        tabsVisibility.forEach((value, index) => {
            paramsValid.validObjectHasProperty(value, `tabsVisibility[${index}]`, ['name', 'visible']);
            paramsValid.validArrayEnums(value.name, `tabsVisibility[${index}].name`, ['BasicInfo', 'Printers', 'Logs', 'Run Example', 'ContactUs']);
            paramsValid.validArrayEnums(value.visible, `tabsVisibility[${index}].visible`, [true, false])
        })
    }
    await updateStore('tabsVisibility', tabsVisibility || null)
    app._win.webContents.send("switchTabsVisibilitySuccess");
    return true
};
