const { shell } = require("electron");

module.exports = async (req, res, next) => {
    try {
        shell.openPath(req.body.path);
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
