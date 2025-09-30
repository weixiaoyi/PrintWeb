const { app } = require("electron");

module.exports = async (req, res, next) => {
    try {
        app._win.webContents.openDevTools();
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
