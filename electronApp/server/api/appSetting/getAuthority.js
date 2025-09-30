const {app} = require("electron");

module.exports = async (req, res, next) => {
    try {
        return res.json({
            data: app._authority || {
                status: 0,
            },
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
