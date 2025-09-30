const { app } = require("electron");

module.exports = async (req, res, next) => {
    try {
        const { status } = req.body
        app.setLoginItemSettings({
            openAtLogin: !!status,
            name: app.getName(),
            serviceName: app.getName(),
        });
        return res.json({
            data: true,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
