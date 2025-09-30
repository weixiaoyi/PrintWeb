module.exports = async () => {
    await require("./loadLanguage")();
    await require("./ensureRequiredDir")();
    require("./globalShortCut")();
    require("./createTray").createTray();
    await require("./loadAuthority")();
};
