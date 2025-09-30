const { app } = require("electron");

module.exports = async (req, res, next) => {
    try {
        return res.json({
            data: app._lang,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
