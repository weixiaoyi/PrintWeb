const { shell } = require("electron");
const paramsValid = require("@/core/base/ParamsValid")

module.exports = async (req, res, next) => {
    try {
        paramsValid.validString(req.body.path, 'req.body.path')
        await paramsValid.validLocalFileIsExist(req.body.path, 'req.body.path');
        shell.showItemInFolder(req.body.path);
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
