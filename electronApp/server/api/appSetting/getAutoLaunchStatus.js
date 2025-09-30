const { app } = require("electron");

module.exports = async (req, res, next) => {
    try {
        const status = app.getLoginItemSettings();
        const findApp = status?.launchItems?.find(one => one.name === app.getName());
        return res.json({
            data: !!findApp?.enabled,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
